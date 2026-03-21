/**
 * Maps i18next language tags (e.g. en-US, es-ES) to DeepL API target language codes.
 * DeepL detects the source language when translating; this selects the UI language as target.
 */
export function i18nLanguageToDeepLTarget(i18nLanguage: string): string {
  const normalized = i18nLanguage.replace(/_/g, "-").toLowerCase();

  const full: Record<string, string> = {
    "en-us": "EN-US",
    "en-gb": "EN-GB",
    "es-es": "ES",
    "de-de": "DE",
    "fr-fr": "FR",
    "it-it": "IT",
    "pt-br": "PT-BR",
    "pt-pt": "PT-PT",
    "ja-jp": "JA",
    "ko-kr": "KO",
    "zh-cn": "ZH",
    "zh-tw": "ZH",
    "ru-ru": "RU",
    "pl-pl": "PL",
    "nl-nl": "NL",
    "sv-se": "SV",
    "da-dk": "DA",
    "tr-tr": "TR",
    "id-id": "ID",
    // Locales not supported as DeepL targets — fallback (server still validates)
    "fa-ir": "EN-US",
    "vi-vn": "EN-US",
    "th-th": "EN-US",
  };

  if (full[normalized]) {
    return full[normalized];
  }

  const [lang] = normalized.split("-");
  const base: Record<string, string> = {
    en: "EN-US",
    es: "ES",
    de: "DE",
    fr: "FR",
    it: "IT",
    ja: "JA",
    ko: "KO",
    zh: "ZH",
    ru: "RU",
    pl: "PL",
    nl: "NL",
    pt: "PT-BR",
    sv: "SV",
    da: "DA",
    tr: "TR",
    id: "ID",
  };

  return base[lang] ?? "EN-US";
}
