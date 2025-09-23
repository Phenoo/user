"use client";

import { use, useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Star,
  Brain,
  BookOpen,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";

export default function CardPage({
  params,
}: {
  params: Promise<{ deckId: string; cardId: string }>;
}) {
  const { deckId, cardId } = use(params);

  const [isFlipped, setIsFlipped] = useState(false);

  const deck = useQuery(api.flashcards.getDeck, {
    deckId: deckId as Id<"flashcardDecks">,
  });
  const cards = useQuery(api.flashcards.getDeckCards, {
    deckId: deckId as Id<"flashcardDecks">,
  });
  const card = cards?.find((c) => c._id === cardId);

  const updatePerformance = useMutation(api.flashcards.updateCardPerformance);

  const handlePerformance = async (correct: boolean) => {
    if (!card) return;

    await updatePerformance({
      cardId: card._id,
      isCorrect: correct,
    });

    // Move to next card after performance update
    const currentIndex = cards?.findIndex((c) => c._id === card._id) || 0;
    const nextCard =
      cards && currentIndex < cards.length - 1 ? cards[currentIndex + 1] : null;

    if (nextCard) {
      window.location.href = `/flashcards/${deck?._id}/${nextCard._id}`;
    }
  };

  if (deck === undefined || cards === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold mb-2">Loading Card...</h2>
        </div>
      </div>
    );
  }

  if (!deck || !card) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Card Not Found</h2>
          <Link href="/flashcards">
            <Button>Back to Flashcards</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentIndex = cards.findIndex((c) => c._id === card._id);
  const prevCard = currentIndex > 0 ? cards[currentIndex - 1] : null;
  const nextCard =
    currentIndex < cards.length - 1 ? cards[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto w-full px-4 py-4">
          <div className="flex items-start flex-col gap-4">
            <Link href={`/dashboard/flashcards/${deck._id}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to {deck.name}
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">
                Card {currentIndex + 1} of {cards.length}
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        {/* Card Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  Difficulty
                </p>
                <Badge
                  variant={
                    card.difficulty === "Hard"
                      ? "destructive"
                      : card.difficulty === "Medium"
                        ? "default"
                        : "secondary"
                  }
                >
                  {card.difficulty}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  Correct
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {card.timesCorrect}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  Incorrect
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {card.timesIncorrect}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  Status
                </p>
                {card.masteredAt ? (
                  <Badge variant="outline" className="text-green-600">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    Mastered
                  </Badge>
                ) : (
                  <Badge variant="outline">Learning</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Flashcard */}
        <div className="flex justify-center mb-8">
          <div
            className="relative w-full max-w-2xl h-96 cursor-pointer"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div
              className={`absolute inset-0 w-full h-full transition-transform duration-500 transform-style-preserve-3d ${
                isFlipped ? "rotate-y-180" : ""
              }`}
            >
              {/* Front of card */}
              <Card className="absolute inset-0 w-full h-full backface-hidden border-2 border-primary/20">
                <CardContent className="p-8 h-full flex flex-col justify-center items-center text-center">
                  <div className="space-y-4">
                    <Badge variant="outline">Question</Badge>
                    <p className="text-xl font-medium text-balance leading-relaxed">
                      {card.front}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Click to reveal answer
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Back of card */}
              <Card className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 border-2 border-green-500/20 bg-green-50/50 dark:bg-green-950/20">
                <CardContent className="p-8 h-full flex flex-col justify-center items-center text-center">
                  <div className="space-y-4">
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    >
                      Answer
                    </Badge>
                    <p className="text-xl font-medium text-balance leading-relaxed">
                      {card.back}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {isFlipped && (
          <div className="flex justify-center gap-4 mb-6">
            <Button
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
              onClick={() => handlePerformance(false)}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Review Again 🔄
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => handlePerformance(true)}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Got it ✅
            </Button>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center">
          {prevCard ? (
            <Link href={`/flashcards/${deck._id}/${prevCard._id}`}>
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous Card
              </Button>
            </Link>
          ) : (
            <div />
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsFlipped(!isFlipped)}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Flip Card
            </Button>
          </div>

          {nextCard ? (
            <Link href={`/flashcards/${deck._id}/${nextCard._id}`}>
              <Button variant="outline">
                Next Card
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>

      <style jsx>{`
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
