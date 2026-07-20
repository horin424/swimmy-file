import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 font-heading", className)}>
      <svg viewBox="0 0 32 32" className="h-6 w-6 shrink-0" fill="none">
        <defs>
          <linearGradient id="swimmy-fin" x1="2" y1="6" x2="30" y2="26" gradientUnits="userSpaceOnUse">
            <stop stopColor="oklch(0.78 0.14 220)" />
            <stop offset="0.55" stopColor="oklch(0.68 0.18 260)" />
            <stop offset="1" stopColor="oklch(0.68 0.2 320)" />
          </linearGradient>
        </defs>
        <path
          d="M2 16c5-7 12-10 19-10 4 0 7 2 9 5-2 3-5 5-9 5-7 0-14-3-19-10 5 9 11 13 19 13 4 0 7-2 9-5"
          stroke="url(#swimmy-fin)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="24.5" cy="14" r="1.3" fill="oklch(0.96 0.01 258)" />
      </svg>
      <span className="text-[17px] font-semibold tracking-tight">
        Swimmy <span className="text-primary">File</span>
      </span>
    </div>
  );
}
