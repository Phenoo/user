"use client";

import { Button } from "@/components/ui/button";
import { XCircle, MinusCircle, CheckCircle } from "lucide-react";

interface ConfidenceRatingProps {
  onRate: (confidence: "hard" | "good" | "easy") => void;
}

export function ConfidenceRating({ onRate }: ConfidenceRatingProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-center text-sm font-medium text-muted-foreground">
        How well did you know this?
      </p>
      <div className="flex gap-3 justify-center">
        <Button
          variant="outline"
          className="flex-1 max-w-[200px] text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20 bg-transparent"
          onClick={() => onRate("hard")}
        >
          <XCircle className="h-4 w-4 mr-2" />
          <div className="text-left">
            <div className="font-semibold">Hard</div>
            <div className="text-xs">Review soon</div>
          </div>
        </Button>

        <Button
          variant="outline"
          className="flex-1 max-w-[200px] text-yellow-600 border-yellow-200 hover:bg-yellow-50 dark:hover:bg-yellow-950/20 bg-transparent"
          onClick={() => onRate("good")}
        >
          <MinusCircle className="h-4 w-4 mr-2" />
          <div className="text-left">
            <div className="font-semibold">Good</div>
            <div className="text-xs">Review later</div>
          </div>
        </Button>

        <Button
          variant="outline"
          className="flex-1 max-w-[200px] text-green-600 border-green-200 hover:bg-green-50 dark:hover:bg-green-950/20 bg-transparent"
          onClick={() => onRate("easy")}
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          <div className="text-left">
            <div className="font-semibold">Easy</div>
            <div className="text-xs">Mastered</div>
          </div>
        </Button>
      </div>
    </div>
  );
}
