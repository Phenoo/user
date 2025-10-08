import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Usoro",
  description:
    "Privacy Policy for Usoro - AI-powered study automation platform",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              Privacy Policy
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
                Introduction
              </h2>
              <p className="text-foreground/80 leading-relaxed">
                Welcome to Usoro ("us", "we", or "our"). We are committed to
                protecting your privacy and ensuring the security of your
                personal information. This Privacy Policy explains how we
                collect, use, disclose, and safeguard your information when you
                use our AI-powered study automation platform (the "Service").
              </p>
            </section>

            {/* --- Start of Google API Disclosure --- */}
            <section className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <h2 className="text-2xl font-semibold text-foreground">
                Use of Google Calendar API Data
              </h2>
              <p className="text-foreground/80 leading-relaxed">
                To provide its core functionality, Usoro uses the Google
                Calendar API to schedule Google Meet study sessions on your
                behalf. Our use of information received from Google APIs will
                adhere to the{" "}
                <a
                  href="https://developers.google.com/terms/api-services-user-data-policy#limited-use-requirements"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  Google API Services User Data Policy
                </a>
                , including the Limited Use requirements.
              </p>
              <h3 className="text-xl font-medium text-foreground mt-4">
                What We Access
              </h3>
              <p className="text-foreground/80 leading-relaxed">
                We request permission to access your Google Calendar to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground/80">
                <li>
                  <strong>View your calendar's free/busy information:</strong>{" "}
                  This allows our AI to find available time slots for your study
                  sessions without needing to see the details of your private
                  events.
                </li>
                <li>
                  <strong>Create new events:</strong> This allows us to schedule
                  the Google Meet study sessions directly onto your calendar.
                </li>
              </ul>
              <h3 className="text-xl font-medium text-foreground mt-4">
                How We Use It
              </h3>
              <p className="text-foreground/80 leading-relaxed">
                The access is used exclusively to find open time slots and
                schedule the study sessions you request through our platform. We
                use this data to provide a direct benefit to you by automating
                your study schedule.
              </p>
              <p className="text-foreground/80 font-semibold leading-relaxed mt-4">
                We do not read, process, or store the details (like titles,
                descriptions, or attendees) of your personal, unrelated calendar
                events. Your calendar data is never used for advertising
                purposes.
              </p>
            </section>
            {/* --- End of Google API Disclosure --- */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                AI-Powered Features
              </h2>
              <p className="text-foreground/80 leading-relaxed">
                Our platform uses artificial intelligence to analyze your study
                patterns and provide personalized recommendations. This
                includes:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground/80">
                <li>Analyzing study session effectiveness and engagement</li>
                <li>
                  Generating personalized study schedules and recommendations
                </li>
                <li>
                  Identifying optimal study times based on your performance data
                </li>
                <li>Providing insights to maximize your studying efficiency</li>
              </ul>
              <p className="text-foreground/80 leading-relaxed mt-4">
                All AI processing is designed to enhance your learning
                experience while maintaining the privacy and security of your
                data.
              </p>
            </section>
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                Information We Collect and Store
              </h2>
              <p className="text-foreground/80 leading-relaxed">
                We limit our data collection to what is necessary to provide and
                improve our Service.
              </p>
              <h3 className="text-xl font-medium text-foreground">
                Information You Provide to Us
              </h3>
              <p className="text-foreground/80 leading-relaxed">
                We collect and store information that you provide directly to
                us, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground/80">
                <li>
                  <strong>Account Information:</strong> Your name and email
                  address provided during sign-up.
                </li>
                <li>
                  <strong>Academic Information:</strong> Courses, study
                  schedules, and academic goals you enter into the platform.
                </li>
                <li>
                  <strong>Usoro-Generated Data:</strong> Study session notes and
                  progress data generated within our Service.
                </li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mt-6">
                Usage Data
              </h3>
              <p className="text-foreground/80 leading-relaxed">
                We automatically collect information about your interaction with
                our platform to improve our service, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground/80">
                <li>Feature usage and engagement metrics within Usoro.</li>
                <li>Device information, browser type, and IP address.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                How We Use Your Information
              </h2>
              <p className="text-foreground/80 leading-relaxed">
                We use the information we store to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground/80">
                <li>Provide, operate, and maintain our Service.</li>
                <li>Provide AI-powered study recommendations and insights.</li>
                <li>
                  Track your academic progress and help you achieve your goals.
                </li>
                <li>
                  Send notifications about upcoming study sessions and
                  reminders.
                </li>
                <li>Improve our platform and develop new features.</li>
                <li>Provide customer support and respond to your inquiries.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                Data Sharing and Disclosure
              </h2>
              <p className="text-foreground/80 leading-relaxed">
                We do not sell your personal information. We may share your
                information only in the following limited circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground/80">
                <li>
                  <strong>With your consent:</strong> When you explicitly
                  authorize us to share specific information.
                </li>
                <li>
                  <strong>Service Providers:</strong> With third-party vendors
                  who help us operate our platform (e.g., hosting services like
                  Vercel or AWS). These providers are contractually obligated to
                  protect your data. Our connection to Google is for API access
                  only, as described above.
                </li>
                <li>
                  <strong>Legal Requirements:</strong> If required by law or to
                  protect our rights, property, or safety.
                </li>
                <li>
                  <strong>Study Partners:</strong> We share Google Meet links
                  and session details with participants you invite to your study
                  sessions.
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                Data Security
              </h2>
              <p className="text-foreground/80 leading-relaxed">
                We implement industry-standard security measures to protect your
                information, including encryption of data in transit (TLS/SSL)
                and at rest. Access to personal data is strictly limited to
                authorized personnel.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                Your Rights and Choices
              </h2>
              <p className="text-foreground/80 leading-relaxed">
                You have control over your personal information:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground/80">
                <li>Access, review, and correct your account information.</li>
                <li>Delete your account and associated Usoro data.</li>
                <li>
                  <strong>Revoke Google API access</strong> at any time through
                  your{" "}
                  <a
                    href="https://myaccount.google.com/permissions"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    Google account security settings
                  </a>
                  . Revoking access will prevent us from scheduling future study
                  sessions.
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                Data Retention
              </h2>
              <p className="text-foreground/80 leading-relaxed">
                We retain the information you provide to us (such as your
                account and academic goals) for as long as your account is
                active. When you delete your account, we will delete this
                information from our production systems within 30 days, except
                where retention is required for legal or security purposes. We
                do not retain your Google Calendar data.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                Children's Privacy
              </h2>
              <p className="text-foreground/80 leading-relaxed">
                Our Service is not intended for children under the age of 13. We
                do not knowingly collect personal information from children
                under 13. If you believe we have, please contact us immediately.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                Changes to This Policy
              </h2>
              <p className="text-foreground/80 leading-relaxed">
                We may update this Privacy Policy from time to time. We will
                notify you of any material changes by posting the new policy on
                this page and updating the "Last updated" date.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                Contact Us
              </h2>
              <p className="text-foreground/80 leading-relaxed">
                If you have questions about this Privacy Policy, please contact
                us:
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-foreground font-medium">Usoro Support</p>
                <p className="text-foreground/80">Email: privacy@usoro.app</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
