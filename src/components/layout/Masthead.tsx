import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { formatMasthead } from "@/lib/content/dates";

export function Masthead() {
  const today = formatMasthead();

  return (
    <header className="border-b border-hairline bg-paper">
      <Container className="py-5 sm:py-6">
        {/* Edition line */}
        <div className="hidden sm:flex items-center justify-between text-[11px] label text-ink-soft">
          <span>{today}</span>
          <span>International Edition</span>
        </div>

        {/* Nameplate */}
        <div className="text-center">
          <Link
            href="/"
            className="font-display font-black tracking-tight text-ink text-4xl sm:text-6xl leading-none"
          >
            The Squirrels
          </Link>
          <p className="mt-2 font-serif italic text-ink-soft text-[13px] sm:text-sm">
            Governance · Policy · Politics · The Economy
          </p>
        </div>

        {/* Mobile date */}
        <div className="sm:hidden mt-3 text-center text-[11px] label text-ink-soft">
          {today}
        </div>
      </Container>
    </header>
  );
}
