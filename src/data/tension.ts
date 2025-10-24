// src/data/tension.ts

export type TensionResource = {
    title: string;
    description?: string;
    links: { label: string; url: string }[];
  };
  
  export const DEFAULT_TENSION_RESOURCE: TensionResource = {
    title: "Ressources nationales — métiers en tension",
    description:
      "Consultez les listes et informations officielles au niveau national. Certaines préfectures publient aussi des consignes locales.",
    links: [
      {
        label: "Références nationales (travail/immigration)",
        url: "https://travail-emploi.gouv.fr/", // placeholder
      },
    ],
  };
  
  // Mapping simple par département (placeholder). Tu pourras enrichir plus tard.
  export const TENSION_BY_DEPT: Record<string, TensionResource> = {
    "75": {
      title: "Paris (75) — métiers en tension",
      description:
        "Informations locales utiles. Vérifiez toujours les mises à jour préfectorales.",
      links: [
        { label: "Site de la Préfecture de Police", url: "https://www.prefecturedepolice.interieur.gouv.fr/" },
      ],
    },
    "93": {
      title: "Seine-Saint-Denis (93) — métiers en tension",
      links: [
        { label: "Préfecture de la Seine-Saint-Denis", url: "https://www.seine-saint-denis.gouv.fr/" },
      ],
    },
    "13": {
      title: "Bouches-du-Rhône (13) — métiers en tension",
      links: [
        { label: "Préfecture des Bouches-du-Rhône", url: "https://www.bouches-du-rhone.gouv.fr/" },
      ],
    },
  };
  