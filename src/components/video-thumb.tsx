import { Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/mock-data";

export function VideoThumb({
  gradient,
  duration,
  className,
  children,
}: {
  gradient: [string, string];
  /** Omit to render without the duration badge (e.g. upload-pipeline entries with no playable video yet). */
  duration?: number;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "group/thumb relative flex h-full w-full items-center justify-center overflow-hidden rounded-t-xl",
        className,
      )}
      style={{
        background: `linear-gradient(155deg, ${gradient[0]}, ${gradient[1]})`,
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,oklch(1_0_0/18%),transparent_55%)]" />
      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover/thumb:opacity-100">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm">
          <Play className="ml-0.5 h-5 w-5 fill-white text-white" />
        </div>
      </div>
      {duration !== undefined && (
        <span className="absolute bottom-1.5 right-1.5 rounded bg-black/55 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-white backdrop-blur-sm">
          {formatDuration(duration)}
        </span>
      )}
      {children}
    </div>
  );
}
