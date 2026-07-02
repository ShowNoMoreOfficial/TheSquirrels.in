import Link from "next/link";

type KickerProps = {
  label: string;
  sectionKey?: string;
  className?: string;
};

/** Small-caps section label that sits above a headline. */
export function Kicker({ label, sectionKey, className = "" }: KickerProps) {
  const classes = `label text-[11px] text-ink-soft ${className}`;
  if (sectionKey) {
    return (
      <Link href={`/section/${sectionKey}`} className={`${classes} hover:text-link`}>
        {label}
      </Link>
    );
  }
  return <span className={classes}>{label}</span>;
}
