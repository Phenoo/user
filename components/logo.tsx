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
    <Link href={!isAuthenticated ? "/" : "/dashboard"}>
      <div className="backdrop-blur-md  bg-transparent h-16 flex justify-center items-center overflow-hidden w-fit rounded-3xl p-1">
        {isDarkMode ? (
          <img
            src={"/mainlogo.svg"}
            alt="logo"
            className="object-cover h-16 w-28"
          />
        ) : (
          <img
            src={"/mainlogo-dark.svg"}
            alt="logo"
            className="object-cover h-16 w-28"
          />
        )}
      </div>
    </Link>
  );
};

export default Logo;
