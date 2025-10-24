// src/lib/pdf.ts
import type { Dict } from "@/i18n/get-dictionary";

/** Charge utile attendue pour générer un PDF */
export type BuildPdfPayload = {
  c: {
    id: string;
    status: "draft" | "paid" | "closed";
    createdAt: Date;
    answers: Array<{ questionId: string; value: string }>;
    // Dans la base, citations est stocké en string JSON ; on accepte string ou string[].
    decision: { pathway: string; citations: string | string[] } | null;
  };
  t: Dict;
};

/** Échappe les parenthèses pour le texte PDF */
function pdfEscape(text: string): string {
  return text.replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

/** Coupe une longue chaîne en lignes de longueur max */
function wrapText(s: string, maxLen: number): string[] {
  const out: string[] = [];
  let line = "";
  const words = s.split(/\s+/);
  for (const w of words) {
    if ((line + (line ? " " : "") + w).length <= maxLen) {
      line += (line ? " " : "") + w;
    } else {
      if (line) out.push(line);
      line = w;
    }
  }
  if (line) out.push(line);
  return out;
}

/** Construit un petit PDF (1 page) en PDF syntaxe de base (Helvetica). */
function makeSimplePdf(lines: string[]): Uint8Array {
  // Mise en page basique
  const pageWidth = 595;  // A4 largeur (pt)
  const pageHeight = 842; // A4 hauteur (pt)
  const left = 50;
  const topStart = pageHeight - 70;
  const leading = 16; // interligne

  // Contenu du flux texte
  const contentLines: string[] = [];
  let y = topStart;

  contentLines.push("BT");
  contentLines.push("/F1 12 Tf");

  for (const line of lines) {
    // Si on dépasse, on arrête (MVP: 1 page)
    if (y < 70) {
      contentLines.push("ET");
      break;
    }
    const escaped = pdfEscape(line);
    contentLines.push(`${left} ${y} Td (${escaped}) Tj`);
    y -= leading;
  }

  if (contentLines[contentLines.length - 1] !== "ET") {
    contentLines.push("ET");
  }

  const contentStream = contentLines.join("\n") + "\n";
  const contentLength = contentStream.length;

  // Objets PDF :
  // 1: Catalog
  // 2: Pages
  // 3: Page
  // 4: Font Helvetica
  // 5: Content stream
  const objects: string[] = [];

  const obj1 = `1 0 obj
<< /Type /Catalog
   /Pages 2 0 R
>>
endobj
`;

  const obj2 = `2 0 obj
<< /Type /Pages
   /Kids [3 0 R]
   /Count 1
>>
endobj
`;

  const obj3 = `3 0 obj
<< /Type /Page
   /Parent 2 0 R
   /MediaBox [0 0 ${pageWidth} ${pageHeight}]
   /Resources <<
     /Font << /F1 4 0 R >>
   >>
   /Contents 5 0 R
>>
endobj
`;

  const obj4 = `4 0 obj
<< /Type /Font
   /Subtype /Type1
   /BaseFont /Helvetica
>>
endobj
`;

  const obj5 = `5 0 obj
<< /Length ${contentLength} >>
stream
${contentStream}endstream
endobj
`;

  objects.push(obj1, obj2, obj3, obj4, obj5);

  // Assemblage avec calcul des offsets pour la xref
  const header = "%PDF-1.4\n";
  let body = "";
  const offsets: number[] = [];
  let pos = header.length;

  for (const obj of objects) {
    offsets.push(pos);
    body += obj;
    pos += obj.length;
  }

  const xrefStart = pos;
  // Table xref (5 objets + l'objet 0)
  const xrefLines: string[] = [];
  xrefLines.push("xref");
  xrefLines.push(`0 ${objects.length + 1}`);
  xrefLines.push("0000000000 65535 f "); // free object 0
  for (const off of offsets) {
    const offStr = off.toString().padStart(10, "0");
    xrefLines.push(`${offStr} 00000 n `);
  }

  const trailer = `trailer
<< /Size ${objects.length + 1}
   /Root 1 0 R
>>
startxref
${xrefStart}
%%EOF
`;

  const pdfString = header + body + xrefLines.join("\n") + "\n" + trailer;
  return new TextEncoder().encode(pdfString);
}

/** Construit la liste de lignes à imprimer dans le PDF à partir du payload */
function payloadToLines(payload: BuildPdfPayload): string[] {
  const lines: string[] = [];

  const created = payload.c.createdAt instanceof Date
    ? payload.c.createdAt.toISOString()
    : String(payload.c.createdAt);

  lines.push("Décision (MVP)");
  lines.push("------------------------------");
  lines.push(`Dossier: ${payload.c.id}`);
  lines.push(`Statut : ${payload.c.status}`);
  lines.push(`Créé le : ${created}`);

  if (payload.c.decision) {
    lines.push("");
    lines.push(`Voie retenue : ${payload.c.decision.pathway}`);
    const rawCitations = payload.c.decision.citations;
    let citations: string[] = [];
    if (Array.isArray(rawCitations)) {
      citations = rawCitations;
    } else {
      try {
        const parsed = JSON.parse(rawCitations) as unknown;
        if (Array.isArray(parsed)) {
          citations = parsed.map((x) => String(x));
        }
      } catch {
        // ignore
      }
    }
    if (citations.length > 0) {
      lines.push("Citations :");
      for (const c of citations) {
        lines.push(`- ${c}`);
      }
    }
  }

  lines.push("");
  lines.push("Vos réponses :");
  // On affiche les Q/R avec wrapping basique
  for (const a of payload.c.answers) {
    const lq = wrapText(`• ${a.questionId}: ${a.value}`, 90);
    for (const l of lq) lines.push(l);
  }

  lines.push("");
  lines.push("Note : PDF MVP (police Helvetica). Pour l’arabe, une police Unicode sera intégrée ultérieurement.");

  return lines;
}

/**
 * Génère un PDF minimal (Uint8Array) à partir du payload.
 * Pour un rendu riche (polices, arabe), on évoluera vers une lib dédiée avec police embarquée.
 */
export async function buildPdf(payload: BuildPdfPayload): Promise<Uint8Array> {
  // Construit des lignes lisibles
  const lines = payloadToLines(payload);
  // Transforme en PDF (ASCII/latin)
  const pdf = makeSimplePdf(lines);
  return pdf;
}



