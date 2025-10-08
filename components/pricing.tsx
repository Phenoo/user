"use client";

import NumberFlow from "@number-flow/react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { PLAN, PLANS } from "@/constants/plans";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { usePathname, useRouter } from "next/navigation";

type Plan = "monthly" | "annually";

const Pricing = () => {
  const [billPlan, setBillPlan] = useState<Plan>("monthly");

  const pathname = usePathname();
  const handleSwitch = () => {
    setBillPlan((prev) => (prev === "monthly" ? "annually" : "monthly"));
  };

  return (
    <section id="pricing">
      <div className="relative flex flex-col items-center justify-center w-full  mx-auto mb-8">
        <div
          className={cn(
            "flex flex-col items-center justify-center mx-auto w-full",
            pathname === "/" ? "max-w-6xl" : "max-w-5xl"
          )}
        >
          <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-4xl  font-heading font-medium !leading-snug mt-6">
              Find the right plan to boost <br className="hidden lg:block" />{" "}
              <span className="font-subheading italic">your productivity</span>
            </h2>
            <p className="text-base md:text-lg text-center text-foreground/80 mt-6">
              Stay on top of classes, exams, and projects with tools designed
              for students. Organize tasks, plan your study schedule, and get
              AI-powered support to make learning easier.
            </p>
          </div>

          <div className="flex items-center justify-center space-x-4 mt-6">
            <span className="text-base font-medium">Monthly</span>
            <button
              onClick={handleSwitch}
              className="relative rounded-full focus:outline-none"
            >
              <div className="w-12 h-6 transition rounded-full shadow-md outline-none bg-primary"></div>
              <div
                className={cn(
                  "absolute inline-flex items-center justify-center w-4 h-4 transition-all duration-500 ease-in-out top-1 left-1 rounded-full bg-white",
                  billPlan === "annually" ? "translate-x-6" : "translate-x-0"
                )}
              />
            </button>
            <span className="text-base font-medium">Annually</span>
          </div>
        </div>

        <div className="grid w-full grid-cols-1 lg:grid-cols-3 md:grid-cols-2 pt-8 lg:pt-12 gap-4 lg:gap-6 max-w-5xl mx-auto">
          {PLANS.map((plan, idx) => (
            <Plan key={plan.id} plan={plan} billPlan={billPlan} />
          ))}
        </div>
      </div>
    </section>
  );
};

const Plan = ({ plan, billPlan }: { plan: PLAN; billPlan: Plan }) => {
  const router = useRouter();
  const upgrade = useAction(api.stripe.pay);

  const handleBuy = async () => {
    const url = await upgrade({
      price: billPlan === "monthly" ? plan.monthlyId : plan.yearlyId,
    });
    if (!url) return;
    router.push(url);
  };

  return (
    <div
      className={cn(
        "flex flex-col relative rounded-2xl lg:rounded-3xl transition-all bg-background/ items-start w-full border border-foreground/10 overflow-hidden",
        plan.title === "Pro" && "border-primary"
      )}
    >
      {plan.title === "Pro" && (
        <div className="absolute top-1/2 inset-x-0 mx-auto h-12 -rotate-45 w-full bg-primary rounded-2xl lg:rounded-3xl blur-[8rem] -z-10"></div>
      )}

      <div className="p-4 md:p-8 flex rounded-t-2xl lg:rounded-t-3xl flex-col items-start w-full relative">
        <h2 className="font-medium text-xl text-foreground pt-5">
          {plan.title}
        </h2>
        <h3 className="mt-3 text-3xl font-medium md:text-5xl">
          {plan.title === "Free" ? (
            "Free"
          ) : (
            <NumberFlow
              value={
                billPlan === "monthly" ? plan.monthlyPrice : plan.annuallyPrice
              }
              suffix={billPlan === "monthly" ? "/mo" : "/yr"}
              format={{
                currency: "USD",
                style: "currency",
                currencySign: "standard",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
                currencyDisplay: "narrowSymbol",
              }}
            />
          )}
        </h3>
        <p className="text-sm md:text-base text-muted-foreground mt-2">
          {plan.desc}
        </p>
      </div>
      <div className="flex flex-col items-start w-full px-4 py-2 md:px-8">
        {plan.title === "Free" ? (
          <Button className="w-full">Continue</Button>
        ) : (
          <Button
            size="lg"
            variant={plan.title === "Starter" ? "blue" : "default"}
            className="w-full"
            onClick={handleBuy}
          >
            {plan.buttonText}
          </Button>
        )}
        {plan.title !== "Free" && (
          <div className="h-8 overflow-hidden w-full mx-auto">
            <AnimatePresence mode="wait">
              <motion.span
                key={billPlan}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="text-sm text-center text-muted-foreground mt-3 mx-auto block"
              >
                {billPlan === "monthly"
                  ? "Billed monthly"
                  : "Billed in one annual payment"}
              </motion.span>
            </AnimatePresence>
          </div>
        )}
      </div>
      <div className="flex flex-col items-start w-full p-5 mb-4 ml-1 gap-y-2">
        <span className="text-base text-left mb-2">Includes:</span>
        {plan.features.map((feature, index) => (
          <div key={index} className="flex items-center justify-start gap-2">
            <div className="flex items-center justify-center">
              <CheckIcon className="size-5" />
            </div>
            <span>{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pricing;
