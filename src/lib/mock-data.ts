import type { Category, Tag, Video, StorageUsage } from "./types";

// "All" / "Popular" / "New" are view filters, not genres — kept separate from
// the real category list so video generation below never assigns a video to
// one of them by mistake.
const pseudoCategories: Category[] = [
  { slug: "all", name: "All", count: 12400 },
  { slug: "popular", name: "Popular", count: 2100 },
  { slug: "new", name: "New", count: 3700 },
];

const genreCategories: Category[] = [
  { slug: "music", name: "Music", count: 1800 },
  { slug: "gaming", name: "Gaming", count: 2600 },
  { slug: "movies", name: "Movies & Animation", count: 1400 },
  { slug: "technology", name: "Technology", count: 1900 },
  { slug: "education", name: "Education", count: 1300 },
  { slug: "lifestyle", name: "Lifestyle", count: 1700 },
  { slug: "travel", name: "Travel", count: 1200 },
  { slug: "sports", name: "Sports", count: 1000 },
  { slug: "other", name: "Other", count: 900 },
];

export const categories: Category[] = [...pseudoCategories, ...genreCategories];

export const trendingTags: Tag[] = [
  { slug: "tutorial", name: "#tutorial", count: 2300 },
  { slug: "vlog", name: "#vlog", count: 1800 },
  { slug: "highlights", name: "#highlights", count: 1600 },
  { slug: "howto", name: "#howto", count: 1500 },
  { slug: "review", name: "#review", count: 1300 },
  { slug: "gameplay", name: "#gameplay", count: 1250 },
  { slug: "livestream", name: "#livestream", count: 1100 },
  { slug: "unboxing", name: "#unboxing", count: 950 },
  { slug: "cooking", name: "#cooking", count: 900 },
  { slug: "fitness", name: "#fitness", count: 800 },
];

const gradients: [string, string][] = [
  ["oklch(0.55 0.18 15)", "oklch(0.35 0.12 280)"],
  ["oklch(0.6 0.16 250)", "oklch(0.4 0.14 300)"],
  ["oklch(0.65 0.2 20)", "oklch(0.3 0.1 260)"],
  ["oklch(0.58 0.15 200)", "oklch(0.32 0.12 330)"],
  ["oklch(0.62 0.18 340)", "oklch(0.35 0.1 240)"],
  ["oklch(0.6 0.14 160)", "oklch(0.3 0.12 260)"],
  ["oklch(0.65 0.19 30)", "oklch(0.38 0.13 290)"],
  ["oklch(0.55 0.16 280)", "oklch(0.4 0.15 340)"],
];

const handles = ["nightowl", "reika_v", "misty.k", "aoi_studio", "kuro_cam", "yuzu.fps", "hana_edit", "rin_takes"];

// Deterministic pseudo-random in [0, 1) seeded by index — keeps server/client render output identical.
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 999.7 + 13.37) * 43758.5453;
  return x - Math.floor(x);
}

function makeVideo(i: number, overrides: Partial<Video> = {}): Video {
  const g = gradients[i % gradients.length];
  const views = overrides.views ?? Math.round(800 + seededRandom(i) * 25000);
  return {
    id: `vid_${i}`,
    shareToken: `sw${(1000 + i).toString(36)}`,
    title: overrides.title ?? `Untitled session #${i + 1}`,
    description: "Shared via Swimmy File. Tap the link to watch and download.",
    thumbnailGradient: g,
    durationSeconds: Math.round(30 + seededRandom(i + 1.75) * 900),
    // MB, capped well under the 2GB per-file limit for new accounts.
    fileSizeMb: Math.round(40 + seededRandom(i + 3.1) * 900),
    views,
    reportCount: 0,
    category: genreCategories[i % genreCategories.length].slug,
    tags: [trendingTags[i % trendingTags.length].slug, trendingTags[(i + 2) % trendingTags.length].slug],
    visibility: "public",
    status: "active",
    discoverEnabled: true,
    uploader: {
      id: `user_${i % handles.length}`,
      handle: handles[i % handles.length],
      avatarColor: g[0],
      trustLevel: i % 5 === 0 ? "veteran" : i % 3 === 0 ? "trusted" : "new",
    },
    createdAt: new Date(Date.now() - i * 3.2 * 3600 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + (7 - (i % 7)) * 24 * 3600 * 1000).toISOString(),
    rankScore: 0,
    ...overrides,
  };
}

const rawVideos: Video[] = Array.from({ length: 24 }, (_, i) => makeVideo(i));

// Neutral, non-suggestive demonstration titles per the design guide's
// "safe demonstration content" rule.
export const featuredTitles = [
  "Morning coffee routine",
  "City walk vlog",
  "Weekend hiking trip",
  "Gameplay highlights reel",
  "Studio setup tour",
  "Quick pasta recipe",
  "Guitar cover session",
  "Product unboxing",
  "Home workout routine",
  "Coastal town travel diary",
];

rawVideos.forEach((v, i) => {
  v.title = featuredTitles[i % featuredTitles.length] + (i >= featuredTitles.length ? ` ${Math.floor(i / featuredTitles.length) + 1}` : "");
});

// A handful of flagged videos so the moderation queue has something to review.
const reportedIndexes: Record<number, number> = { 5: 2, 9: 6, 14: 1 };
rawVideos.forEach((v, i) => {
  if (reportedIndexes[i]) v.reportCount = reportedIndexes[i];
});

// Explainable ranking per the guide: views + a recency boost, minus a report penalty.
// No hidden/ML weighting — this is the whole formula.
function computeRankScore(v: Video): number {
  const hoursAgo = (Date.now() - new Date(v.createdAt).getTime()) / 3600000;
  const recencyBoost = Math.max(0, 4000 - hoursAgo * 40);
  const reportPenalty = v.reportCount * 500;
  return v.views + recencyBoost - reportPenalty;
}

rawVideos.forEach((v) => {
  v.rankScore = Math.round(computeRankScore(v));
});

export const videos: Video[] = [...rawVideos]
  .sort((a, b) => b.rankScore - a.rankScore)
  .map((v, idx) => ({ ...v, rank: idx + 1 }));

// New-account limits per the agreed MVP policy: 5 uploads/day, 2GB/file, 10GB total.
export const currentUserStorage: StorageUsage = {
  usedGb: 4.2,
  totalGb: 10,
};

export function formatDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.round(totalSeconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`;
  return `${n}`;
}

export function formatFileSize(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${Math.round(mb)} MB`;
}

export function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / 3600000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function expiresIn(iso: string): string {
  const diffMs = new Date(iso).getTime() - Date.now();
  if (diffMs <= 0) return "Expired";
  const days = Math.floor(diffMs / (24 * 3600000));
  if (days < 1) return "Expires today";
  if (days === 1) return "Expires in 1 day";
  return `Expires in ${days} days`;
}
