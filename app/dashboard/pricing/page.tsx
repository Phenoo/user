import Logo from "@/components/logo";
import Pricing from "@/components/pricing";
import { api } from "@/lib/polar";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
};

export default async function PricingPage() {
  return (
    <div className="min-h-screen max-w-7xl mx-auto px-6 w-full py-8 ">
      {/* Header */}
      <header className="">
        <Logo />
      </header>
      <br />
      <div className="w-full y-16">
        <Pricing />
        <div className="bg-card rounded-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">
            Feature Comparison
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4">Features</th>
                  <th className="text-center py-4 px-4">Free</th>
                  <th className="text-center py-4 px-4">Student</th>
                  <th className="text-center py-4 px-4">Pro</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  {
                    feature: "Flashcard Decks",
                    free: "5",
                    student: "Unlimited",
                    pro: "Unlimited",
                  },
                  {
                    feature: "Study Groups",
                    free: "2",
                    student: "Unlimited",
                    pro: "Unlimited",
                  },
                  {
                    feature: "Analytics Dashboard",
                    free: "Basic",
                    student: "Advanced",
                    pro: "Advanced",
                  },
                  {
                    feature: "AI Study Recommendations",
                    free: "✗",
                    student: "✓",
                    pro: "✓",
                  },
                  {
                    feature: "Team Collaboration",
                    free: "✗",
                    student: "✗",
                    pro: "✓",
                  },
                  { feature: "API Access", free: "✗", student: "✗", pro: "✓" },
                  {
                    feature: "Priority Support",
                    free: "✗",
                    student: "✓",
                    pro: "✓",
                  },
                ].map((row, index) => (
                  <tr key={index} className="border-b border-border">
                    <td className="py-4 px-4 font-medium">{row.feature}</td>
                    <td className="py-4 px-4 text-center">{row.free}</td>
                    <td className="py-4 px-4 text-center">{row.student}</td>
                    <td className="py-4 px-4 text-center">{row.pro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <br />
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                question: "Can I change my plan anytime?",
                answer:
                  "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.",
              },
              {
                question: "Is there a free trial?",
                answer:
                  "Our Free plan gives you access to core features. You can upgrade to paid plans anytime.",
              },
              {
                question: "What payment methods do you accept?",
                answer:
                  "We accept all major credit cards, PayPal, and bank transfers for annual plans.",
              },
              {
                question: "Do you offer student discounts?",
                answer:
                  "Our Student plan is already designed with students in mind at an affordable price point.",
              },
            ].map((faq, index) => (
              <div key={index} className="text-left">
                <h3 className="font-semibold mb-2">{faq.question}</h3>
                <p className="text-muted-foreground text-sm">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
