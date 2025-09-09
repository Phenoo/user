"use client";
import Logo from "@/components/logo";
import Pricing from "@/components/pricing";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";
import Link from "next/link";
import React from "react";

const Pricingpage = () => {
  return (
    <div
      className={cn(
        "w-full mx-auto  max-w-7xl min-h-screen bg-background lg:mx-auto p-4"
      )}
    >
      <div className="flex justify-between items-center">
        <Logo />

        <Link href={"/dashboard"}>
          <Button className="">
            Remind Later <Clock className="h-4 w-4" />
          </Button>
        </Link>
      </div>
      <Pricing />
    </div>
  );
};

export default Pricingpage;
