"use client";

import React, { useEffect, useState } from "react";
import {
  MoonIcon,
  SettingsIcon,
  SunMediumIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { useCalendar } from "@/components/calendar/contexts/calendar-context";
import { useDragDrop } from "@/components/calendar/contexts/dnd-context";

export function Settings() {
  const {
    badgeVariant,
    setBadgeVariant,
    use24HourFormat,
    toggleTimeFormat,
    agendaModeGroupBy,
    setAgendaModeGroupBy,
  } = useCalendar();
  const { showConfirmation, setShowConfirmation } = useDragDrop();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkMode = mounted ? (resolvedTheme || theme) === "dark" : false;
  const isDotVariant = badgeVariant === "dot";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Calendar settings">
          <SettingsIcon className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60" align="end">
        <DropdownMenuLabel>Calendar Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="flex items-center justify-between cursor-pointer"
            onSelect={(e) => {
              e.preventDefault();
              setTheme(isDarkMode ? "light" : "dark");
            }}
          >
            <span className="flex items-center gap-2 text-sm">
              {isDarkMode ? (
                <MoonIcon className="h-4 w-4 text-purple-400" />
              ) : (
                <SunMediumIcon className="h-4 w-4 text-amber-500" />
              )}
              Dark Mode
            </span>
            <Switch
              checked={isDarkMode}
              onCheckedChange={(checked) =>
                setTheme(checked ? "dark" : "light")
              }
              onClick={(e) => e.stopPropagation()}
            />
          </DropdownMenuItem>

          <DropdownMenuItem
            className="flex items-center justify-between cursor-pointer"
            onSelect={(e) => {
              e.preventDefault();
              setShowConfirmation(!showConfirmation);
            }}
          >
            <span className="text-sm">Confirm Event Move</span>
            <Switch
              checked={showConfirmation}
              onCheckedChange={(checked) => setShowConfirmation(checked)}
              onClick={(e) => e.stopPropagation()}
            />
          </DropdownMenuItem>

          <DropdownMenuItem
            className="flex items-center justify-between cursor-pointer"
            onSelect={(e) => {
              e.preventDefault();
              setBadgeVariant(isDotVariant ? "colored" : "dot");
            }}
          >
            <span className="text-sm">Dot Badge Style</span>
            <Switch
              checked={isDotVariant}
              onCheckedChange={(checked) =>
                setBadgeVariant(checked ? "dot" : "colored")
              }
              onClick={(e) => e.stopPropagation()}
            />
          </DropdownMenuItem>

          <DropdownMenuItem
            className="flex items-center justify-between cursor-pointer"
            onSelect={(e) => {
              e.preventDefault();
              toggleTimeFormat();
            }}
          >
            <span className="text-sm">24-Hour Time Format</span>
            <Switch
              checked={use24HourFormat}
              onCheckedChange={toggleTimeFormat}
              onClick={(e) => e.stopPropagation()}
            />
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Agenda View Group By
          </DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={agendaModeGroupBy}
            onValueChange={(value) =>
              setAgendaModeGroupBy(value as "date" | "color")
            }
          >
            <DropdownMenuRadioItem value="date" className="text-xs">
              Group by Date
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="color" className="text-xs">
              Group by Course Color
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
