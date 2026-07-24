import type {
  Category,
  Tag,
  Video,
  StorageUsage,
  UploadHistoryEntry,
  UploadLimits,
  SharePackage,
  PackageFile,
  FileType,
} from "./types";

// "All" / "Popular" / "New" are view filters, not genres — kept separate from
// the real category list so video generation below never assigns a video to
// one of them by mistake.
const pseudoCategories: Category[] = [
  { slug: "all", name: "All", count: 12400 },
  { slug: "popular", name: "Popular", count: 2100 },
  { slug: "new", name: "New", count: 3700 },
];

const genreCategories: Category[] = [
  { slug: "music", name: "Music", count: 1800, description: "Music-related public uploads: covers, sessions, and tracks." },
  { slug: "gaming", name: "Gaming", count: 2600, description: "Game-related public uploads and clips." },
  { slug: "movies", name: "Movies & Animation", count: 1400, description: "Shared films, animation, and edits." },
  { slug: "technology", name: "Technology", count: 1900, description: "Tech reviews, guides, and shared resources." },
  { slug: "education", name: "Education", count: 1300, description: "Tutorials, explainers, and learning resources." },
  { slug: "lifestyle", name: "Lifestyle", count: 1700, description: "Everyday uploads: routines, diaries, and moments." },
  { slug: "travel", name: "Travel", count: 1200, description: "Trip diaries and destination guides." },
  { slug: "sports", name: "Sports", count: 1000, description: "Shared highlights, training, and match footage." },
  { slug: "other", name: "Other", count: 900, description: "Everything that doesn't fit elsewhere." },
];

export const categories: Category[] = [...pseudoCategories, ...genreCategories];

// Chip/filter lists (Discover's category row, Search's category filter)
// should never surface Popular/New — those are sort/mode filters, not
// categories, and no video is ever tagged with those slugs so they'd
// silently show zero results if picked as a category. Categories page
// excludes "all" too since it has no "browse everything" tile.
export const browsableCategories: Category[] = categories.filter((c) => c.slug !== "popular" && c.slug !== "new");

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
    // Downloads are always a fraction of views (not everyone who watches a
    // preview downloads the file) — deterministic like the other mock stats.
    downloadCount: Math.round(views * (0.05 + seededRandom(i + 5.4) * 0.1)),
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

// --- Share packages (multi-file upload model) --------------------------
// Every existing mock "video" is treated as a package of its own — the
// video file itself, plus zero to two synthesized sibling files (a cover
// image, a notes doc, etc.) — so /d/[shareToken] and Discover can render
// the new multi-file package UI without a second parallel dataset. A real
// backend replaces this with actual PackageFile rows (see prisma schema);
// nothing downstream needs to change shape when that happens.

function seedFromId(id: string): number {
  const match = /vid_(\d+)/.exec(id);
  if (match) return Number(match[1]);
  let h = 0;
  for (let c = 0; c < id.length; c++) h = (h * 31 + id.charCodeAt(c)) % 100000;
  return h;
}

function slugify(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-+|-+$)/g, "") || "file";
}

const extraFilePool: { name: string; type: FileType; mimeType: string; sizeMbRange: [number, number] }[] = [
  { name: "cover-photo.jpg", type: "IMAGE", mimeType: "image/jpeg", sizeMbRange: [2, 8] },
  { name: "photo-01.png", type: "IMAGE", mimeType: "image/png", sizeMbRange: [1, 6] },
  { name: "thumbnail.png", type: "IMAGE", mimeType: "image/png", sizeMbRange: [0.5, 3] },
  {
    name: "notes.pdf",
    type: "DOCUMENT",
    mimeType: "application/pdf",
    sizeMbRange: [0.2, 4],
  },
  {
    name: "details.docx",
    type: "DOCUMENT",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    sizeMbRange: [0.1, 2],
  },
  { name: "voiceover.mp3", type: "AUDIO", mimeType: "audio/mpeg", sizeMbRange: [3, 12] },
];

export function videoToPackage(video: Video): SharePackage {
  const seed = seedFromId(video.id);
  const extraCount = Math.floor(seededRandom(seed + 20.5) * 3); // 0-2 extra files, deterministic per video

  const files: PackageFile[] = [
    {
      id: `${video.id}_f0`,
      originalFileName: `${slugify(video.title)}.mp4`,
      displayName: `${slugify(video.title)}.mp4`,
      fileSizeBytes: Math.round(video.fileSizeMb * 1024 * 1024),
      mimeType: "video/mp4",
      fileType: "VIDEO",
      thumbnailGradient: video.thumbnailGradient,
      durationSeconds: video.durationSeconds,
      downloadCount: video.downloadCount,
    },
  ];

  for (let k = 0; k < extraCount; k++) {
    const pool = extraFilePool[(seed + k * 7) % extraFilePool.length];
    const [minMb, maxMb] = pool.sizeMbRange;
    const sizeMb = minMb + seededRandom(seed + k + 40.1) * (maxMb - minMb);
    files.push({
      id: `${video.id}_f${k + 1}`,
      originalFileName: pool.name,
      displayName: pool.name,
      fileSizeBytes: Math.round(sizeMb * 1024 * 1024),
      mimeType: pool.mimeType,
      fileType: pool.type,
      // Images can use the package's own gradient as a stand-in preview;
      // other file types have no visual to preview.
      ...(pool.type === "IMAGE" ? { thumbnailGradient: video.thumbnailGradient } : null),
      downloadCount: Math.round(video.downloadCount * (0.1 + seededRandom(seed + k + 60) * 0.2)),
    });
  }

  const totalSizeBytes = files.reduce((sum, f) => sum + f.fileSizeBytes, 0);

  return {
    id: video.id,
    shareToken: video.shareToken,
    ownerType: "USER",
    title: video.title,
    description: video.description,
    files,
    fileCount: files.length,
    totalSizeBytes,
    category: video.category,
    tags: video.tags,
    visibility: video.visibility,
    discoverEnabled: video.discoverEnabled,
    viewCount: video.views,
    downloadCount: video.downloadCount,
    reportCount: video.reportCount,
    uploader: video.uploader,
    createdAt: video.createdAt,
    expiresAt: video.expiresAt,
    // No ZIP ever requested for a fresh mock package — see lib/package-zip.ts.
    zipStatus: "NONE",
    zipDownloadCount: 0,
  };
}

/** Package-summary fields for a Discover/Search card — cheaper than a full videoToPackage() when only badges are needed. */
export function packageSummary(video: Video): { fileCount: number; totalSizeBytes: number; fileTypes: FileType[] } {
  const pkg = videoToPackage(video);
  return { fileCount: pkg.fileCount, totalSizeBytes: pkg.totalSizeBytes, fileTypes: Array.from(new Set(pkg.files.map((f) => f.fileType))) };
}

export function getPackageByShareToken(shareToken: string): SharePackage | undefined {
  const video = videos.find((v) => v.shareToken === shareToken);
  return video ? videoToPackage(video) : undefined;
}

// The videos shown as "mine" on /me — until real auth/ownership exists,
// this mock just claims the first 7. Exported so any page that needs to
// know "is this my video" (e.g. hiding the Report button on my own video's
// detail page) shares this definition instead of re-deriving it.
export const myVideos: Video[] = videos.slice(0, 7);
export const myVideoIds: ReadonlySet<string> = new Set(myVideos.map((v) => v.id));

// New-account policy: 5 uploads/day, 2GB/file (see currentUserStorage below
// for the 10GB total cap). "usedToday" is a fixed mock value, not derived
// from myVideos' createdAt — none of those are actually "today" other than
// the newest one.
export const currentUserUploadLimit: UploadLimits = {
  uploadsToday: 2,
  dailyUploadLimit: 5,
  maxFileSizeGb: 2,
};

// Upload History is the pipeline view (did the upload/processing/thumbnail
// steps succeed), distinct from My Uploads (the package management view) —
// same underlying videos, reframed, plus one synthetic failed attempt that
// never became a real Video record (so it has no shareToken).
const failedUploadEntry: UploadHistoryEntry = {
  id: "upload_failed_1",
  title: "clip_export_final_v3.mov",
  thumbnailGradient: gradients[gradients.length - 1],
  createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
  fileSizeMb: 812,
  uploadStatus: "failed",
  thumbnailStatus: "failed",
  errorReason: "Unsupported file type",
};

export const uploadHistory: UploadHistoryEntry[] = [
  failedUploadEntry,
  ...myVideos.map((v): UploadHistoryEntry => ({
    id: `upload_${v.id}`,
    title: v.title,
    thumbnailGradient: v.thumbnailGradient,
    createdAt: v.createdAt,
    fileSizeMb: v.fileSizeMb,
    uploadStatus: v.status === "processing" ? "processing" : expiresIn(v.expiresAt) === "Expired" ? "expired" : "active",
    thumbnailStatus: v.status === "processing" ? "pending" : "generated",
    shareToken: v.shareToken,
  })),
].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

const allTagSlugs: string[] = Array.from(new Set(videos.flatMap((v) => v.tags)));
const allUploaderHandles: string[] = Array.from(new Set(videos.map((v) => v.uploader.handle)));

export interface SearchSuggestion {
  type: "video" | "tag" | "uploader";
  label: string;
  sublabel?: string;
  href: string;
}

// Header search-box autocomplete: a handful of matching videos, tags, and
// uploaders, cheapest match first. Real backend would do this server-side
// (full-text search, ranking) — this is a client-side stand-in over the
// same mock data /search already filters against.
export function getSearchSuggestions(query: string, limit = 8): SearchSuggestion[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const videoMatches: SearchSuggestion[] = videos
    .filter((v) => v.status === "active" && v.visibility === "public" && v.title.toLowerCase().includes(q))
    .slice(0, 4)
    .map((v) => ({ type: "video", label: v.title, sublabel: `@${v.uploader.handle}`, href: `/d/${v.shareToken}` }));

  const tagMatches: SearchSuggestion[] = allTagSlugs
    .filter((t) => t.includes(q))
    .slice(0, 3)
    .map((t) => ({ type: "tag", label: `#${t}`, href: `/search?q=${encodeURIComponent(t)}` }));

  const uploaderMatches: SearchSuggestion[] = allUploaderHandles
    .filter((h) => h.toLowerCase().includes(q))
    .slice(0, 3)
    .map((h) => ({ type: "uploader", label: `@${h}`, href: `/search?q=${encodeURIComponent(h)}` }));

  return [...videoMatches, ...tagMatches, ...uploaderMatches].slice(0, limit);
}

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
