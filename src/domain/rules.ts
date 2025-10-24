// src/domain/rules.ts
export type Answers = Record<string, string>;

export type DecisionResult = {
  pathway: string;
  citations: string[];
};

export function evaluatePathway(a: Answers): DecisionResult {
  const situation = (a["situation"] || "").toLowerCase();

  // --- ASILE (inchangé par rapport à ta version V1+) ---
  if (situation === "asile") {
    const dublin = a["asylum_dublin"] === "yes";
    const ofpraFiled = a["asylum_ofpra_filed"] === "yes";
    const ofpraDecision = a["asylum_ofpra_decision"] || ""; // pending | refused | none
    const cndaAppeal = a["asylum_cnda_appeal"] === "yes";
    const delayMonths = Number(a["asylum_delay_months"] || "0");
    const vulnerable = a["asylum_vulnerable"] === "yes";
    const hasDomic = a["asylum_domiciliation"] === "yes";
    const ofii = a["asylum_ofii_orientation"] === "yes";
    const needInterp = a["asylum_interpreter"] === "yes";
    const evidenceReady = a["asylum_evidence_ready"] === "yes";
    const lang = a["asylum_language"] || "";

    if (dublin) {
      return {
        pathway: "Asile — Orientation Dublin",
        citations: [
          "Règlement (UE) n°604/2013 (« Dublin III ») — déterminer l’État responsable.",
          "Conserver toutes les notifications; langue souhaitée : " + (lang || "non précisée"),
        ],
      };
    }

    if (!ofpraFiled) {
      if (!Number.isNaN(delayMonths) && delayMonths <= 3) {
        return {
          pathway: "Asile — Enregistrement GUDA puis OFPRA",
          citations: [
            hasDomic ? "Domiciliation OK." : "Obtenir une domiciliation.",
            ofii ? "Suivi OFII (CMA)." : "Contacter OFII pour CMA.",
            needInterp ? "Signaler besoin d’interprète." : "Préciser la langue : " + (lang || "—"),
            evidenceReady ? "Préparer récit + pièces." : "Commencer à rassembler les preuves.",
          ],
        };
      }
      return {
        pathway: "Asile — Dépôt tardif (justifications nécessaires)",
        citations: [
          "Justifier le délai (obstacles, vulnérabilités).",
          vulnerable ? "Vulnérabilité signalée : prise en compte spécifique." : "—",
        ],
      };
    }

    if (ofpraDecision === "pending") {
      return {
        pathway: "Asile — Instruction OFPRA en cours",
        citations: [
          hasDomic ? "Adresse/ domiciliation à jour." : "Actualiser domiciliation.",
          needInterp ? "Demander interprète à l’entretien." : "Confirmer langue : " + (lang || "—"),
          evidenceReady ? "Finaliser récit + pièces." : "Renforcer le dossier (cohérence/ preuves).",
        ],
      };
    }

    if (ofpraDecision === "refused") {
      if (cndaAppeal) {
        return {
          pathway: "Asile — Recours CNDA",
          citations: [
            "Respecter le délai de recours (en général 1 mois).",
            "Préparer mémoire + pièces; avocat conseillé.",
          ],
        };
      }
      return {
        pathway: "Asile — Rejet OFPRA (vérifier délais)",
        citations: [
          "Vérifier si délai CNDA ouvert.",
          "Sinon : envisager réexamen/ autres voies.",
        ],
      };
    }

    return {
      pathway: "Asile — Suivi de procédure",
      citations: [
        hasDomic ? "Domiciliation OK." : "Obtenir/actualiser la domiciliation.",
        ofii ? "Suivi OFII (CMA)." : "Contacter OFII.",
      ],
    };
  }

  // --- VPF (MVP) ---
  if (situation === "vpf") {
    const hasChildren = a["has_children"] === "yes";
    const yearsInFrance = Number(a["years_in_france"] || "0");
    if (hasChildren && yearsInFrance >= 5) {
      return {
        pathway: "Vie privée et familiale — Parent d’enfant scolarisé",
        citations: ["Préfecture: preuves présence stable, scolarisation, ressources si possibles."],
      };
    }
    return {
      pathway: "Vie privée et familiale — Examen au cas par cas",
      citations: ["Ancrage : durée de séjour, liens familiaux, intégration, ressources."],
    };
  }

  // --- TRAVAIL V1 ---
  if (situation === "travail") {
    const hasOffer = a["work_has_offer"] === "yes";
    const yearsWorked = Number(a["work_years_worked"] || "0");
    const taxesPaid = a["work_taxes_paid"] === "yes";
    const tensionGuess = a["work_tension_guess"] || "unknown";
    const dept = a["work_department"] || "";

    // Indices favorables (MVP) :
    const strongEmployment =
      hasOffer && (tensionGuess === "yes" || (yearsWorked >= 3 && taxesPaid));

    if (strongEmployment) {
      return {
        pathway: "Travail — Régularisation par le travail (conditions favorables)",
        citations: [
          "Promesse d’embauche/ offre + éléments d’expérience.",
          "Si métier en tension dans le département : atout (vérifier liste préfectorale après paiement).",
          yearsWorked >= 3 ? `Ancienneté travail : ${yearsWorked} an(s).` : "Ancienneté de travail à préciser.",
          taxesPaid ? "Paiement d’impôts : oui (atout)." : "Pas d’impôts déclarés : possible mais moins favorable.",
          dept ? `Département déclaré : ${dept}.` : "Département non renseigné.",
        ],
      };
    }

    if (hasOffer) {
      return {
        pathway: "Travail — Promesse d’embauche (à consolider)",
        citations: [
          "Rassembler preuves d’activité (contrats, fiches de paie si disponibles).",
          "Vérifier si le métier est en tension dans le département (ressource disponible après paiement).",
          "Impôts/URSSAF: toute trace aide le dossier.",
        ],
      };
    }

    return {
      pathway: "Travail — Sans promesse (préparation d’un dossier)",
      citations: [
        "Identifier secteurs en tension dans le département (après paiement).",
        "Consolider parcours (preuves d’expérience, formations, recommandations).",
      ],
    };
  }

  // Défallant
  return {
    pathway: "Orientation générale (incomplète)",
    citations: ["Compléter les réponses pour une orientation plus précise."],
  };
}




