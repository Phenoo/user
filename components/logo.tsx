import { useConvexAuth } from "convex/react";
import Link from "next/link";
import React from "react";

const Logo = () => {
  const { isAuthenticated } = useConvexAuth();

  return (
    <Link href={!isAuthenticated ? "/" : "/dashboard"}>
      <div className="backdrop-blur-md bg-glass  w-fit rounded-3xl p-1">
        <h4 className="text-2xl font-black text-foreground">
          Usor<span className="text-primary">o</span>
        </h4>
      </div>
    </Link>
  );
};

export default Logo;
