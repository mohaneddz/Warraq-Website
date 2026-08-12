import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSelect } from "./LanguageSelect";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/brand/warraq-symbol.png"
            alt=""
            width={28}
            height={28}
            className="h-7 w-7 object-contain"
          />
          <span className="font-display text-[19px] font-semibold tracking-tight">Warraq</span>
        </Link>

        <nav className="flex items-center gap-1 text-[13px] font-semibold">
          <Link
            href="/"
            className="rounded-lg px-3 py-2 text-muted transition-colors hover:bg-emerald-soft hover:text-emerald"
          >
            Home
          </Link>
          <Link
            href="/catalog"
            className="rounded-lg px-3 py-2 text-muted transition-colors hover:bg-emerald-soft hover:text-emerald"
          >
            Catalogue
          </Link>
          <span className="mx-1 hidden h-5 w-px bg-line sm:block" />
          <LanguageSelect />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
