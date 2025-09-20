"use client";
import { NAV_LINKS } from "@/constants";
import Link from "next/link";
import Wrapper from "../global/wrapper";
import { Button } from "../ui/button";
import MobileMenu from "./mobile-menu";
import Logo from "../logo";
import { useConvexAuth } from "convex/react";
import { LuLoaderCircle } from "react-icons/lu";

const Navbar = () => {
  const { isAuthenticated, isLoading } = useConvexAuth();
  return (
    <header className="sticky top-0 w-full h-16 bg-background/80 backdrop-blur-sm z-50">
      <Wrapper className="h-full">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center">
            <Logo />
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <ul className="flex items-center gap-8">
              {NAV_LINKS.map((link, index) => (
                <li key={index} className="text-sm font-medium -1 link">
                  <Link href={link.href}>{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-4">
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
            <MobileMenu />
          </div>
        </div>
      </Wrapper>
    </header>
  );
};

export default Navbar;
