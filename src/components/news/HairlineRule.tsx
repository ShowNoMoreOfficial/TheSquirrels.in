type HairlineRuleProps = {
  orientation?: "horizontal" | "vertical";
  strong?: boolean;
  className?: string;
};

/** A thin editorial divider — the connective tissue of the newspaper grid. */
export function HairlineRule({
  orientation = "horizontal",
  strong = false,
  className = "",
}: HairlineRuleProps) {
  const color = strong ? "border-rule" : "border-hairline";
  if (orientation === "vertical") {
    return <div className={`border-l ${color} ${className}`} role="separator" />;
  }
  return <hr className={`border-0 border-t ${color} ${className}`} />;
}
