import type { Locale } from "./config";

export type Dict = {
  landing: {
    title: string;
    tagline: string;
    start: string;
    price_hint: string;
    legal_hint: string;
    features?: string[];
  };
  questions: {
    has_children: { label: string; yes: string; no: string };
    years_in_france: { label: string; placeholder: string };
    department: { label: string; placeholder: string };
    situation: {
      label: string;
      asile: string;
      vpf: string;
      travail: string;
    };
    has_job_offer: { label: string; yes: string; no: string };
    years_worked_in_france: { label: string; placeholder: string };
    payslips_last_24m: { label: string; placeholder: string };
    has_tax_returns: { label: string; yes: string; no: string };
    tension_occupation: { label: string; yes: string; no: string };
    ui: {
      back: string;
      next: string;
      see_recap: string;
      step: (n: number, total: number) => string;
      required: string;
      init: string;
    };
  };
  recap: {
    title: string;
    decision_title: string;
    pathway_prefix: string;
    your_answers: string;
    status_prefix: string;
  };
  // ✅ Ajout de la section "access"
  access: {
    menu_link: string;
    title: string;
    subtitle: string;
    input_label: string;
    input_placeholder: string;
    submit: string;
    helper: string;
    error_generic: string;
  };
};

export async function getDictionary(locale: Locale) {
  switch (locale) {
    case "en":
      return (await import("./dictionaries/en")).dict;
    case "ar":
      return (await import("./dictionaries/ar")).dict;
    default:
      return (await import("./dictionaries/fr")).dict;
  }
}





  
