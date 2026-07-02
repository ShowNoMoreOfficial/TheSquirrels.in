import Image from "next/image";
import { Kicker } from "./Kicker";
import { Byline } from "./Byline";

type ArticleHeaderProps = {
  title: string;
  dek?: string;
  byline?: string;
  date?: string;
  coverImage?: string | null;
  section?: string;
  sectionKey?: string;
};

export function ArticleHeader({
  title,
  dek,
  byline,
  date,
  coverImage,
  section,
  sectionKey,
}: ArticleHeaderProps) {
  return (
    <header className="mb-8">
      {section && (
        <Kicker label={section} sectionKey={sectionKey} className="mb-3 block" />
      )}

      <h1 className="font-display font-black leading-[1.08] text-ink text-3xl sm:text-4xl md:text-[2.75rem]">
        {title}
      </h1>

      {dek && (
        <p className="mt-4 font-serif text-lg leading-relaxed text-ink-soft sm:text-xl">
          {dek}
        </p>
      )}

      <div className="mt-5 border-t border-hairline pt-4">
        <Byline byline={byline} date={date} />
      </div>

      {coverImage && (
        <figure className="mt-6">
          <Image
            src={coverImage}
            alt=""
            width={1200}
            height={675}
            priority
            className="h-auto w-full object-cover"
          />
        </figure>
      )}
    </header>
  );
}
