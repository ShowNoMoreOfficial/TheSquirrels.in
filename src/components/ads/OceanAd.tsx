import { OCEAN_ENABLED } from "@/lib/ads/ocean";

type OceanAdProps = {
  /** Ocean template size, e.g. "1080x1350". Drives the reserved aspect box. */
  size: string;
  /** Custom Position id set on the slot in the Ocean dashboard (e.g. "sq-right-rail"). */
  position?: string;
  /** Max rendered width in px (the ad scales down into this). */
  maxWidth?: number;
  className?: string;
};

/**
 * An Ocean Ad Network placement — the empty `.ocean-ad` element the SDK fills.
 *
 * Renders NOTHING unless ads are enabled (a loader URL is configured), so the
 * layout is untouched until we go live. When enabled, it reserves space via the
 * template's aspect ratio (zero layout shift) and carries an "ADVERTISEMENT"
 * label per editorial norms. The element must be in the initial DOM so Ocean's
 * SDK can find it on load.
 */
export function OceanAd({
  size,
  position,
  maxWidth = 300,
  className = "",
}: OceanAdProps) {
  if (!OCEAN_ENABLED) return null;

  const [w, h] = size.split("x").map((n) => parseInt(n, 10));
  const aspectRatio = w && h ? `${w} / ${h}` : undefined;

  return (
    <div className={className} style={{ maxWidth }}>
      <p className="label mb-1 text-center text-[10px] text-ink-faint">
        Advertisement
      </p>
      <div
        className="ocean-ad mx-auto w-full overflow-hidden bg-hairline/40"
        data-oa-size={size}
        {...(position ? { "data-oa-position": position } : {})}
        style={{ aspectRatio, maxWidth }}
      />
    </div>
  );
}
