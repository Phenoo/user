"use client";
import { useConvexAuth } from "convex/react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";

interface LogoProps {
  className?: string;
  imageClassName?: string;
  size?: "sm" | "default" | "md" | "lg" | "xl";
  href?: string;
}

const sizeClasses = {
  sm: "h-8 w-28",
  default: "h-10 w-40",
  md: "h-12 w-48",
  lg: "h-14 w-56",
  xl: "h-16 w-64",
};

const Logo: React.FC<LogoProps> = ({
  className = "",
  imageClassName = "",
  size = "md",
  href,
}) => {
  const { isAuthenticated } = useConvexAuth();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Avoid mismatched HTML on hydration
    return (
      <div className={`inline-flex items-center ${className}`}>
        <div className={`relative ${sizeClasses[size]} ${imageClassName}`} />
      </div>
    );
  }

  const isDarkMode = resolvedTheme === "dark";
  const targetHref = href || (!isAuthenticated ? "/" : "/dashboard");

  return (
    <Link
      href={targetHref}
      className={`inline-flex items-center transition-transform hover:scale-[1.02] active:scale-[0.98] ${className}`}
    >
      <div className="flex justify-center items-center overflow-hidden">
        <Image
          src={isDarkMode ? "/mainlogo.svg" : "/mainlogo-dark.svg"}
          alt="Usoro Logo"
          width={280}
          height={60}
          priority
          className={`object-contain ${sizeClasses[size]} ${imageClassName}`}
        />
      </div>
    </Link>
  );
};

export default Logo;
