"use client";

import { useEffect, useState } from "react";

/**
 * Translates the catalogue via Google Translate, but never shows Google's own widget —
 * that UI (the "Sélectionner une langue" banner, the Google logo, the grey combo box) is
 * an iframe Google controls and cannot be reliably restyled to match the site. Instead,
 * the real widget renders into a visually-hidden element purely so its script exists and
 * can react to Google's own googtrans cookie; the visible control below is an ordinary
 * <select> styled like the rest of the site, which just sets that cookie and reloads.
 */
declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: { translate?: { TranslateElement: new (opts: unknown, el: string) => void } };
  }
}

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "ar", label: "العربية" },
  { code: "es", label: "Español" },
  { code: "de", label: "Deutsch" },
];

function currentLanguage(): string {
  const match = document.cookie.match(/googtrans=\/en\/([a-zA-Z-]+)/);
  return LANGUAGES.some((l) => l.code === match?.[1]) ? match![1] : "en";
}

function applyLanguage(code: string) {
  const domain = window.location.hostname;
  if (code === "en") {
    // No target language: clear the cookie rather than set /en/en, which Google
    // Translate treats as "translate English into English" and still boxes the page.
    document.cookie = "googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC";
    document.cookie = `googtrans=; path=/; domain=${domain}; expires=Thu, 01 Jan 1970 00:00:00 UTC`;
  } else {
    document.cookie = `googtrans=/en/${code}; path=/`;
    document.cookie = `googtrans=/en/${code}; path=/; domain=${domain}`;
  }
  window.location.reload();
}

export function LanguageSelect() {
  const [lang, setLang] = useState("en");

  useEffect(() => {
    setLang(currentLanguage());

    // Guard against double-injection during client navigations / fast refresh.
    if (document.getElementById("google-translate-script")) return;

    window.googleTranslateElementInit = () => {
      if (!window.google?.translate) return;
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: LANGUAGES.filter((l) => l.code !== "en")
            .map((l) => l.code)
            .join(","),
          autoDisplay: false,
        },
        "google_translate_element",
      );

      // The googtrans cookie alone doesn't reliably make Google's widget apply a
      // translation on load — its internal combo box can stay on "Select a language"
      // even with the cookie set. Google's widget renders that combo asynchronously
      // (it doesn't exist the instant TranslateElement returns), so poll briefly for
      // it, then drive it the same way a visitor clicking it would: set its value and
      // fire the change event it's listening for.
      const target = currentLanguage();
      if (target === "en") return;
      let attempts = 0;
      const applyToWidget = () => {
        const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");
        if (combo) {
          combo.value = target;
          // Google's widget listens via the legacy event-creation API rather than a
          // plain `new Event()` — dispatching that way doesn't reach its handler.
          const event = document.createEvent("HTMLEvents");
          event.initEvent("change", true, true);
          combo.dispatchEvent(event);
        } else if (attempts < 20) {
          attempts += 1;
          setTimeout(applyToWidget, 200);
        }
      };
      setTimeout(applyToWidget, 300);
    };

    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <div>
      <div id="google_translate_element" className="sr-only" aria-hidden />
      <select
        aria-label="Translate this page"
        value={lang}
        onChange={(e) => applyLanguage(e.target.value)}
        className="h-9 cursor-pointer rounded-lg border border-line bg-surface px-2.5 text-[12.5px] font-semibold text-muted outline-none transition-colors hover:border-line-strong hover:text-fg focus-visible:border-emerald"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
    </div>
  );
}
