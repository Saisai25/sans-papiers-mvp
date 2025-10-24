// src/domain/decision.ts

/** Dictionnaire des réponses : chaque question -> valeur saisie */
export type Answers = Record<string, string>;

/** Résultat minimal attendu par le récap / PDF */
export type DecisionResult = {
  pathway: string;       // intitulé de la voie
  citations: string[];   // références (placeholder MVP)
};

/** Petit helper numérique robuste */
function toInt(v: string | undefined): number {
  const n = Number.parseInt((v ?? "").trim(), 10);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Règles MVP — très simples, purement déterministes.
 * On affinera ensuite (asile détaillé, VPF, travail “métiers en tension”, etc.).
 */
export function evaluatePathway(answers: Answers): DecisionResult {
  const situation = (answers["situation"] || "").toLowerCase();
  const yearsInFrance = toInt(answers["years_in_france"]);
  const hasChildren = (answers["has_children"] || "").toLowerCase() === "yes";

  // Travail (MVP)
  if (situation === "travail") {
    // Exemples de critères simplifiés pour le MVP
    if (yearsInFrance >= 3 || hasChildren) {
      return {
        pathway: "Régularisation par le travail (MVP)",
        citations: [
          "Code de l’entrée et du séjour des étrangers et du droit d’asile (CESEDA) — dispositions travail (références à préciser).",
        ],
      };
    }
    return {
      pathway: "Travail : critères insuffisants (MVP)",
      citations: [
        "Vérifier ancienneté de séjour, promesse d’embauche, métier en tension, etc. (à préciser).",
      ],
    };
  }

  // Asile (MVP)
  if (situation === "asile") {
    return {
      pathway: "Demande d’asile / protection (MVP)",
      citations: [
        "Procédure OFPRA / CNDA — à détailler selon le cas (MVP).",
      ],
    };
  }

  // Vie privée et familiale (MVP)
  if (situation === "vpf") {
    if (hasChildren || yearsInFrance >= 3) {
      return {
        pathway: "Vie privée et familiale (MVP)",
        citations: [
          "CESEDA — titres VPF (références à préciser).",
        ],
      };
    }
    return {
      pathway: "VPF : critères à compléter (MVP)",
      citations: [
        "Examiner durée de séjour, attaches familiales, insertion… (MVP).",
      ],
    };
  }

  // Par défaut
  return {
    pathway: "Analyse complémentaire nécessaire (MVP)",
    citations: [
      "Rassembler éléments : durée de séjour, enfants, activité, promesse d’embauche… (MVP).",
    ],
  };
}
