"use client";

import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

interface ModeToggleProps {
  className?: string;
  size?: "default" | "sm" | "icon";
}

export function ModeToggle({ className = "", size = "icon" }: ModeToggleProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size={size}
        className={`rounded-full text-muted-foreground w-10 h-10 ${className}`}
        aria-label="Toggle theme"
      >
        <span className="w-5 h-5 block" />
      </Button>
    );
  }

  const isDarkMode = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size={size}
      className={`rounded-full hover:bg-muted/80 w-10 h-10 text-foreground transition-transform hover:scale-105 active:scale-95 ${className}`}
      onClick={() => setTheme(isDarkMode ? "light" : "dark")}
      title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      aria-label="Toggle theme"
    >
      {isDarkMode ? (
        <Sun className="h-5 w-5 text-amber-400 transition-transform duration-300 rotate-0 scale-100" />
      ) : (
        <Moon className="h-5 w-5 text-slate-700 dark:text-slate-200 transition-transform duration-300 rotate-0 scale-100" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
