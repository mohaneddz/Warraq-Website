import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 text-[12px] text-faint sm:flex-row">
        <p>Warraq — Mustapha Bacha Hospital Library</p>
        <p>
          Public catalogue · consultation on site ·{" "}
          <Link href="/catalog" className="text-muted underline-offset-2 hover:underline">
            browse all titles
          </Link>
        </p>
      </div>
    </footer>
  );
}
