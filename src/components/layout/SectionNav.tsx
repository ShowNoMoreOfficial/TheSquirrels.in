"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SECTIONS } from "@/lib/gather/sections";

export function SectionNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-y border-hairline bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/80">
      <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6">
        <ul className="flex items-center gap-5 sm:gap-7 overflow-x-auto py-3 no-scrollbar">
          {SECTIONS.map((section) => {
            const href = `/section/${section.key}`;
            const active = pathname === href;
            return (
              <li key={section.key} className="shrink-0">
                <Link
                  href={href}
                  className={`label text-[12px] whitespace-nowrap transition-colors hover:text-link ${
                    active
                      ? "text-ink border-b-2 border-ink pb-[2px]"
                      : "text-ink-soft"
                  }`}
                >
                  {section.label}
                </Link>
              </li>
            );
          })}
          <li className="shrink-0 ml-auto">
            <Link
              href="/search"
              aria-label="Search"
              className="label text-[12px] text-ink-soft whitespace-nowrap transition-colors hover:text-link"
            >
              Search
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
