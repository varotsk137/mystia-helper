export type Lang = "th" | "en";

export const LANGS: { id: Lang; label: string }[] = [
  { id: "th", label: "ไทย" },
  { id: "en", label: "English" },
];

/** Thai for Thai browsers, English otherwise. */
export function defaultLang(): Lang {
  try {
    return navigator.language.toLowerCase().startsWith("th") ? "th" : "en";
  } catch {
    return "th";
  }
}
