"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { PiBrainLight } from "react-icons/pi";
import { IoCalendarOutline } from "react-icons/io5";
import { MdMenuBook } from "react-icons/md";

const navLinks = [
  {
    name: "Dashboard",
    link: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Courses",
    link: "/dashboard/courses",
    icon: MdMenuBook,
  },
  {
    name: "Study",
    link: "/dashboard/schedule",
    icon: IoCalendarOutline,
  },
  {
    name: "Flashcards",
    link: "/dashboard/flashcards",
    icon: PiBrainLight,
  },
  {
    name: "Analytics",
    link: "/dashboard/analytics",
    icon: BarChart3,
  },
];

export function Navigation() {
  const pathname = usePathname();
  return (
    <nav className="hidden md:flex gap-1 w-[380px] backdrop-blur-md bg-glass p-1 justify-between rounded-3xl relative">
      {navLinks.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.link;

        return (
          <Link
            key={item.name}
            href={item.link}
            className={cn(
              "relative flex items-center gap-1 px-4 py-2 rounded-3xl text-sm font-medium transition-colors duration-200 ease-in-out",
              isActive
                ? "text-foreground bg-gray-200 dark:bg-gray-700"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="active-pill"
                className="absolute inset-0 w-full h-full rounded-3xl bg-gray-200 dark:bg-gray-700" // Example
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                }}
              />
            )}
            <Icon
              className={cn(
                "h-6 w-6 relative z-10 p-1 transition-transform duration-200",
                isActive && "scale-110"
              )}
            />
            {isActive && <span className="relative z-10">{item.name}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileNavigation() {
  const pathname = usePathname();
  return (
    <div className="fixed bottom-4 z-10  w-full">
      <nav className="md:hidden    flex gap-1 w-[330px] mx-auto bg-glass p-1 justify-between rounded-3xl relative">
        {navLinks.map((item) => {
          const Icon = item.icon;

          const isActive = pathname === item.link;
          return (
            <Link
              key={item.name}
              href={item.link}
              className={cn(
                "relative flex items-center gap-1 px-4 py-2 rounded-3xl text-sm font-medium transition-colors duration-200 ease-in-out",
                isActive
                  ? "text-foreground font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 w-full h-full rounded-3xl bg-gray-200 dark:bg-gray-700" // Example
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                  }}
                />
              )}
              <Icon
                className={cn(
                  "h-6 w-6 relative z-10 p-1 transition-transform duration-200",
                  isActive && "scale-110"
                )}
              />
              {isActive && (
                <span className="relative z-10 text-xs">{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
