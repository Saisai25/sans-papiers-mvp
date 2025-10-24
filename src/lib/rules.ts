// src/lib/rules.ts
export type Answers = Record<string, string>;

export type DecisionResult = {
  pathway: "asile" | "vie_privee_familiale" | "insuffisant";
  citations: string[];
};

// Règles démo v1
export function evaluateV1(a: Answers): DecisionResult {
  // Si l’utilisateur a choisi "asile"
  if (a["situation"] === "asile") {
    return {
      pathway: "asile",
      citations: ["(démo) Asile — orienter guichet unique / OFPRA"],
    };
  }

  // Vie privée/familiale : enfants + >= 3 ans en France
  const hasChildren = a["has_children"] === "yes";
  const years = parseInt(a["years_in_france"] || "0", 10);
  if (hasChildren && years >= 3) {
    return {
      pathway: "vie_privee_familiale",
      citations: ["(démo) VPF — attaches familiales + durée du séjour"],
    };
  }

  return { pathway: "insuffisant", citations: [] };
}
