"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LoadingSkeletonProps {
  title?: string;
  subtitle?: string;
  onClose?: () => void;
  showCloseButton?: boolean;
}

export function LoadingSkeleton({
  title = "Working",
  subtitle = "Running Diagnostics...",
  onClose,
  showCloseButton = true,
}: LoadingSkeletonProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md relative">
        {/* Close button */}
        {showCloseButton && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 h-6 w-6"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        )}

        {/* macOS-style window controls */}
        <div className="flex gap-2 mb-6">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>

        {/* Grid with chart visualization */}
        <div className="mb-8">
          <div className="grid grid-cols-8 gap-1 h-32 relative">
            {/* Grid cells */}
            {Array.from({ length: 48 }).map((_, i) => (
              <div key={i} className="border border-border/30 rounded-sm" />
            ))}

            {/* Animated line chart overlay */}
            <div className="absolute inset-0 flex items-end justify-center">
              <svg
                className="w-full h-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <polyline
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-primary animate-pulse"
                  points="10,80 25,60 40,70 55,40 70,50 85,30"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Loading text */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>

        {/* Animated dots */}
        <div className="flex justify-center mt-4 gap-1">
          <div className="w-1 h-1 bg-primary rounded-full animate-pulse"></div>
          <div
            className="w-1 h-1 bg-primary rounded-full animate-pulse"
            style={{ animationDelay: "0.2s" }}
          ></div>
          <div
            className="w-1 h-1 bg-primary rounded-full animate-pulse"
            style={{ animationDelay: "0.4s" }}
          ></div>
        </div>
      </div>
    </div>
  );
}
