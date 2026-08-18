"use client";
import { useConvexAuth } from "convex/react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const Logo = () => {
  const { isAuthenticated } = useConvexAuth();

  const { resolvedTheme } = useTheme();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Avoid mismatched HTML on hydration
    return null;
  }

  const isDarkMode = resolvedTheme === "dark";
  return (
    <Link href={!isAuthenticated ? "/" : "/dashboard"} className="inline-flex items-center">
      <div className="backdrop-blur-md bg-transparent h-16 flex justify-center items-center overflow-hidden w-fit rounded-3xl p-1">
        <Image
          src={isDarkMode ? "/mainlogo.svg" : "/mainlogo-dark.svg"}
          alt="StudentApp Logo"
          width={112}
          height={64}
          priority
          className="object-contain h-16 w-28"
        />
      </div>
    </Link>
  );
};

export default Logo;
