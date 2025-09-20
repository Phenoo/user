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
import { Menu } from "lucide-react";
import Link from "next/link";
import { LuLoaderCircle } from "react-icons/lu";

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
          <SheetTitle className="text-left">Menu</SheetTitle>
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
          <div className="pt-4 mt-4 border-t border-border">
            {isLoading ? (
              <>
                <div>
                  <LuLoaderCircle className="h-5 w-5 animate-spin" />
                </div>
              </>
            ) : isAuthenticated ? (
              <Link href="/dashboard" className="hidden lg:block">
                <Button variant="default">Go to Dashboard</Button>
              </Link>
            ) : (
              <Link href="/auth" className="hidden lg:block">
                <Button variant="default">Get Started</Button>
              </Link>
            )}
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
