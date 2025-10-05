import React from "react";

const Termspage = () => {
  const EFFECTIVE_DATE = "October 5, 2025"; // update as needed

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-10">
      <article className="prose lg:prose-lg">
        <h1>Terms & Conditions</h1>
        <p>
          Effective date: <strong>{EFFECTIVE_DATE}</strong>
        </p>

        <h2>1. Acceptance of terms</h2>
        <p>
          By accessing or using the Service provided by COMPANY_NAME, you agree
          to be bound by these Terms. If you do not agree, do not use the
          Service.
        </p>

        <h2>2. The Service</h2>
        <p>
          COMPANY_NAME provides study planning, analytics, and productivity
          features. We may add, modify, or remove features at our discretion.
        </p>

        <h2>3. Accounts</h2>
        <p>
          To use certain features, you must create an account. You are
          responsible for maintaining the confidentiality of your credentials
          and for all activity that occurs under your account.
        </p>

        <h2>4. Payments & refunds</h2>
        <p>
          Paid features require payment through our payment processors. All
          payments are subject to the terms of the payment provider. Refund
          policy: specify your refund policy here.
        </p>

        <h2>5. Acceptable use</h2>
        <p>
          You agree not to use the Service for illegal activities or to attempt
          to interfere with the operation of the Service.
        </p>

        <h2>6. Intellectual property</h2>
        <p>
          All content, trademarks, and copyrights on the Service are owned by
          COMPANY_NAME or its licensors. You may not copy, modify, or distribute
          our content without permission.
        </p>

        <h2>7. User content</h2>
        <p>
          You retain ownership of content you upload (notes, study materials).
          By uploading, you grant COMPANY_NAME a limited license to host,
          display, and use that content to provide the Service.
        </p>

        <h2>8. Disclaimers</h2>
        <p>
          THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES
          OF ANY KIND. COMPANY_NAME DOES NOT WARRANT THAT THE SERVICE WILL BE
          UNINTERRUPTED OR ERROR-FREE.
        </p>

        <h2>9. Limitation of liability</h2>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, COMPANY_NAME WILL NOT BE
          LIABLE FOR INDIRECT, INCIDENTAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES
          ARISING FROM YOUR USE OF THE SERVICE.
        </p>

        <h2>10. Termination</h2>
        <p>
          We may suspend or terminate accounts for violations of these Terms.
          You may delete your account at any time; see the account settings.
        </p>

        <h2>11. Governing law</h2>
        <p>
          These Terms are governed by the laws of your jurisdiction (or specify
          a jurisdiction). Include a specific choice of law if desired.
        </p>

        <h2>12. Changes to these Terms</h2>
        <p>
          We may modify the Terms; material changes will be notified. Continued
          use after changes means you accept them.
        </p>

        <h2>13. Contact</h2>
        <p>
          If you have questions about these Terms, contact us at{" "}
          <a href="mailto:CONTACT_EMAIL">CONTACT_EMAIL</a>.
        </p>
      </article>
    </div>
  );
};

export default Termspage;
