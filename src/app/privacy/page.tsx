import { LegalArticle } from "@/components/legal-article";

export default function PrivacyPage() {
  return (
    <LegalArticle title="Privacy Policy" meta="Last updated: July 11, 2026">
      <p>
        Bavarois LLC (hereinafter referred to as &ldquo;the Company&rdquo;) hereby sets out the following
        privacy policy regarding the handling of users&apos; personal information in relation to
        &ldquo;Swimmy File&rdquo; (hereinafter referred to as &ldquo;the Service&rdquo;), which is provided
        by the Company.
      </p>

      <h2>1. Information Collected</h2>
      <p>In providing the Service, the Company may collect the following information:</p>
      <ul>
        <li>Full name or nickname</li>
        <li>Email address</li>
        <li>Account information</li>
        <li>IP address</li>
        <li>Browser and device information</li>
        <li>Date and time of access and usage history</li>
        <li>Records relating to uploads and downloads</li>
        <li>Details of enquiries</li>
        <li>Other information necessary for the provision of the Service</li>
      </ul>

      <h2>2. Purposes of Use</h2>
      <p>The Company shall use the information collected for the following purposes:</p>
      <ul>
        <li>Provision and operation of the Service</li>
        <li>Identity verification</li>
        <li>Customer support</li>
        <li>Improvement of service quality</li>
        <li>Prevention of unauthorised use and security measures</li>
        <li>Response to breaches of the Terms of Service</li>
        <li>Compliance with laws and regulations</li>
        <li>Other purposes incidental to the above</li>
      </ul>

      <h2>3. Management of Personal Information</h2>
      <p>
        We shall implement reasonable security measures to prevent unauthorised access, leakage,
        tampering and loss of the personal information we collect.
      </p>

      <h2>4. Disclosure to Third Parties</h2>
      <p>
        We will not disclose personal information to third parties without the user&apos;s consent,
        except where required by law or where there are other legitimate grounds.
      </p>

      <h2>5. External Services</h2>
      <p>
        This Service may utilise cloud services, web analytics tools and other external services for
        the purpose of operating the Service or improving its quality.
      </p>

      <h2>6. Use of Cookies and Similar Technologies</h2>
      <p>
        This Service may use cookies and other similar technologies to enhance convenience, analyse
        usage patterns and improve the Service.
      </p>

      <h2>7. Disclosure, etc. of Personal Information</h2>
      <p>
        Users may request the disclosure, correction, deletion or suspension of use of their personal
        information in accordance with the provisions of laws and regulations.
      </p>

      <h2>8. Amendments to this Policy</h2>
      <p>
        We may amend this Policy in response to amendments to laws and regulations or changes to the
        content of the Service. The amended terms shall take effect from the time they are posted on
        this Service.
      </p>

      <h2>9. Enquiries</h2>
      <p>For enquiries regarding this Policy, please contact the enquiry desk designated separately by us.</p>

      <div className="mt-4 border-t border-border pt-4 text-xs">
        <p>
          <strong>Operating Company</strong>
          <br />
          Bavarois LLC
        </p>
        <p className="mt-2">
          <strong>Service Name</strong>
          <br />
          Swimmy File
        </p>
      </div>
    </LegalArticle>
  );
}
