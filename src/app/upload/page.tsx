import { redirect } from "next/navigation";

// This used to be a standalone single-video upload form, built before the
// homepage became the upload flow (see HomeUploadHero on "/") — it's
// unreachable from any nav link now and fully superseded by "/", which
// already handles multi-file share packages for guests and logged-in users
// alike. Redirect rather than delete outright: any old bookmark or external
// link to /upload still lands somewhere useful instead of a 404.
export default function UploadPage() {
  redirect("/");
}
