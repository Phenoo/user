// appsettings?section=billing&tab=_components/billing-tabs.tsx
"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const tabs = [
  {
    name: "Overview",
    href: "/dashboard/settings?section=billing&tab=overview",
    tab: "overview",
  },
  {
    name: "Payment methods",
    href: "/dashboard/settings?section=billing&tab=payment-methods",
    tab: "payment-methods",
  },
  {
    name: "Billing history",
    href: "/dashboard/settings?section=billing&tab=billing-history",
    tab: "billing-history",
  },
  {
    name: "Subscription history",
    href: "/dashboard/settings?section=billing&tab=subscription-history",
    tab: "subscription-history",
  },
];

export function BillingTabs() {
  const searchParams = useSearchParams().get("tab") || "overview";

  return (
    <div className="border-b border-gray-700">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = searchParams === tab.tab;
          return (
            <Link
              key={tab.name}
              href={`${tab.href}`}
              className={cn(
                `
               
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              `,
                isActive
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {tab.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
