import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SECTIONS } from "@/lib/gather/sections";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-rule bg-paper">
      <Container className="py-10">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <Image
              src="/brand/the-squirrels-copper.png"
              alt="The Squirrels"
              width={1145}
              height={366}
              className="h-auto w-44"
            />
          </Link>
        </div>

        <nav className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {SECTIONS.map((section) => (
            <Link
              key={section.key}
              href={`/section/${section.key}`}
              className="label text-[11px] text-ink-soft hover:text-link"
            >
              {section.label}
            </Link>
          ))}
        </nav>

        <p className="mt-8 text-center text-[12px] text-ink-faint font-serif">
          © {year} The Squirrels. An Independent Indian News Publication.
        </p>

        <a
          href="https://shownomore.com"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex items-center justify-center gap-1.5 text-ink-faint transition-colors hover:text-ink"
        >
          <Image
            src="/brand/shownomore.png"
            alt="ShowNoMore"
            width={96}
            height={96}
            className="h-4 w-4"
          />
          <span className="label text-[10px]">Powered by ShowNoMore</span>
        </a>
      </Container>
    </footer>
  );
}
