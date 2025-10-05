import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions - Usoro",
  description:
    "Terms and Conditions for Usoro - AI-powered study automation platform",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              Terms and Conditions
            </h1>
            <p className="text-muted-foreground">
              Last updated:{" "}
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                Agreement to Terms
              </h2>
              <p className="text-foreground/80 leading-relaxed">
                By accessing or using Usoro ("the Platform"), you agree to be
                bound by these Terms and Conditions. If you do not agree to
                these terms, please do not use our platform. Usoro provides
                AI-powered automation and insights to maximize your studying
                efficiency and help you achieve your academic goals.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                Description of Service
              </h2>
              <p className="text-foreground/80 leading-relaxed">
                Usoro is an AI-powered study automation platform that helps
                students optimize their learning experience. Our services
                include:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground/80">
                <li>
                  Automated scheduling of study sessions using Google Calendar
                  API
                </li>
                <li>
                  Creation of Google Meet meetings for collaborative studying
                </li>
                <li>AI-powered study recommendations and insights</li>
                <li>Progress tracking and academic goal management</li>
                <li>
                  Personalized study schedules and efficiency optimization
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                User Accounts and Registration
              </h2>

              <h3 className="text-xl font-medium text-foreground">
                Account Creation
              </h3>
              <p className="text-foreground/80 leading-relaxed">
                To use Usoro, you must create an account and provide accurate,
                complete information. You are responsible for:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground/80">
                <li>
                  Maintaining the confidentiality of your account credentials
                </li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized access</li>
                <li>Ensuring you are at least 13 years of age</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mt-6">
                Calendar Integration
              </h3>
              <p className="text-foreground/80 leading-relaxed">
                By connecting your Google Calendar, you grant Usoro permission
                to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground/80">
                <li>
                  Access your calendar availability and free/busy information
                </li>
                <li>Create, modify, and delete study session events</li>
                <li>Generate Google Meet links for scheduled sessions</li>
                <li>Send calendar invitations to study session participants</li>
              </ul>
              <p className="text-foreground/80 leading-relaxed mt-4">
                You can revoke this access at any time through your Google
                account settings.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                Acceptable Use Policy
              </h2>
              <p className="text-foreground/80 leading-relaxed">
                You agree to use Usoro only for lawful purposes and in
                accordance with these Terms. You agree NOT to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground/80">
                <li>
                  Use the platform for any illegal or unauthorized purpose
                </li>
                <li>Violate any applicable laws or regulations</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Share inappropriate content in study sessions</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt the platform's functionality</li>
                <li>
                  Use automated systems to access the platform without
                  permission
                </li>
                <li>Misrepresent your identity or affiliation</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                AI-Powered Features and Limitations
              </h2>
              <p className="text-foreground/80 leading-relaxed">
                Our platform uses artificial intelligence to provide study
                recommendations and insights. You acknowledge that:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground/80">
                <li>
                  AI recommendations are suggestions and not guarantees of
                  academic success
                </li>
                <li>
                  You are responsible for your own academic decisions and
                  outcomes
                </li>
                <li>
                  AI insights are based on patterns and may not be perfect for
                  every individual
                </li>
                <li>
                  The platform is a tool to assist learning, not a replacement
                  for actual studying
                </li>
                <li>
                  Academic success depends on your effort, dedication, and study
                  habits
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                Intellectual Property Rights
              </h2>

              <h3 className="text-xl font-medium text-foreground">
                Our Content
              </h3>
              <p className="text-foreground/80 leading-relaxed">
                The platform, including its design, features, algorithms, and
                content, is owned by Usoro and protected by intellectual
                property laws. You may not copy, modify, distribute, or create
                derivative works without our express written permission.
              </p>

              <h3 className="text-xl font-medium text-foreground mt-6">
                Your Content
              </h3>
              <p className="text-foreground/80 leading-relaxed">
                You retain ownership of any content you create or upload to the
                platform (study notes, session recordings, etc.). By using our
                platform, you grant us a license to use this content solely to
                provide and improve our services.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                Payment and Subscription Terms
              </h2>
              <p className="text-foreground/80 leading-relaxed">
                If you subscribe to a paid plan:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground/80">
                <li>
                  Fees are billed in advance on a recurring basis (monthly or
                  annually)
                </li>
                <li>
                  You authorize us to charge your payment method automatically
                </li>
                <li>
                  Subscription fees are non-refundable except as required by law
                </li>
                <li>
                  We may change pricing with 30 days' notice to existing
                  subscribers
                </li>
                <li>
                  You can cancel your subscription at any time; access continues
                  until the end of the billing period
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                Third-Party Services
              </h2>
              <p className="text-foreground/80 leading-relaxed">
                Usoro integrates with third-party services, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground/80">
                <li>Google Calendar API for scheduling</li>
                <li>Google Meet for video conferencing</li>
                <li>Other educational and productivity tools</li>
              </ul>
              <p className="text-foreground/80 leading-relaxed mt-4">
                Your use of these third-party services is subject to their
                respective terms and conditions. We are not responsible for the
                availability, functionality, or policies of third-party
                services.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                Disclaimers and Limitations of Liability
              </h2>

              <h3 className="text-xl font-medium text-foreground">
                Service Availability
              </h3>
              <p className="text-foreground/80 leading-relaxed">
                We strive to provide reliable service but do not guarantee
                uninterrupted access. The platform is provided "as is" and "as
                available" without warranties of any kind, express or implied.
              </p>

              <h3 className="text-xl font-medium text-foreground mt-6">
                Academic Outcomes
              </h3>
              <p className="text-foreground/80 leading-relaxed">
                We do not guarantee specific academic results or improvements.
                Your academic success depends on many factors beyond our
                platform's capabilities.
              </p>

              <h3 className="text-xl font-medium text-foreground mt-6">
                Limitation of Liability
              </h3>
              <p className="text-foreground/80 leading-relaxed">
                To the maximum extent permitted by law, Usoro shall not be
                liable for any indirect, incidental, special, consequential, or
                punitive damages, including loss of data, academic
                opportunities, or other intangible losses.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                Data Privacy and Security
              </h2>
              <p className="text-foreground/80 leading-relaxed">
                Your privacy is important to us. Our collection and use of
                personal information is governed by our Privacy Policy. By using
                Usoro, you consent to our data practices as described in the
                Privacy Policy.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                Termination
              </h2>
              <p className="text-foreground/80 leading-relaxed">
                We reserve the right to suspend or terminate your account if you
                violate these Terms or engage in conduct that we deem harmful to
                other users or the platform. You may terminate your account at
                any time by contacting us or using the account deletion feature.
              </p>
              <p className="text-foreground/80 leading-relaxed mt-4">
                Upon termination:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground/80">
                <li>Your access to the platform will cease immediately</li>
                <li>
                  We will delete your personal data in accordance with our
                  Privacy Policy
                </li>
                <li>You remain responsible for any outstanding fees</li>
                <li>
                  Provisions that should survive termination (e.g., intellectual
                  property rights) will continue to apply
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                Changes to Terms
              </h2>
              <p className="text-foreground/80 leading-relaxed">
                We may modify these Terms at any time. We will notify you of
                material changes by email or through the platform. Your
                continued use of Usoro after changes take effect constitutes
                acceptance of the modified Terms.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                Governing Law and Dispute Resolution
              </h2>
              <p className="text-foreground/80 leading-relaxed">
                These Terms are governed by and construed in accordance with
                applicable laws. Any disputes arising from these Terms or your
                use of the platform shall be resolved through binding
                arbitration, except where prohibited by law.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                Severability
              </h2>
              <p className="text-foreground/80 leading-relaxed">
                If any provision of these Terms is found to be unenforceable or
                invalid, that provision will be limited or eliminated to the
                minimum extent necessary, and the remaining provisions will
                remain in full force and effect.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                Contact Information
              </h2>
              <p className="text-foreground/80 leading-relaxed">
                If you have questions about these Terms and Conditions, please
                contact us:
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-foreground font-medium">Usoro Support</p>
                <p className="text-foreground/80">Email: legal@usoro.app</p>
                <p className="text-foreground/80">Website: usoro.app</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                Acknowledgment
              </h2>
              <p className="text-foreground/80 leading-relaxed">
                By using Usoro, you acknowledge that you have read, understood,
                and agree to be bound by these Terms and Conditions.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
