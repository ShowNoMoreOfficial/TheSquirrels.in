import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { EditionLocation } from "@/components/layout/EditionLocation";
import { formatMasthead } from "@/lib/content/dates";

export function Masthead() {
  const today = formatMasthead();

  return (
    <header className="border-b border-hairline bg-paper">
      <Container className="py-0">
        {/* Edition line */}
        <div className="hidden sm:flex items-center justify-between pt-3 text-[11px] label text-ink-soft">
          <span>{today}</span>
          <EditionLocation />
        </div>

        {/* Nameplate */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <Image
              src="/brand/wordmark.png"
              alt="The Squirrels"
              width={1149}
              height={369}
              priority
              className="h-auto w-72 sm:w-[30rem]"
            />
          </Link>
        </div>

        {/* Mobile date */}
        <div className="sm:hidden mt-3 text-center text-[11px] label text-ink-soft">
          {today}
        </div>
      </Container>
    </header>
  );
}
