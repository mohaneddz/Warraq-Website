import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";

// latin-ext is required, not optional: the catalogue is largely French and Spanish
// ("Précis de pathologie médicale", "Acta Oto-Rino-Laringológica") and without it
// every accented glyph falls back to a mismatched system face.
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Warraq — Library Catalogue",
    template: "%s · Warraq",
  },
  description:
    "Search the Mustapha Bacha Hospital library: books, final-year projects, and journals, with live availability.",
  icons: { icon: "/brand/warraq-symbol.png" },
};

// Runs before first paint: applies the saved theme so there's no light→dark flash. When nothing
// is stored, data-theme stays unset and the CSS falls back to the OS `prefers-color-scheme`.
const themeScript = `(function(){try{var t=localStorage.getItem('warraq-site-theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${manrope.variable} ${fraunces.variable} h-full`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col bg-bg text-fg">{children}</body>
    </html>
  );
}
