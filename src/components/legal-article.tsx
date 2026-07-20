import { AppShell } from "@/components/app-shell";

export function LegalArticle({
  title,
  meta,
  banner,
  children,
}: {
  title: string;
  meta: string;
  banner?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-6 py-10 md:px-10">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{meta}</p>

        {banner}

        <div
          className="mt-8 flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground
            [&_h2]:mt-6 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:first:mt-0
            [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1
            [&_strong]:text-foreground [&_strong]:font-medium"
        >
          {children}
        </div>
      </div>
    </AppShell>
  );
}
