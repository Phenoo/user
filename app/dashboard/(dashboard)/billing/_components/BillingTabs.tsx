// appsettings?section=billing&tab=_components/billing-tabs.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    name: "Overview",
    href: "/dashboard/settings?section=billing&tab=overview",
  },
  {
    name: "Payment methods",
    href: "/dashboard/settings?section=billing&tab=payment-methods",
  },
  {
    name: "Billing history",
    href: "/dashboard/settings?section=billing&tab=billing-history",
  },
  {
    name: "Credit grants",
    href: "/dashboard/settings?section=billing&tab=credit-grants",
  },
  {
    name: "Preferences",
    href: "/dashboard/settings?section=billing&tab=billingpreferences",
  },
];

export function BillingTabs() {
  const pathname = usePathname();

  return (
    <div className="border-b border-gray-700">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.name}
              href={`${tab.href}`}
              className={`
                ${
                  isActive
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500"
                }
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              `}
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
