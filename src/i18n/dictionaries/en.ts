import type { Dict } from "../get-dictionary";

export const dict: Dict = {
  landing: {
    title: "Get an initial opinion on your regularization procedure",
    tagline:
      "Answer a few questions. At the end, you’ll receive a PDF with legal bases and next steps.",
    start: "Start",
    price_hint: "Indicative price: €39",
    legal_hint: "This is not legal advice. Legal notice and GDPR coming soon.",
    features: [
      "Simple and anonymous journey",
      "FR / عربي / EN",
      "Asylum + Private/family life first",
    ],
  },
  questions: {
    has_children: { label: "Do you have minor children in France?", yes: "Yes", no: "No" },
    years_in_france: { label: "How many years have you lived in France?", placeholder: "0" },
    department: { label: "Which department do you live in? (e.g., 75, 93)", placeholder: "75" },
    situation: {
      label: "Your main situation today",
      asile: "Asylum / protection request",
      vpf: "Private and family life",
      travail: "Work / employee",
    },
    has_job_offer: { label: "Do you have a job offer?", yes: "Yes", no: "No" },
    years_worked_in_france: {
      label: "How many years have you been working in France (declared)?",
      placeholder: "0",
    },
    payslips_last_24m: {
      label: "How many payslips do you have over the last 24 months?",
      placeholder: "0",
    },
    has_tax_returns: { label: "Have you filed tax returns in France?", yes: "Yes", no: "No" },
    tension_occupation: {
      label: "Is your occupation on the shortage list?",
      yes: "Yes",
      no: "No",
    },
    ui: {
      back: "Back",
      next: "Next",
      see_recap: "See the recap",
      step: (n, total) => `Question ${n} / ${total}`,
      required: "Please answer to continue.",
      init: "Please wait, initializing…",
    },
  },
  recap: {
    title: "Summary",
    decision_title: "Decision (v1 demo)",
    pathway_prefix: "Selected pathway: ",
    your_answers: "Your answers",
    status_prefix: "Case status: ",
  },
  access: {
    menu_link: "Access my case",
    title: "Access my case",
    subtitle:
      "Enter the 6-digit access code you got on the summary page or after payment.",
    input_label: "Access code",
    input_placeholder: "6 digits…",
    submit: "Open my case",
    helper:
      "Tip: keep this code. It lets you resume your case later on any device.",
    error_generic: "Invalid code or case not found. Please try again.",
  },
};


