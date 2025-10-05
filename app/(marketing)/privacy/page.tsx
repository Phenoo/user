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
                Welcome to Usoro. We are committed to protecting your privacy
                and ensuring the security of your personal information. This
                Privacy Policy explains how we collect, use, disclose, and
                safeguard your information when you use our AI-powered study
                automation platform.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                Information We Collect
              </h2>

              <h3 className="text-xl font-medium text-foreground">
                Personal Information
              </h3>
              <p className="text-foreground/80 leading-relaxed">
                We collect information that you provide directly to us,
                including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground/80">
                <li>Name and email address</li>
                <li>
                  Academic information (courses, study schedules, academic
                  goals)
                </li>
                <li>Calendar data and availability preferences</li>
                <li>Study session notes and progress tracking data</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mt-6">
                Calendar API Data
              </h3>
              <p className="text-foreground/80 leading-relaxed">
                To provide our core functionality of scheduling Google Meet
                study sessions, we access your Google Calendar through the
                Calendar API. We collect:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground/80">
                <li>Calendar availability and free/busy information</li>
                <li>Event details for scheduled study sessions</li>
                <li>Meeting links and participant information</li>
              </ul>
              <p className="text-foreground/80 leading-relaxed mt-4">
                We only access calendar data necessary to create and manage your
                study sessions. We do not read or store unrelated calendar
                events.
              </p>

              <h3 className="text-xl font-medium text-foreground mt-6">
                Usage Data
              </h3>
              <p className="text-foreground/80 leading-relaxed">
                We automatically collect information about your interaction with
                our platform, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground/80">
                <li>Study session attendance and duration</li>
                <li>Feature usage and engagement metrics</li>
                <li>Device information and browser type</li>
                <li>IP address and general location data</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                How We Use Your Information
              </h2>
              <p className="text-foreground/80 leading-relaxed">
                We use the collected information to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground/80">
                <li>
                  Create and manage Google Meet study sessions through the
                  Calendar API
                </li>
                <li>Provide AI-powered study recommendations and insights</li>
                <li>
                  Track your academic progress and help you achieve your goals
                </li>
                <li>
                  Optimize study schedules based on your availability and
                  preferences
                </li>
                <li>
                  Send notifications about upcoming study sessions and reminders
                </li>
                <li>Improve our platform and develop new features</li>
                <li>Provide customer support and respond to your inquiries</li>
              </ul>
            </section>

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
                Data Sharing and Disclosure
              </h2>
              <p className="text-foreground/80 leading-relaxed">
                We do not sell your personal information. We may share your
                information only in the following circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground/80">
                <li>
                  <strong>With your consent:</strong> When you explicitly
                  authorize us to share specific information
                </li>
                <li>
                  <strong>Service providers:</strong> With third-party vendors
                  who help us operate our platform (e.g., Google Calendar API,
                  hosting services)
                </li>
                <li>
                  <strong>Legal requirements:</strong> When required by law or
                  to protect our rights and safety
                </li>
                <li>
                  <strong>Study partners:</strong> Meeting links and session
                  details with participants you invite to study sessions
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                Data Security
              </h2>
              <p className="text-foreground/80 leading-relaxed">
                We implement industry-standard security measures to protect your
                information, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground/80">
                <li>Encryption of data in transit and at rest</li>
                <li>
                  Secure authentication through OAuth 2.0 for Calendar API
                  access
                </li>
                <li>Regular security audits and updates</li>
                <li>
                  Limited access to personal data by authorized personnel only
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                Your Rights and Choices
              </h2>
              <p className="text-foreground/80 leading-relaxed">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground/80">
                <li>Access and review your personal information</li>
                <li>Request correction of inaccurate data</li>
                <li>Delete your account and associated data</li>
                <li>
                  Revoke Calendar API access at any time through your Google
                  account settings
                </li>
                <li>Opt out of non-essential communications</li>
                <li>Export your study data</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                Data Retention
              </h2>
              <p className="text-foreground/80 leading-relaxed">
                We retain your information for as long as your account is active
                or as needed to provide our services. When you delete your
                account, we will delete or anonymize your personal information
                within 30 days, except where we are required to retain it for
                legal purposes.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                Children's Privacy
              </h2>
              <p className="text-foreground/80 leading-relaxed">
                Our service is intended for students aged 13 and older. We do
                not knowingly collect information from children under 13. If you
                believe we have collected information from a child under 13,
                please contact us immediately.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                Changes to This Policy
              </h2>
              <p className="text-foreground/80 leading-relaxed">
                We may update this Privacy Policy from time to time. We will
                notify you of any material changes by posting the new policy on
                this page and updating the "Last updated" date. Your continued
                use of our platform after changes constitutes acceptance of the
                updated policy.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                Contact Us
              </h2>
              <p className="text-foreground/80 leading-relaxed">
                If you have questions or concerns about this Privacy Policy or
                our data practices, please contact us at:
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
