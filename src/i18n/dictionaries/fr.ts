import type { Dict } from "../get-dictionary";

export const dict: Dict = {
  landing: {
    title: "Obtenez un premier avis sur votre procédure de régularisation",
    tagline:
      "Répondez à quelques questions. À la fin, vous recevrez un PDF avec les bases légales et les prochaines étapes.",
    start: "Commencer",
    price_hint: "Tarif indicatif : 39 €",
    legal_hint: "Ceci n’est pas un conseil juridique. Mentions légales et RGPD à venir.",
    features: [
      "Parcours simple et anonyme",
      "FR / عربي / EN",
      "Asile + Vie privée/familiale d’abord",
    ],
  },
  questions: {
    has_children: { label: "Avez-vous des enfants mineurs en France ?", yes: "Oui", no: "Non" },
    years_in_france: { label: "Depuis combien d’années résidez-vous en France ?", placeholder: "0" },
    department: { label: "Dans quel département résidez-vous ? (ex: 75, 93)", placeholder: "75" },
    situation: {
      label: "Votre situation principale aujourd’hui",
      asile: "Demande d’asile / protection",
      vpf: "Vie privée et familiale",
      travail: "Travail / salarié",
    },
    has_job_offer: { label: "Avez-vous une promesse d’embauche ?", yes: "Oui", no: "Non" },
    years_worked_in_france: {
      label: "Depuis combien d’années travaillez-vous en France (déclaré) ?",
      placeholder: "0",
    },
    payslips_last_24m: {
      label: "Combien de fiches de paie avez-vous sur les 24 derniers mois ?",
      placeholder: "0",
    },
    has_tax_returns: { label: "Avez-vous déjà déposé des déclarations d’impôts en France ?", yes: "Oui", no: "Non" },
    tension_occupation: {
      label: "Votre métier est-il en tension (liste préfectorale) ?",
      yes: "Oui",
      no: "Non",
    },
    ui: {
      back: "Retour",
      next: "Suivant",
      see_recap: "Voir le récapitulatif",
      step: (n, total) => `Question ${n} / ${total}`,
      required: "Merci de répondre pour continuer.",
      init: "Veuillez patienter, initialisation en cours…",
    },
  },
  recap: {
    title: "Récapitulatif",
    decision_title: "Décision (v1 démo)",
    pathway_prefix: "Voie retenue : ",
    your_answers: "Vos réponses",
    status_prefix: "Statut du dossier : ",
  },
  access: {
    menu_link: "Accéder à mon dossier",
    title: "Accéder à mon dossier",
    subtitle:
      "Saisissez le code d’accès à 6 chiffres reçu sur la page de récapitulatif ou après paiement.",
    input_label: "Code d’accès",
    input_placeholder: "6 chiffres…",
    submit: "Ouvrir mon dossier",
    helper:
      "Astuce : gardez ce code. Il permet de reprendre votre dossier plus tard sur n’importe quel appareil.",
    error_generic: "Code invalide ou dossier introuvable. Vérifiez et réessayez.",
  },
};





