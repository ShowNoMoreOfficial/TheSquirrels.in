import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SECTIONS } from "@/lib/gather/sections";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-rule bg-paper">
      <Container className="py-10">
        <div className="text-center">
          <Link
            href="/"
            className="font-display font-black text-2xl text-ink tracking-tight"
          >
            The Squirrels
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
      </Container>
    </footer>
  );
}
