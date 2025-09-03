"use client";
import React from "react";
import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import { Bell, ChevronDown, Settings } from "lucide-react";

import Logo from "@/components/logo";
import { MobileNavigation, Navigation } from "./navigation";

const HeaderComponent = () => {
  const navLinks = [
    {
      name: "Dashboard",
      link: "/dashboard",
    },
    {
      name: "Study",
      link: "/dashboard/study",
    },
    {
      name: "Flashcards",
      link: "/dashboard/flashcards",
    },
    {
      name: "Analytics",
      link: "/dashboard/analytics",
    },
  ];
  return (
    <>
      <header className="w-full p-4 fixed inset-0 h-20 z-10 bg-transparent">
        <div className="flex justify-between max-w-7xl mx-auto  w-full items-center gap-4">
          <Logo />
          <Navigation />
          <div className="flex gap-2 bg-white rounded-3xl p-0.5">
            <Button className="rounded-full bg-[#ddd] w-12 h-12">
              <Settings className="h-6 w-6 text-black" />
            </Button>
            <Link href={"/dashboard/settings"}>
              <Button className="rounded-full bg-[#ddd] w-12 h-12">
                <Bell className="h-6 w-6 text-black" />
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="rounded-full bg-[#ddd] w-12 h-12">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48" align="start">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    Profile
                    <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Billing
                    <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />

                <DropdownMenuSeparator />
                <DropdownMenuItem>Support</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
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
