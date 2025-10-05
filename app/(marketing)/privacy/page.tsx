import React from "react";
const EFFECTIVE_DATE = "October 5, 2025"; // update as needed

const Privacypage = () => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-10">
      <article className="prose lg:prose-lg">
        <h1>Privacy Policy</h1>
        <p>
          Effective date: <strong>{EFFECTIVE_DATE}</strong>
        </p>

        <p>
          COMPANY_NAME ("we", "us", "our") operates the website and services
          (collectively, the "Service"). This Privacy Policy explains how we
          collect, use, disclose, and protect your information.
        </p>

        <h2>1. What data we collect</h2>
        <ul>
          <li>
            <strong>Account information:</strong> name, email, hashed password,
            profile data.
          </li>
          <li>
            <strong>Usage data:</strong> study session times, durations,
            completed tasks, progress metrics (e.g. to provide personalized
            study insights).
          </li>
          <li>
            <strong>Device & technical data:</strong> IP address, browser type,
            device identifiers, OS, crash logs and analytics.
          </li>
          <li>
            <strong>Optional data:</strong> payment information (via third-party
            payment processors), uploaded study materials or notes.
          </li>
        </ul>

        <h2>2. How we use your data</h2>
        <ul>
          <li>
            To provide, maintain, and improve our Service (personalized
            schedules, analytics).
          </li>
          <li>To communicate with you about updates, billing, or support.</li>
          <li>To detect, prevent, and address technical issues or fraud.</li>
          <li>As required by law or to respond to legal process.</li>
        </ul>

        <h2>3. Legal basis (for users in applicable jurisdictions)</h2>
        <p>
          Where required, we rely on your consent, performance of a contract,
          legitimate interests (e.g. product improvement), or legal obligations.
        </p>

        <h2>4. Sharing & third parties</h2>
        <p>We may share data with:</p>
        <ul>
          <li>
            Service providers and vendors (e.g. hosting, analytics, payments)
            who process data on our behalf.
          </li>
          <li>
            Affiliates or as part of a corporate transaction (e.g. acquisition).
          </li>
          <li>When required by law, or to protect rights or safety.</li>
        </ul>

        <h2>5. Third-party services</h2>
        <p>
          We use third-party services such as analytics, cloud hosting, and
          payment processors. These providers have their own privacy practices;
          please review their policies. We do not control these third parties'
          activities.
        </p>

        <h2>6. Cookies & tracking</h2>
        <p>
          We use cookies and similar technologies to operate the Service,
          analyze usage, and provide features. You can manage cookie preferences
          through your browser or device settings. For detailed cookie list,
          include your cookie table here.
        </p>

        <h2>7. Security</h2>
        <p>
          We implement reasonable administrative, physical, and technical
          safeguards (e.g. encrypted storage, TLS in transit). However, no
          system is 100% secure — if you believe your account is compromised,
          contact us immediately at CONTACT_EMAIL.
        </p>

        <h2>8. Data retention</h2>
        <p>
          We retain personal data as long as necessary to provide the Service,
          comply with legal obligations, resolve disputes, and enforce
          agreements. You can request deletion of your account; some data may
          remain for legal or operational reasons.
        </p>

        <h2>9. Your rights</h2>
        <p>
          Depending on your jurisdiction, you may have rights to access,
          correct, or delete your personal data, or to object to processing. To
          exercise your rights, contact us at CONTACT_EMAIL.
        </p>

        <h2>10. International transfers</h2>
        <p>
          Your data may be processed in countries other than your own. We take
          steps to protect transfers (standard contractual clauses, etc.).
        </p>

        <h2>11. Children</h2>
      </article>
    </div>
  );
};

export default Privacypage;
