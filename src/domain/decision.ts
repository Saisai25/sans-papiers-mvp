import type { Answers } from "./rules";

export type Decision = {
  pathway: string;
  citations: string[];
};

const THRESHOLDS = {
  minYearsForWorkTrack: 2,        // ancienneté de séjour indicative
  minYearsWorkedDeclared: 1,      // ✅ ancienneté de travail déclarée indicative
  strongPayslipsLast24m: 24,
  mediumPayslipsLast24m: 12,
};

export function computeDecision(a: Answers): Decision {
  const years = Number(a.years_in_france);
  const hasChildren = a.has_children === "yes";
  const situation = a.situation ?? "";

  const hasJobOffer = a.has_job_offer === "yes";
  const yearsWorked = Number(a.years_worked_in_france);             // ✅ utilisé
  const payslips24 = Number(a.payslips_last_24m);
  const hasTax = a.has_tax_returns === "yes";
  const tension = a.tension_occupation === "yes";

  // Fin anticipée illustrative (VPF non remplie)
  if (!hasChildren && Number.isFinite(years) && years < 2) {
    return {
      pathway: "Orientation : informations générales (conditions VPF non remplies)",
      citations: [
        "Base VPF (références CESEDA à préciser selon cas)",
        "Appréciation au cas par cas de la stabilité des liens en France",
      ],
    };
  }

  if (situation === "asile") {
    return {
      pathway: "Asile / protection (procédure OFPRA)",
      citations: [
        "Convention de Genève du 28 juillet 1951 (art. 1A(2))",
        "Directives & pratique nationale (MVP)",
      ],
    };
  }

  if (situation === "vpf") {
    return {
      pathway: "Séjour – Vie privée et familiale (VPF)",
      citations: [
        "Prise en compte de la vie familiale, ancrage, intérêt supérieur de l’enfant (si applicable)",
      ],
    };
  }

  if (situation === "travail") {
    const enoughYears = Number.isFinite(years) && years >= THRESHOLDS.minYearsForWorkTrack;
    const enoughYearsWorked = Number.isFinite(yearsWorked) && yearsWorked >= THRESHOLDS.minYearsWorkedDeclared; // ✅
    const strongWorkHistory = Number.isFinite(payslips24) && payslips24 >= THRESHOLDS.strongPayslipsLast24m;
    const mediumWorkHistory = Number.isFinite(payslips24) && payslips24 >= THRESHOLDS.mediumPayslipsLast24m;

    // ✅ Piste renforcée si promesse + métier en tension + (historique moyen/fort OU ancienneté séjour OU ancienneté travail)
    if (hasJobOffer && tension && (strongWorkHistory || mediumWorkHistory || enoughYears || enoughYearsWorked) && hasTax) {
      return {
        pathway: "Travail — piste renforcée (promesse + métier en tension)",
        citations: [
          "Promesse d’embauche + métier en tension : renforcer la recevabilité",
          "Vérifier pratiques préfectorales et pièces selon département",
        ],
      };
    }

    // Piste solide
    if (hasJobOffer && strongWorkHistory && hasTax) {
      return {
        pathway: "Travail — piste solide (promesse + 24 fiches/24m + impôts)",
        citations: [
          "Éléments probatoires : promesse, continuité salariale, déclarations fiscales",
          "Vérifier conditions locales (métiers en tension, pièces exigées)",
        ],
      };
    }

    // Piste à instruire (on accepte aussi l'ancienneté de travail déclarée)
    if (hasJobOffer && (mediumWorkHistory || enoughYears || enoughYearsWorked) && hasTax) {
      return {
        pathway: "Travail — piste à instruire (promesse + historique moyen/ancienneté + impôts)",
        citations: [
          "Consolider : bulletins, attestations employeur, preuves d’activité déclarée",
        ],
      };
    }

    // Historique fort sans promesse
    if (!hasJobOffer && (strongWorkHistory || enoughYearsWorked) && hasTax) {
      return {
        pathway: "Travail — à compléter (historique fort / ancienneté travail sans promesse)",
        citations: [
          "Chercher promesse/contrat ; rassembler justificatifs fiscaux et sociaux",
        ],
      };
    }

    return {
      pathway: "Travail — orientation initiale (informations à compléter)",
      citations: [
        "Réunir au moins : promesse/contrat, bulletins 12–24m, attestations URSSAF/impôts",
      ],
    };
  }

  return {
    pathway: "Orientation : compléter les informations (MVP)",
    citations: [
      "Rassembler les éléments relatifs à la vie privée/familiale et/ou activité pro",
    ],
  };
}


