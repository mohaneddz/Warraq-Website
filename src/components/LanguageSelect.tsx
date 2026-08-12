"use client";

import { useEffect } from "react";

/**
 * Drops in Google Translate's website widget so visitors can read the catalogue in their own
 * language. The widget script is loaded once and rendered into #google_translate_element; the
 * combo box it injects is restyled in globals.css to match the site.
 */
declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: { translate?: { TranslateElement: new (opts: unknown, el: string) => void } };
  }
}

export function LanguageSelect() {
  useEffect(() => {
    // Guard against double-injection during client navigations / fast refresh.
    if (document.getElementById("google-translate-script")) return;

    window.googleTranslateElementInit = () => {
      if (!window.google?.translate) return;
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,fr,ar,es,de",
          autoDisplay: false,
        },
        "google_translate_element",
      );
    };

    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return <div id="google_translate_element" className="min-w-[120px]" aria-label="Translate this page" />;
}
