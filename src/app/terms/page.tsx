import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { LegalArticle } from "@/components/legal-article";

export default function TermsPage() {
  return (
    <LegalArticle
      title="Terms of Service"
      meta="Draft — last updated: July 18, 2026"
      banner={
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 p-3 text-xs text-muted-foreground">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          <p>
            This is a working draft assembled from Swimmy File&apos;s documented MVP policies (upload
            limits, prohibited content, moderation, reporting), not the operating company&apos;s
            finalized legal text. It has not been reviewed by a lawyer and should be replaced with the
            Company&apos;s actual Terms of Service before public launch.
          </p>
        </div>
      }
    >
      <p>
        These Terms of Service (&ldquo;Terms&rdquo;) govern access to and use of Swimmy File
        (&ldquo;the Service&rdquo;), operated by Bavarois LLC (&ldquo;the Company&rdquo;). By creating an
        account or using the Service, you agree to these Terms.
      </p>

      <h2>1. The Service</h2>
      <p>
        Swimmy File is a video and file sharing service. Users may upload files, receive a shareable
        link, and choose to make content public (discoverable within the Service) or private
        (accessible only via direct link).
      </p>

      <h2>2. Accounts</h2>
      <ul>
        <li>You must provide a valid email address and verify it before uploading content.</li>
        <li>You are responsible for maintaining the security of your account credentials.</li>
        <li>One account per person. Creating multiple accounts to evade limits or a ban is prohibited.</li>
      </ul>

      <h2>3. Uploads and Storage</h2>
      <ul>
        <li>New accounts are subject to initial limits (currently up to 5 uploads per day, 2GB per file, 10GB total storage). Limits may increase as an account&apos;s trust level rises.</li>
        <li>Uploaded files may be deleted automatically after their configured expiration period.</li>
        <li>The Company may generate thumbnails and store files using third-party cloud infrastructure (e.g. AWS S3/CloudFront) to operate the Service.</li>
      </ul>

      <h2>4. Prohibited Content and Conduct</h2>
      <p>You may not upload, share, or link to content that:</p>
      <ul>
        <li>Infringes copyright or other intellectual property rights;</li>
        <li>Is illegal, or depicts or involves minors in a sexual or exploitative manner;</li>
        <li>Constitutes harassment, threats, or violent content;</li>
        <li>Is spam, or is uploaded through automated/bulk means to circumvent upload limits;</li>
        <li>Contains malware or is otherwise intended to harm the Service or its users.</li>
      </ul>

      <h2>5. Reporting and Moderation</h2>
      <p>
        Users may report content for copyright infringement, spam, adult content, violence, or other
        concerns. The Company reviews reports and may hide, remove, or restrict content, and may
        suspend or ban accounts (including by IP address, email, or account) that violate these Terms.
        Newly uploaded public content may not appear in Discover until it passes an initial review
        period.
      </p>

      <h2>6. Copyright / Rights Holder Requests</h2>
      <p>
        If you believe content on the Service infringes your copyright, submit a request via the{" "}
        <Link href="/contact" className="text-primary hover:underline">
          Contact page
        </Link>
        , selecting the copyright/rights-holder category and including enough detail to identify the
        content and your claim. The Company will review and may remove content pending investigation.
      </p>

      <h2>7. Content Ownership and License</h2>
      <p>
        You retain ownership of content you upload. By uploading, you grant the Company a limited
        license to host, store, and display that content solely as necessary to operate the Service
        (e.g. serving playback, generating thumbnails, showing it in Discover if public).
      </p>

      <h2>8. Termination</h2>
      <p>
        The Company may suspend or terminate accounts that violate these Terms, at its discretion,
        with or without notice. Users may stop using the Service at any time.
      </p>

      <h2>9. Disclaimers and Limitation of Liability</h2>
      <p>
        The Service is provided &ldquo;as is&rdquo; without warranties of any kind. To the maximum
        extent permitted by law, the Company is not liable for indirect, incidental, or consequential
        damages arising from use of the Service.
      </p>

      <h2>10. Changes to these Terms</h2>
      <p>
        The Company may update these Terms from time to time. Continued use of the Service after
        changes are posted constitutes acceptance of the updated Terms.
      </p>

      <h2>11. Governing Law</h2>
      <p>[Governing law and jurisdiction to be specified by the Company.]</p>

      <h2>12. Contact</h2>
      <p>
        Questions about these Terms can be sent via the{" "}
        <Link href="/contact" className="text-primary hover:underline">
          Contact page
        </Link>
        .
      </p>
    </LegalArticle>
  );
}
