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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${manrope.variable} ${fraunces.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-bg text-fg">{children}</body>
    </html>
  );
}
