// src/app/api/flow/next/route.ts
import { NextRequest, NextResponse } from "next/server";

type Locale = "fr" | "en" | "ar";
type QType = "radio" | "number" | "text";
type Option = { value: string; label: string };
type Question = { id: string; type: QType; label: string; options?: Option[] };

function t(l: Locale) {
  return {
    situation: {
      label:
        l === "en" ? "Your main situation"
        : l === "ar" ? "وضعك الرئيسي"
        : "Votre situation principale",
      asile:
        l === "en" ? "Asylum / protection"
        : l === "ar" ? "اللجوء / الحماية"
        : "Demande d’asile / protection",
      vpf:
        l === "en" ? "Private/family life"
        : l === "ar" ? "الحياة الخاصة والعائلية"
        : "Vie privée et familiale",
      travail:
        l === "en" ? "Work / employee"
        : l === "ar" ? "العمل / موظف"
        : "Travail / salarié",
    },
    years_in_france:
      l === "en" ? "How many years in France?"
      : l === "ar" ? "منذ كم سنة أنت في فرنسا؟"
      : "Depuis combien d’années en France ?",
    has_children:
      l === "en" ? "Do you have minor children in France?"
      : l === "ar" ? "هل لديك أطفال قُصّر في فرنسا؟"
      : "Avez-vous des enfants mineurs en France ?",

    // ASILE (déjà en place, V1+)
    asylum_domiciliation:
      l === "en" ? "Do you have a domiciliation / address for notifications?"
      : l === "ar" ? "هل لديك عنوان للتبليغات؟"
      : "Avez-vous une domiciliation (adresse pour les notifications) ?",
    asylum_ofii_orientation:
      l === "en" ? "Were you oriented by OFII (reception conditions)?"
      : l === "ar" ? "هل وُجّهت من OFII؟"
      : "Avez-vous été orienté par l’OFII (conditions d’accueil) ?",
    asylum_language:
      l === "en" ? "Preferred language for procedure"
      : l === "ar" ? "اللغة المفضلة للإجراءات"
      : "Langue préférée pour la procédure",
    asylum_interpreter:
      l === "en" ? "Do you need an interpreter?"
      : l === "ar" ? "هل تحتاج إلى مترجم؟"
      : "Avez-vous besoin d’un interprète ?",
    asylum_dublin:
      l === "en" ? "Were you informed of a Dublin procedure?"
      : l === "ar" ? "هل تم إبلاغك بإجراءات دبلن؟"
      : "Avez-vous été informé d’une procédure Dublin ?",
    asylum_ofpra_filed:
      l === "en" ? "Have you filed your application to OFPRA?"
      : l === "ar" ? "هل قدمت طلبك لدى OFPRA؟"
      : "Avez-vous déposé votre dossier à l’OFPRA ?",
    asylum_delay_months:
      l === "en" ? "Delay (months) between France entry and filing"
      : l === "ar" ? "الفترة (بالأشهر) بين الدخول والإيداع"
      : "Délai (mois) entre entrée en France et dépôt OFPRA",
    asylum_ofpra_decision:
      l === "en" ? "OFPRA decision"
      : l === "ar" ? "قرار OFPRA"
      : "Décision OFPRA",
    asylum_cnda_appeal:
      l === "en" ? "CNDA appeal already filed?"
      : l === "ar" ? "هل قدمت طعناً لدى CNDA؟"
      : "Recours devant la CNDA déjà déposé ?",
    asylum_vulnerable:
      l === "en" ? "Do you have vulnerabilities?"
      : l === "ar" ? "هل لديك هشاشة/ضعف؟"
      : "Présentez-vous des vulnérabilités ?",
    asylum_evidence_ready:
      l === "en" ? "Do you already have evidence for your claim?"
      : l === "ar" ? "هل لديك أدلة/وثائق؟"
      : "Avez-vous déjà des éléments de preuve ?",

    // TRAVAIL V1
    work_has_offer:
      l === "en" ? "Do you have a job offer or promise of employment?"
      : l === "ar" ? "هل لديك عرض عمل أو وعد بالتوظيف؟"
      : "Avez-vous une promesse d’embauche ou une offre d’emploi ?",
    work_years_worked:
      l === "en" ? "How many years have you worked in France (total)?"
      : l === "ar" ? "كم عدد سنوات العمل في فرنسا (إجمالي)؟"
      : "Combien d’années avez-vous travaillé en France (au total) ?",
    work_taxes_paid:
      l === "en" ? "Have you already paid income taxes in France?"
      : l === "ar" ? "هل دفعت ضرائب الدخل في فرنسا؟"
      : "Avez-vous déjà payé des impôts sur le revenu en France ?",
    work_department:
      l === "en" ? "Your department"
      : l === "ar" ? "المقاطعة (الديبارتمان)"
      : "Votre département",
    work_job_sector:
      l === "en" ? "Your job / sector (free text)"
      : l === "ar" ? "وظيفتك / قطاعك (نص حر)"
      : "Votre métier / secteur (texte libre)",
    work_tension_guess:
      l === "en" ? "Do you think your job is in shortage ('métier en tension') in your department?"
      : l === "ar" ? "هل تعتقد أن مهنتك ضمن المهن المطلوبة في مقاطعتك؟"
      : "Pensez-vous que votre métier est en tension dans votre département ?",
  };
}

function yn(): Option[] {
  return [
    { value: "yes", label: "Oui / Yes / نعم" },
    { value: "no", label: "Non / No / لا" },
  ];
}

function baseOrder(): string[] {
  return ["situation", "years_in_france", "has_children"];
}

function asylumOrder(): string[] {
  return [
    "asylum_domiciliation",
    "asylum_ofii_orientation",
    "asylum_language",
    "asylum_interpreter",
    "asylum_dublin",
    "asylum_ofpra_filed",
    "asylum_delay_months",
    "asylum_ofpra_decision",
    "asylum_cnda_appeal",
    "asylum_vulnerable",
    "asylum_evidence_ready",
  ];
}

function workOrder(): string[] {
  return [
    "work_has_offer",
    "work_years_worked",
    "work_taxes_paid",
    "work_department",
    "work_job_sector",
    "work_tension_guess",
  ];
}

function asQuestion(id: string, l: Locale): Question {
  const tt = t(l);
  switch (id) {
    case "situation":
      return {
        id, type: "radio", label: tt.situation.label,
        options: [
          { value: "asile", label: tt.situation.asile },
          { value: "vpf", label: tt.situation.vpf },
          { value: "travail", label: tt.situation.travail },
        ],
      };
    case "years_in_france":
      return { id, type: "number", label: tt.years_in_france };
    case "has_children":
      return { id, type: "radio", label: tt.has_children, options: yn() };

    // ASILE
    case "asylum_domiciliation":
      return { id, type: "radio", label: tt.asylum_domiciliation, options: yn() };
    case "asylum_ofii_orientation":
      return { id, type: "radio", label: tt.asylum_ofii_orientation, options: yn() };
    case "asylum_language":
      return { id, type: "text", label: tt.asylum_language };
    case "asylum_interpreter":
      return { id, type: "radio", label: tt.asylum_interpreter, options: yn() };
    case "asylum_dublin":
      return { id, type: "radio", label: tt.asylum_dublin, options: yn() };
    case "asylum_ofpra_filed":
      return { id, type: "radio", label: tt.asylum_ofpra_filed, options: yn() };
    case "asylum_delay_months":
      return { id, type: "number", label: tt.asylum_delay_months };
    case "asylum_ofpra_decision":
      return {
        id, type: "radio", label: tt.asylum_ofpra_decision,
        options: [
          { value: "pending", label: "En cours / Pending / جاري" },
          { value: "refused", label: "Rejet / Refused / مرفوض" },
          { value: "none", label: "Aucune / None / لا يوجد" },
        ],
      };
    case "asylum_cnda_appeal":
      return { id, type: "radio", label: tt.asylum_cnda_appeal, options: yn() };
    case "asylum_vulnerable":
      return { id, type: "radio", label: tt.asylum_vulnerable, options: yn() };
    case "asylum_evidence_ready":
      return { id, type: "radio", label: tt.asylum_evidence_ready, options: yn() };

    // TRAVAIL V1
    case "work_has_offer":
      return { id, type: "radio", label: tt.work_has_offer, options: yn() };
    case "work_years_worked":
      return { id, type: "number", label: tt.work_years_worked };
    case "work_taxes_paid":
      return { id, type: "radio", label: tt.work_taxes_paid, options: yn() };
    case "work_department":
      return { id, type: "text", label: tt.work_department };
    case "work_job_sector":
      return { id, type: "text", label: tt.work_job_sector };
    case "work_tension_guess":
      return {
        id, type: "radio", label: tt.work_tension_guess,
        options: [
          { value: "yes", label: "Oui / Yes / نعم" },
          { value: "no", label: "Non / No / لا" },
          { value: "unknown", label: "Je ne sais pas / I don't know / لا أعرف" },
        ],
      };

    default:
      return { id, type: "text", label: id };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { locale?: string; answers?: Record<string, string> };
    const l: Locale = (["fr", "en", "ar"] as const).includes((body?.locale || "fr") as Locale)
      ? ((body?.locale || "fr") as Locale)
      : "fr";

    const answers = body?.answers || {};
    const asked = new Set(Object.keys(answers));

    // 1) tronc commun
    for (const id of baseOrder()) {
      if (!asked.has(id)) return NextResponse.json({ ok: true, question: asQuestion(id, l) });
    }

    const situation = (answers["situation"] || "").toLowerCase();

    // 2) ASILE
    if (situation === "asile") {
      for (const id of asylumOrder()) {
        if ((id === "asylum_ofpra_decision" || id === "asylum_cnda_appeal") && answers["asylum_ofpra_filed"] === "no") {
          continue;
        }
        if (!asked.has(id)) return NextResponse.json({ ok: true, question: asQuestion(id, l) });
      }
    }

    // 3) TRAVAIL
    if (situation === "travail") {
      for (const id of workOrder()) {
        if (!asked.has(id)) return NextResponse.json({ ok: true, question: asQuestion(id, l) });
      }
    }

    // 4) fin
    return NextResponse.json({ ok: true, question: null });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "FLOW_NEXT_FAILED" }, { status: 500 });
  }
}


