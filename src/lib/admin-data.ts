import type { AppUser, Inquiry, BlacklistEntry, ReportTicket } from "./types";
import { videos } from "./mock-data";

const now = Date.now();
const daysAgo = (n: number) => new Date(now - n * 24 * 3600 * 1000).toISOString();

export const adminUsers: AppUser[] = [
  { id: "user_0", handle: "nightowl", email: "nightowl@mail.com", status: "active", trustLevel: "veteran", uploads: 9, reportCount: 0, joinedAt: daysAgo(210) },
  { id: "user_1", handle: "reika_v", email: "reika.v@mail.com", status: "active", trustLevel: "trusted", uploads: 6, reportCount: 1, joinedAt: daysAgo(140) },
  { id: "user_2", handle: "misty.k", email: "misty.k@mail.com", status: "active", trustLevel: "new", uploads: 2, reportCount: 2, joinedAt: daysAgo(12) },
  { id: "user_3", handle: "aoi_studio", email: "aoi.studio@mail.com", status: "active", trustLevel: "trusted", uploads: 11, reportCount: 0, joinedAt: daysAgo(95) },
  { id: "user_4", handle: "kuro_cam", email: "kuro.cam@mail.com", status: "banned", trustLevel: "new", uploads: 4, reportCount: 6, joinedAt: daysAgo(30) },
  { id: "user_5", handle: "yuzu.fps", email: "yuzu.fps@mail.com", status: "active", trustLevel: "new", uploads: 3, reportCount: 0, joinedAt: daysAgo(8) },
  { id: "user_6", handle: "hana_edit", email: "hana.edit@mail.com", status: "active", trustLevel: "veteran", uploads: 14, reportCount: 0, joinedAt: daysAgo(260) },
  { id: "user_7", handle: "rin_takes", email: "rin.takes@mail.com", status: "active", trustLevel: "trusted", uploads: 7, reportCount: 1, joinedAt: daysAgo(75) },
];

export const inquiries: Inquiry[] = [
  {
    id: "inq_1",
    category: "copyright",
    email: "rights.holder@example.com",
    subject: "Unauthorized use of my footage",
    message: "This video appears to reuse a clip I own the rights to. Please review and take it down if confirmed.",
    relatedUrl: `swimmyfile.io/v/${videos[5]?.shareToken}`,
    status: "open",
    createdAt: daysAgo(1),
  },
  {
    id: "inq_2",
    category: "report",
    email: "concerned.user@example.com",
    subject: "Video flagged as spam",
    message: "This account seems to be reposting the same clip repeatedly across multiple uploads.",
    relatedUrl: `swimmyfile.io/v/${videos[9]?.shareToken}`,
    status: "open",
    createdAt: daysAgo(2),
  },
  {
    id: "inq_3",
    category: "account",
    email: "newuser@example.com",
    subject: "Can't verify my email",
    message: "I signed up yesterday but never received the verification email. Can you resend it?",
    status: "open",
    createdAt: daysAgo(3),
  },
  {
    id: "inq_4",
    category: "general",
    email: "press@example.com",
    subject: "Press inquiry about Swimmy File",
    message: "We're writing a piece about emerging file-sharing platforms and would love a quick comment.",
    status: "resolved",
    createdAt: daysAgo(9),
  },
];

const flagged5 = videos[5];
const flagged9 = videos[9];
const flagged14 = videos[14];

export const reportTickets: ReportTicket[] = [
  {
    id: "rep_1",
    videoId: flagged5.id,
    videoTitle: flagged5.title,
    shareToken: flagged5.shareToken,
    reporterHandle: "rights.holder",
    reason: "copyright",
    message: "This reuses a clip I own the rights to.",
    status: "reviewing",
    createdAt: daysAgo(1),
  },
  {
    id: "rep_2",
    videoId: flagged5.id,
    videoTitle: flagged5.title,
    shareToken: flagged5.shareToken,
    reason: "copyright",
    status: "open",
    createdAt: daysAgo(1),
  },
  {
    id: "rep_3",
    videoId: flagged9.id,
    videoTitle: flagged9.title,
    shareToken: flagged9.shareToken,
    reporterHandle: "concerned_user",
    reason: "spam",
    message: "Same clip reposted repeatedly from this account.",
    status: "open",
    createdAt: daysAgo(2),
  },
  {
    id: "rep_4",
    videoId: flagged9.id,
    videoTitle: flagged9.title,
    shareToken: flagged9.shareToken,
    reason: "spam",
    status: "open",
    createdAt: daysAgo(2),
  },
  {
    id: "rep_5",
    videoId: flagged9.id,
    videoTitle: flagged9.title,
    shareToken: flagged9.shareToken,
    reporterHandle: "misty.k",
    reason: "other",
    message: "Possibly reposted without the original creator's consent.",
    status: "resolved",
    createdAt: daysAgo(6),
  },
  {
    id: "rep_6",
    videoId: flagged14.id,
    videoTitle: flagged14.title,
    shareToken: flagged14.shareToken,
    reason: "adult",
    status: "rejected",
    createdAt: daysAgo(4),
  },
];

export const blacklist: BlacklistEntry[] = [
  { id: "bl_1", type: "user", value: "@kuro_cam", reason: "Repeated copyright violations", createdAt: daysAgo(5) },
  { id: "bl_2", type: "ip", value: "203.0.113.42", reason: "Mass account creation", createdAt: daysAgo(18) },
  { id: "bl_3", type: "email", value: "tempmail42@discard.io", reason: "Disposable email domain", createdAt: daysAgo(40) },
];
