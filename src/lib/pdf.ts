// src/lib/pdf.ts
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export type Dict = {
  pdf: {
    coverTitle: string;
    coverSubtitle: string;
    toc: string;
    section_summary: string;
    section_legal: string;
    section_checklist: string;
    section_next: string;
    footer_disclaimer: string;
    next_steps: string[];
  };
};

export type CaseRecord = {
  id: string;
  locale: "fr" | "en" | "ar";
  status: "draft" | "paid" | "closed";
  createdAt: Date;
  answers: { questionId: string; value: string }[];
  decision: { pathway: string | null; citations: string | null } | null;
};

type Section = { title: string; lines: string[] };
type BuildInput = { c: CaseRecord; t: Dict };

const PAGE = { marginX: 56, marginY: 56, line: 16, titleGap: 18, contentGap: 10 };

/** Remplace les caractères hors WinAnsi par '?' pour éviter les crashes pdf-lib (ex. arabe). */
function toWinAnsiSafe(s: string): string {
  if (!s) return "";
  // Remplace tout caractère > 255 par '?'
  return [...s].map((ch) => (ch.codePointAt(0)! > 0xff ? "?" : ch)).join("");
}

function wrapText(text: string, maxChars: number): string[] {
  if (!text) return [];
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    const next = current ? current + " " + w : w;
    if (next.length > maxChars) {
      if (current) lines.push(current);
      if (w.length > maxChars) {
        let rest = w;
        while (rest.length > maxChars) {
          lines.push(rest.slice(0, maxChars));
          rest = rest.slice(maxChars);
        }
        current = rest;
      } else {
        current = w;
      }
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function linesFromParagraphs(paragraphs: string[], maxChars: number): string[] {
  const out: string[] = [];
  for (const p of paragraphs) out.push(...wrapText(p, maxChars), "");
  if (out.at(-1) === "") out.pop();
  return out;
}

function checklistForPathway(
  pathway: string | null,
  locale: "fr" | "en" | "ar",
  answers: Record<string, string>
): string[] {
  const p = (pathway || "").toLowerCase();

  const yearsInFrance = Number(answers["years_in_france"] ?? answers["yearsInFrance"] ?? "0") || 0;
  const hasChildren = (answers["has_children"] ?? answers["hasChildren"] ?? "").toLowerCase() === "yes";
  const situation = (answers["situation"] ?? "").toLowerCase();
  const paysImpots = (answers["pays_taxes"] ?? answers["tax_payer"] ?? "").toLowerCase() === "yes";
  const monthsWorked = Number(answers["months_worked"] ?? answers["monthsWorked"] ?? "0") || 0;

  const t = {
    fr: {
      docIdent: "Passeport ou pièce d’identité (si disponible)",
      preuvesSejour: "Preuves de séjour en France (loyer, factures, attestations)",
      etatCivil: "État civil (avec traductions si nécessaire)",
      enfants: "Actes de naissance des enfants, certificats de scolarité",
      anciennete: (min: number) => `Preuves d’ancienneté de présence (≥ ${min} ans si possible)`,
      travail: "Preuves d’emploi (contrat, bulletins de salaire, attestation employeur)",
      ancienneteTravail: (mois: number) => `Preuves d’ancienneté de travail (≥ ${mois} mois selon le dispositif)`,
      impots: "Avis d’imposition / justificatifs fiscaux le cas échéant",
      asileDossier: "Récépissé / documents OFPRA ou CNDA",
    },
    en: {
      docIdent: "Passport or ID document (if available)",
      preuvesSejour: "Residence proofs in France (rent, bills, attestations)",
      etatCivil: "Civil status documents (translated if needed)",
      enfants: "Children birth certificates, school certificates",
      anciennete: (min: number) => `Proofs of continuous stay (≥ ${min} years if possible)`,
      travail: "Employment proofs (contract, pay slips, employer attestations)",
      ancienneteTravail: (mois: number) => `Work duration proofs (≥ ${mois} months depending on scheme)`,
      impots: "Tax notices if any",
      asileDossier: "Asylum receipt / OFPRA or CNDA documents",
    },
    ar: {
      // Texte arabe sera remplacé par '?' au rendu PDF tant qu'on n'embarque pas de police Unicode.
      docIdent: "??",
      preuvesSejour: "??",
      etatCivil: "??",
      enfants: "??",
      anciennete: (_min: number) => "??",
      travail: "??",
      ancienneteTravail: (_mois: number) => "??",
      impots: "??",
      asileDossier: "??",
    },
  }[locale];

  const out: string[] = [];
  out.push(`• ${t.docIdent}`);
  out.push(`• ${t.etatCivil}`);
  out.push(`• ${t.preuvesSejour}`);

  if (p.includes("asile") || situation === "asile") {
    out.push(`• ${t.asileDossier}`);
    if (hasChildren) out.push(`• ${t.enfants}`);
    if (yearsInFrance >= 3) out.push(`• ${t.anciennete(3)}`);
    return out;
  }

  if (p.includes("vpf") || p.includes("vie") || p.includes("familiale") || situation === "vpf") {
    if (hasChildren) out.push(`• ${t.enfants}`);
    out.push(`• ${t.anciennete(yearsInFrance >= 5 ? 5 : 3)}`);
    if (paysImpots) out.push(`• ${t.impots}`);
    return out;
  }

  // Travail (par défaut)
  out.push(`• ${t.travail}`);
  if (yearsInFrance >= 5) out.push(`• ${t.anciennete(5)}`);
  else if (yearsInFrance >= 3) out.push(`• ${t.anciennete(3)}`);
  if (monthsWorked >= 36) out.push(`• ${t.ancienneteTravail(36)}`);
  else if (monthsWorked >= 24) out.push(`• ${t.ancienneteTravail(24)}`);
  if (paysImpots) out.push(`• ${t.impots}`);
  return out;
}

export async function buildCasePdf({ c, t }: BuildInput): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const titleColor = rgb(0, 0, 0);
  const textColor = rgb(0.1, 0.1, 0.1);
  const gray = rgb(0.5, 0.5, 0.5);

  function addPage(): { pageIndex: number; y: number } {
    const page = pdf.addPage();
    const { height } = page.getSize();
    page.drawText(toWinAnsiSafe(`Dossier ${c.id} — ${new Date(c.createdAt).toLocaleDateString("fr-FR")}`), {
      x: PAGE.marginX,
      y: height - PAGE.marginY + 18,
      size: 9,
      font,
      color: gray,
    });
    return { pageIndex: pdf.getPages().length - 1, y: height - PAGE.marginY - 8 };
  }

  function drawTitle(pageIndex: number, text: string) {
    const page = pdf.getPages()[pageIndex];
    page.drawText(toWinAnsiSafe(text), {
      x: PAGE.marginX,
      y: curY - PAGE.titleGap,
      size: 18,
      font: fontBold,
      color: titleColor,
    });
    curY -= PAGE.titleGap + 10;
  }

  function drawLines(pageIndex: number, lines: string[]) {
    const page = pdf.getPages()[pageIndex];
    const { height } = page.getSize();
    for (const line of lines) {
      if (curY < PAGE.marginY + 40) {
        const n = addPage();
        pageIndex = n.pageIndex;
        curY = n.y;
      }
      page.drawText(toWinAnsiSafe(line), { x: PAGE.marginX, y: curY, size: 11, font, color: textColor });
      curY -= PAGE.line;
    }
    curY -= PAGE.contentGap;
  }

  // 1) Couverture
  let { pageIndex } = addPage();
  let curY = pdf.getPages()[pageIndex].getSize().height - PAGE.marginY - 8;
  drawTitle(pageIndex, t.pdf.coverTitle);
  drawLines(pageIndex, linesFromParagraphs([t.pdf.coverSubtitle, `Dossier : ${c.id}`, `Statut : ${c.status}`], 86));

  // 2) Sommaire
  const tocPage = pdf.addPage();
  curY = tocPage.getSize().height - PAGE.marginY - 8;
  tocPage.drawText(toWinAnsiSafe(t.pdf.toc), {
    x: PAGE.marginX,
    y: curY - PAGE.titleGap,
    size: 18,
    font: fontBold,
    color: titleColor,
  });
  curY -= PAGE.titleGap + 10;
  type TocEntry = { title: string; pageNumber: number };
  const tocEntries: TocEntry[] = [];

  // 3) Sections
  const answers = Object.fromEntries(c.answers.map((a) => [a.questionId, a.value])) as Record<string, string>;

  let citations: string[] = [];
  try {
    citations = c.decision?.citations ? (JSON.parse(c.decision.citations) as string[]) : [];
  } catch {
    citations = [];
  }

  const summary: Section = {
    title: t.pdf.section_summary,
    lines: linesFromParagraphs(
      [
        `Voie retenue (pré-orientation) : ${c.decision?.pathway ?? "—"}`,
        `Langue : ${c.locale.toUpperCase()}`,
        "",
        "Vos réponses (extrait) :",
        ...wrapText(JSON.stringify(answers, null, 2), 86),
      ],
      86
    ),
  };

  const legal: Section = {
    title: t.pdf.section_legal,
    lines: citations.length
      ? citations.flatMap((s, i) => wrapText(`${i + 1}. ${s}`, 86))
      : wrapText("Aucune référence enregistrée dans ce dossier.", 86),
  };

  const checklist: Section = {
    title: t.pdf.section_checklist,
    lines: checklistForPathway(c.decision?.pathway ?? "", c.locale, answers),
  };

  const nextSteps: Section = {
    title: t.pdf.section_next,
    lines: t.pdf.next_steps.map((s) => `• ${s}`),
  };

  const allSections: Section[] = [summary, legal, checklist, nextSteps];

  for (const sec of allSections) {
    const p = addPage();
    pageIndex = p.pageIndex;
    curY = p.y;
    drawTitle(pageIndex, sec.title);
    drawLines(pageIndex, sec.lines);
    tocEntries.push({ title: sec.title, pageNumber: pageIndex + 1 });
  }

  // 4) Remplir le sommaire
  let tocY = tocPage.getSize().height - PAGE.marginY - 8 - PAGE.titleGap - 10;
  for (const entry of tocEntries) {
    tocPage.drawText(toWinAnsiSafe(`${entry.title}  ……  ${entry.pageNumber}`), {
      x: PAGE.marginX,
      y: tocY,
      size: 11,
      font,
      color: textColor,
    });
    tocY -= PAGE.line;
  }

  // 5) Numéros de page + disclaimer
  const pages = pdf.getPages();
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const { width } = page.getSize();
    page.drawText(toWinAnsiSafe(`${i + 1} / ${pages.length}`), {
      x: width - PAGE.marginX - 40,
      y: PAGE.marginY - 30,
      size: 9,
      font,
      color: gray,
    });
    page.drawText(toWinAnsiSafe(t.pdf.footer_disclaimer), {
      x: PAGE.marginX,
      y: PAGE.marginY - 30,
      size: 9,
      font,
      color: gray,
    });
  }

  return await pdf.save();
}



