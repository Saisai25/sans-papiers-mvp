export const locales = ["fr", "en", "ar"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fr";
export function isLocale(l: string | undefined): l is Locale {
  return !!l && (locales as readonly string[]).includes(l);
}
