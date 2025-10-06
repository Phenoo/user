"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { SettingsSidebar } from "./app-sidebar";
import { SettingsLayout } from "./settings-container";
import { useSearchParams } from "next/navigation";

export default function SettingsPageContainer() {
  const searchParams = useSearchParams();
  const section = searchParams.get("section") || "profile";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen relative ">
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="absolute top-0 left-4  lg:hidden p-2 rounded-lg bg-background/90 text-foreground hover:bg-background/80 transition-colors"
        aria-label="Toggle menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <SettingsSidebar
        currentSection={section}
        isMobileOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <>
        <SettingsLayout />
      </>
    </div>
  );
}
