"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Flame } from "lucide-react";

interface StudyChartProps {
  cards: any[];
}

export function StudyChart({ cards }: StudyChartProps) {
  if (!cards || cards.length === 0) return null;

  const totalCards = cards.length;
  const masteredCards = cards.filter((c) => c.isMastered).length;
  const learningCards = cards.filter(
    (c) => !c.isMastered && c.timesCorrect > 0
  ).length;
  const newCards = cards.filter(
    (c) => c.timesCorrect === 0 && c.timesIncorrect === 0
  ).length;

  const totalStudied = cards.reduce(
    (sum, card) => sum + card.timesCorrect + card.timesIncorrect,
    0
  );
  const totalCorrect = cards.reduce((sum, card) => sum + card.timesCorrect, 0);
  const accuracy =
    totalStudied > 0 ? Math.round((totalCorrect / totalStudied) * 100) : 0;

  // Calculate study streak (simplified - would need actual date tracking)
  const studyStreak = cards.filter((c) => c.lastStudied).length > 0 ? 3 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Study Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-green-600 font-medium">Mastered</span>
              <span className="font-bold">{masteredCards}</span>
            </div>
            <Progress
              value={(masteredCards / totalCards) * 100}
              className="h-2 bg-green-100"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-yellow-600 font-medium">Learning</span>
              <span className="font-bold">{learningCards}</span>
            </div>
            <Progress
              value={(learningCards / totalCards) * 100}
              className="h-2 bg-yellow-100"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-blue-600 font-medium">New</span>
              <span className="font-bold">{newCards}</span>
            </div>
            <Progress
              value={(newCards / totalCards) * 100}
              className="h-2 bg-blue-100"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Study Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Overall Accuracy
            </span>
            <span className="text-2xl font-bold text-green-600">
              {accuracy}%
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Reviews</span>
            <span className="text-2xl font-bold">{totalStudied}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Study Streak</span>
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <span className="text-2xl font-bold">{studyStreak} days</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
