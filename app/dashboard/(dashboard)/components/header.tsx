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

import { Bell, ChevronDown, Settings } from "lucide-react";

import Logo from "@/components/logo";
import { MobileNavigation, Navigation } from "./navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { ModeToggle } from "@/components/mode-toggle";
import useNotificationModal from "@/hooks/use-notification";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const HeaderComponent = () => {
  const { signOut } = useAuthActions();
  const user = useQuery(api.users.currentUser);
  const router = useRouter();
  const { onOpen } = useNotificationModal();
  const [subscribed, setSubscribed] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

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
        <div className="flex justify-between max-w-7xl mx-auto  w-full items-center gap-4">
          <Logo />
          <Navigation />
          <div className="flex gap-2 bg-glass items-center  rounded-3xl p-0.5">
            {subscribed ? (
              <ModeToggle />
            ) : (
              <Button
                variant="default"
                className="rounded-3xl p-4 font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                onClick={() => router.push("/dashboard/pricing")}
              >
                Upgrade
              </Button>
            )}
            <Button
              className="rounded-full bg-transparent w-12 h-12"
              onClick={onOpen}
            >
              <Bell className="h-6 w-6 text-black dark:text-white" />
            </Button>
            <DropdownMenu dir="ltr">
              <DropdownMenuTrigger asChild>
                <Button className="rounded-full bg-transparent w-12 h-12">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user?.image} />
                    <AvatarFallback className="uppercase">
                      {user?.name?.[0] ?? ""}
                      {user?.name?.[1] ?? ""}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48" align="start">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => router.push("/dashboard/settings")}
                  >
                    Profile
                    <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push("/dashboard/settings")}
                  >
                    Settings
                    <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      router.push("/dashboard/settings?section=billing")
                    }
                  >
                    Billing
                    <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard/settings")}
                >
                  Support
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowLogoutDialog(true)}>
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
