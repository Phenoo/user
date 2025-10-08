"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NAV_LINKS } from "@/constants";
import { useConvexAuth } from "convex/react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { LuLoaderCircle } from "react-icons/lu";
import Logo from "../logo";

const MobileMenu = () => {
  const { isAuthenticated, isLoading } = useConvexAuth();

  return (
    <Sheet>
      <SheetTrigger asChild className="lg:hidden">
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-[300px] pt-12">
        <SheetHeader className="mb-8">
          <div className="flex justify-between items-center gap-4">
            <SheetTitle className="text-left">
              <Logo />
            </SheetTitle>
            <SheetClose>
              <Button size={"icon"} variant={"outline"}>
                <X className="w-4 h-4" />
              </Button>
            </SheetClose>
          </div>
        </SheetHeader>
        <nav className="flex flex-col space-y-4 px-4">
          {NAV_LINKS.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className="text-base font-medium transition-colors hover:text-primary"
            >
              <SheetClose>{link.name}</SheetClose>
            </Link>
          ))}
          <div className="pt-4 mt-4 border-t  border-border">
            {isLoading ? (
              <>
                <div>
                  <LuLoaderCircle className="h-5 w-5 animate-spin" />
                </div>
              </>
            ) : isAuthenticated ? (
              <Link href="/dashboard" className="">
                <SheetClose>
                  <Button variant="default">Go to Dashboard</Button>
                </SheetClose>
              </Link>
            ) : (
              <Link href="/auth" className="">
                <SheetClose>
                  <Button variant="default">Get Started</Button>
                </SheetClose>
              </Link>
            )}
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
