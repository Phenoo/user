"use client";
import React, { useEffect, useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Bell, Moon, Sun } from "lucide-react";

import Logo from "@/components/logo";
import { MobileNavigation, Navigation } from "./navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { ModeToggle } from "@/components/mode-toggle";
import useNotificationModal from "@/hooks/use-notification";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useTheme } from "next-themes";

const HeaderComponent = () => {
  const { signOut } = useAuthActions();
  const user = useQuery(api.users.currentUser);
  const notificationCounts = useQuery(
    api.notifications.getCounts,
    user?._id ? {} : "skip"
  );
  const router = useRouter();
  const { onOpen } = useNotificationModal();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkMode = mounted ? (resolvedTheme || theme) === "dark" : false;

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  useEffect(() => {
    if (user?.endsOn && new Date(user?.endsOn) > new Date()) {
      setSubscribed(true);
    } else {
      setSubscribed(false);
    }
  }, [user]);

  if (!user || user === undefined) {
    return null;
  }

  return (
    <>
      <header className="w-full p-4 fixed inset-0 h-20 z-10 bg-transparent">
        <div className="flex justify-between max-w-7xl mx-auto w-full items-center gap-4">
          <Logo />
          <Navigation />
          <div className="flex gap-2 bg-glass items-center rounded-3xl p-1 shadow-sm border border-border/40 backdrop-blur-md">
            {!subscribed && (
              <Button
                variant="default"
                size="sm"
                className="rounded-full px-3.5 py-1.5 text-xs font-semibold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-xs"
                onClick={() => router.push("/dashboard/pricing")}
              >
                Upgrade
              </Button>
            )}

            <ModeToggle />

            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-full w-10 h-10 hover:bg-muted/80"
              onClick={onOpen}
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5 text-foreground" />
              {!!notificationCounts?.unread && (
                <span className="absolute right-1 top-1 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-none text-destructive-foreground">
                  {notificationCounts.unread > 99 ? "99+" : notificationCounts.unread}
                </span>
              )}
            </Button>

            <DropdownMenu dir="ltr">
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full w-10 h-10 p-0 hover:ring-2 hover:ring-primary/40 transition-all">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user?.image} />
                    <AvatarFallback className="uppercase text-xs font-bold bg-primary/15 text-primary">
                      {user?.name?.[0] ?? "U"}
                      {user?.name?.[1] ?? ""}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="font-semibold text-xs">
                  <p className="font-bold text-foreground line-clamp-1">{user?.name || "Student"}</p>
                  <p className="text-muted-foreground font-normal text-[11px] truncate">{user?.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => router.push("/dashboard/settings")}
                  >
                    Profile
                    <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => router.push("/dashboard/settings")}
                  >
                    Settings
                    <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() =>
                      router.push("/dashboard/settings?section=billing")
                    }
                  >
                    Billing
                    <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => router.push("/dashboard/usage")}
                  >
                    Usage & AI Tokens
                    <DropdownMenuShortcut>⌘U</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                {/* Dark Mode Switch in Dropdown */}
                <DropdownMenuItem
                  className="flex items-center justify-between cursor-pointer"
                  onSelect={(e) => {
                    e.preventDefault();
                    setTheme(isDarkMode ? "light" : "dark");
                  }}
                >
                  <span className="flex items-center gap-2 text-sm">
                    {isDarkMode ? (
                      <Moon className="h-4 w-4 text-purple-400" />
                    ) : (
                      <Sun className="h-4 w-4 text-amber-500" />
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

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => router.push("/dashboard/settings")}
                >
                  Support & Feedback
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                  onClick={() => setShowLogoutDialog(true)}
                >
                  Log out
                  <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <MobileNavigation />

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to log out?
            </AlertDialogTitle>
            <AlertDialogDescription>
              You will need to sign in again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSignOut}>
              Log out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default HeaderComponent;
