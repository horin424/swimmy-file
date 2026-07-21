// Ads are excluded from the MVP (see project proposal §4, §7). This reserves the
// layout position specified in SF-UI-001 (Discover / Video Detail / Search) so a
// real ad unit can be enabled later without a layout change. Disabled, it renders
// nothing — no placeholder box, no "Advertisement" label, no reserved blank space.
const AD_ENABLED = false;

export function AdSlot({
  placement,
  className,
}: {
  placement: "discover-feed" | "video-detail" | "search-results";
  className?: string;
}) {
  if (!AD_ENABLED) return null;

  return <div data-ad-placement={placement} className={className} />;
}
