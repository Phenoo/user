"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface NoSubscriptionProps {
  onBrowsePlans: () => void;
}

export function NoSubscription({ onBrowsePlans }: NoSubscriptionProps) {
  return (
    <Card className="border-2 border-dashed">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">No Active Subscription</CardTitle>
        <CardDescription className="text-base">
          Choose a plan to get started with premium features
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center pb-8">
        <Button onClick={onBrowsePlans} size="lg" className="px-8">
          Browse Plans
        </Button>
      </CardContent>
    </Card>
  );
}
