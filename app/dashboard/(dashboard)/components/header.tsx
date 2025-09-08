"use client";
import React from "react";
import Link from "next/link";

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

import { Bell, ChevronDown, Settings } from "lucide-react";

import Logo from "@/components/logo";
import { MobileNavigation, Navigation } from "./navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { ModeToggle } from "@/components/mode-toggle";
import useNotificationModal from "@/hooks/use-notification";

const HeaderComponent = () => {
  const { signOut } = useAuthActions();
  const router = useRouter();
  const { onOpen } = useNotificationModal();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };
  return (
    <>
      <header className="w-full p-4 fixed inset-0 h-20 z-10 bg-transparent">
        <div className="flex justify-between max-w-7xl mx-auto  w-full items-center gap-4">
          <Logo />
          <Navigation />
          <div className="flex gap-2 bg-glass  rounded-3xl p-0.5">
            <ModeToggle />
            <Button
              className="rounded-full bg-transparent w-12 h-12"
              onClick={onOpen}
            >
              <Bell className="h-6 w-6 text-black dark:text-white" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="rounded-full bg-transparent w-12 h-12">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
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
                <DropdownMenuItem onClick={handleSignOut}>
                  Log out
                  <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <MobileNavigation />
    </>
  );
};

export default HeaderComponent;
