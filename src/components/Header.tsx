import Image from "next/image";
import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-black/10 bg-parchment/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/brand/warraq-symbol.png" alt="Warraq" width={32} height={32} />
          <span className="font-display text-lg font-bold text-emerald">Warraq</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-semibold text-ink/70">
          <Link href="/" className="hover:text-emerald transition-colors">
            Home
          </Link>
          <Link href="/catalog" className="hover:text-emerald transition-colors">
            Catalog
          </Link>
        </nav>
      </div>
    </header>
  );
}
