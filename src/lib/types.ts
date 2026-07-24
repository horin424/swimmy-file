export type Visibility = "public" | "private";

// --- Share packages (multi-file upload model) --------------------------
// A share link now points at a *package* of one or more files (Gofile/
// GigaFile-style), not a single video. These mirror the suggested
// SharePackage/PackageFile shape for the eventual real backend closely
// enough that swapping mock data for real API responses only touches
// where these values come from, not their shape (see mock-data.ts's
// videoToPackage/getPackageByShareToken and use-multi-file-upload-flow.ts).

export type FileType = "VIDEO" | "IMAGE" | "AUDIO" | "DOCUMENT" | "ARCHIVE" | "OTHER";

export interface PackageFile {
  id: string;
  originalFileName: string;
  displayName: string;
  fileSizeBytes: number;
  mimeType: string;
  fileType: FileType;
  thumbnailGradient?: [string, string];
  durationSeconds?: number;
  downloadCount: number;
}

export type PackageOwnerType = "GUEST" | "USER";

export interface SharePackage {
  id: string;
  shareToken: string;
  ownerType: PackageOwnerType;
  title: string;
  description?: string;
  files: PackageFile[];
  fileCount: number;
  totalSizeBytes: number;
  category?: string;
  tags: string[];
  visibility: Visibility;
  discoverEnabled: boolean;
  viewCount: number;
  downloadCount: number;
  reportCount: number;
  uploader?: Uploader;
  createdAt: string;
  expiresAt: string;
}

export type VideoStatus = "processing" | "active" | "hidden" | "removed";

export interface Category {
  slug: string;
  name: string;
  count: number;
  /** Short one-line blurb shown on the Categories page cards. Not every
   * category has one — "All"/"Popular"/"New" are filters, not genres. */
  description?: string;
}

export interface Tag {
  slug: string;
  name: string;
  count: number;
}

export interface Uploader {
  id: string;
  handle: string;
  avatarColor: string;
  trustLevel: "new" | "trusted" | "veteran";
}

export interface Video {
  id: string;
  shareToken: string;
  title: string;
  description: string;
  thumbnailGradient: [string, string];
  durationSeconds: number;
  fileSizeMb: number;
  views: number;
  downloadCount: number;
  reportCount: number;
  category: string;
  tags: string[];
  visibility: Visibility;
  status: VideoStatus;
  discoverEnabled: boolean;
  uploader: Uploader;
  createdAt: string;
  expiresAt: string;
  /** Internal ranking helper (views + recency, minus a report penalty) — not a user-facing metric. */
  rankScore: number;
  rank?: number;
}

export interface StorageUsage {
  usedGb: number;
  totalGb: number;
}

// Distinct from VideoStatus (moderation/lifecycle state of a *published*
// video) — this tracks the upload pipeline itself, including attempts that
// never became a real Video record.
export type UploadPipelineStatus = "processing" | "active" | "failed" | "expired";
export type ThumbnailPipelineStatus = "pending" | "generated" | "failed";

export interface UploadHistoryEntry {
  id: string;
  title: string;
  thumbnailGradient: [string, string];
  createdAt: string;
  fileSizeMb: number;
  uploadStatus: UploadPipelineStatus;
  thumbnailStatus: ThumbnailPipelineStatus;
  errorReason?: string;
  /** Present when the upload succeeded and has a real video/detail page. */
  shareToken?: string;
}

export interface UploadLimits {
  uploadsToday: number;
  dailyUploadLimit: number;
  maxFileSizeGb: number;
}

// Mirrors the response shape of the planned GET /api/upload/eligibility
// endpoint (see useUploadEligibility in lib/upload-eligibility.ts) so
// swapping the mock implementation for a real fetch is a drop-in change —
// nothing that reads this type needs to know which one it's talking to.
export type UploadEligibilityReason = "GUEST_LIMIT_REACHED" | "EMAIL_VERIFICATION_REQUIRED" | null;

export interface UploadEligibility {
  canUpload: boolean;
  userType: "guest" | "user";
  guestLimitBytes: number;
  guestUsedBytes: number;
  guestRemainingBytes: number;
  requiresLogin: boolean;
  reason: UploadEligibilityReason;
}

export type UserStatus = "active" | "banned";

export interface AppUser {
  id: string;
  handle: string;
  email: string;
  status: UserStatus;
  trustLevel: "new" | "trusted" | "veteran";
  uploads: number;
  reportCount: number;
  joinedAt: string;
}

export type InquiryStatus = "open" | "resolved";

export interface Inquiry {
  id: string;
  category: "general" | "copyright" | "report" | "account";
  email: string;
  subject: string;
  message: string;
  relatedUrl?: string;
  status: InquiryStatus;
  createdAt: string;
}

export type BlacklistType = "ip" | "email" | "user";

export interface BlacklistEntry {
  id: string;
  type: BlacklistType;
  value: string;
  reason: string;
  createdAt: string;
}

export type ReportReason = "copyright" | "spam" | "adult" | "violence" | "other";

export type ReportTicketStatus = "open" | "reviewing" | "resolved" | "rejected";

// Named ReportTicket (not "Report") to avoid clashing with the Prisma `Report`
// model once real data replaces this mock.
export interface ReportTicket {
  id: string;
  videoId: string;
  videoTitle: string;
  shareToken: string;
  reporterHandle?: string;
  reason: ReportReason;
  message?: string;
  status: ReportTicketStatus;
  createdAt: string;
}
