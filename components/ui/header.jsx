import Link from "next/link";
import { Button } from "@/components/NavButton";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-white font-semibold tracking-tight">
          VaadBayit
        </Link>

        <nav className="flex items-center gap-2">
          <Link href="/committees">
            <Button variant="ghost" className="text-white hover:text-white">
              Committees
            </Button>
          </Link>

          <Link href="/committees/new">
            <Button className="text-white hover:text-white ">
            +
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
