import { notFound } from "next/navigation";
import { PublicLayout } from "@/components/public-layout";
import { SharedPackageView } from "@/components/shared-package-view";
import { getPackageByShareToken, videos, myVideoIds } from "@/lib/mock-data";

// This is the file-sharing landing page (think Gofile/GigaFile), not a
// video-watching page — one share link can hold one or more files (see
// SharePackage/PackageFile in lib/types.ts). Deliberately no sidebar, no
// "More like this" rail, no uploader profile block. Just: the file list and
// the actions someone opening a shared link actually wants (download each
// file, copy the link, report). See PublicLayout for the shared no-sidebar
// chrome used here, on /, and on /upload.
//
// Stays a server component only for the deterministic mock-package lookup
// (fast, SEO-safe first paint for anyone's browser); SharedPackageView (a
// client component) is what actually decides whether to show that fallback
// or this browser's own real upload — see its own comment for why.
export default async function SharedPackagePage({
  params,
}: {
  params: Promise<{ shareToken: string }>;
}) {
  const { shareToken } = await params;
  const fallbackPackage = getPackageByShareToken(shareToken);
  if (!fallbackPackage) notFound();

  const isMineFallback = myVideoIds.has(fallbackPackage.id);
  const related = videos
    .filter((v) => v.id !== fallbackPackage.id && v.category === fallbackPackage.category)
    .slice(0, 6);

  return (
    <PublicLayout>
      <SharedPackageView
        shareToken={shareToken}
        fallbackPackage={fallbackPackage}
        isMineFallback={isMineFallback}
        related={related}
      />
    </PublicLayout>
  );
}
