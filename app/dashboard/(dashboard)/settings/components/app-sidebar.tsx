"use client";

import Link from "next/link";
import {
  User,
  BookOpen,
  Timer,
  Bell,
  Target,
  CreditCard,
  Shield,
  Settings,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SettingsSidebarProps {
  currentSection: string;
  isMobileOpen?: boolean;
  onClose?: () => void;
}

const settingsItems = [
  {
    id: "profile",
    label: "Profile Settings",
    icon: User,
    href: "/dashboard/settings?section=profile",
  },
  {
    id: "study-preferences",
    label: "Study Preferences",
    icon: BookOpen,
    href: "/dashboard/settings?section=study-preferences",
  },
  {
    id: "timer",
    label: "Timer Settings",
    icon: Timer,
    href: "/dashboard/settings?section=timer",
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    href: "/dashboard/settings?section=notifications",
  },
  {
    id: "goals",
    label: "Study Goals",
    icon: Target,
    href: "/dashboard/settings?section=goals",
  },
  {
    id: "billing",
    label: "Billing & Plans",
    icon: CreditCard,
    href: "/dashboard/settings?section=billing",
  },
  {
    id: "security",
    label: "Account Security",
    icon: Shield,
    href: "/dashboard/settings?section=security",
  },
  {
    id: "privacy",
    label: "Privacy & Data",
    icon: Settings,
    href: "/dashboard/settings?section=privacy",
  },
];

export function SettingsSidebar({
  currentSection,
  isMobileOpen,
  onClose,
}: SettingsSidebarProps) {
  return (
    <aside
      className={cn(
        "w-[280px] border-r p-6 flex flex-col bg-background",
        "fixed lg:static inset-y-0 left-0 z-40 transition-transform duration-300",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      <nav className="space-y-1">
        <div className="flex justify-between">
          <div></div>
          <Button variant={"outline"} size={"icon"} onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        {settingsItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentSection === item.id;
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
              )}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
        <div className="pt-4 mt-4 border-t border-zinc-800">
          <Link
            href="/dashboard/settings?section=delete"
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              currentSection === "delete"
                ? "bg-zinc-900 text-red-500"
                : "text-red-500 hover:bg-zinc-900/50"
            )}
          >
            <Trash2 className="w-4 h-4" />
            Delete Account
          </Link>
        </div>
      </nav>
    </aside>
  );
}
