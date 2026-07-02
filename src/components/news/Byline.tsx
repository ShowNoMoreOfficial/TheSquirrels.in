import { formatByline } from "@/lib/content/dates";

type BylineProps = {
  byline?: string;
  date?: string;
  className?: string;
};

/** "By Jane Doe · July 3, 2026" in small sans caps. */
export function Byline({ byline, date, className = "" }: BylineProps) {
  if (!byline && !date) return null;
  return (
    <p className={`label text-[11px] font-medium text-ink-soft tracking-normal normal-case ${className}`}>
      {byline && <span className="uppercase tracking-[0.06em]">{byline}</span>}
      {byline && date && <span className="mx-1.5 text-ink-faint">·</span>}
      {date && (
        <time dateTime={date} className="font-serif italic normal-case">
          {formatByline(date)}
        </time>
      )}
    </p>
  );
}
