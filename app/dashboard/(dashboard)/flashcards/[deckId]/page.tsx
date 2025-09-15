"use client";
import { use, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Brain,
  BookOpen,
  Star,
  Clock,
  Target,
  RotateCcw,
  Play,
  ChevronLeft,
  ChevronRight,
  RotateCw,
} from "lucide-react";
import Link from "next/link";
import { FlashcardItem } from "@/components/flashcard-item";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

export default function DeckPage({
  params,
}: {
  params: Promise<{ deckId: Id<"flashcardDecks"> }>;
}) {
  const { deckId } = use(params);

  const userId = useQuery(api.users.currentUser);

  const deck = useQuery(api.flashcards.getDeck, {
    deckId: deckId as Id<"flashcardDecks">,
  });

  const updatePerformance = useMutation(api.flashcards.updateCardPerformance);

  const [studyMode, setStudyMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyCards, setStudyCards] = useState<any[]>([]);

  const createCardMutation = useMutation(api.flashcards.createFlashcard);

  const [isCreateCardOpen, setIsCreateCardOpen] = useState(false);

  const cards = useQuery(api.flashcards.getCards, {
    userId: userId?._id!,
    deckId: deckId as Id<"flashcardDecks">,
  });

  const [newCard, setNewCard] = useState({
    front: "",
    back: "",
    difficulty: "Medium" as const,
  });

  const startStudyMode = (mode: "all" | "unmastered" = "all") => {
    if (!cards) return;

    const cardsToStudy =
      mode === "unmastered" ? cards.filter((card) => !card.isMastered) : cards;

    setStudyCards(cardsToStudy);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setStudyMode(true);
  };

  const nextCard = () => {
    if (currentCardIndex < studyCards.length - 1) {
      setCurrentCardIndex((prev) => prev + 1);
      setIsFlipped(false);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  };

  const handleAnswer = async (isCorrect: boolean) => {
    const currentCard = studyCards[currentCardIndex];
    if (currentCard) {
      await updatePerformance({
        cardId: currentCard._id,
        isCorrect,
      });

      // Auto advance to next card
      setTimeout(() => {
        if (currentCardIndex < studyCards.length - 1) {
          nextCard();
        } else {
          setStudyMode(false); // End study session
        }
      }, 500);
    }
  };

  const createCard = async () => {
    if (!userId?._id) return; // safety check
    if (!newCard.front.trim() || !newCard.back.trim()) return;

    await createCardMutation({
      userId: userId._id,
      deckId: deckId as Id<"flashcardDecks">,
      front: newCard.front,
      back: newCard.back,
      difficulty: newCard.difficulty,
    });

    setNewCard({ front: "", back: "", difficulty: "Medium" });
    setIsCreateCardOpen(false);
  };

  if (deck === undefined || cards === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold mb-2">Loading Deck...</h2>
        </div>
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Deck Not Found</h2>
          <Link href="/flashcards">
            <Button>Back to Flashcards</Button>
          </Link>
        </div>
      </div>
    );
  }

  const masteredCount = cards?.filter((card) => card.isMastered).length || 0;
  const masteredPercentage = cards?.length
    ? (masteredCount / cards.length) * 100
    : 0;

  if (studyMode && studyCards.length > 0) {
    const currentCard = studyCards[currentCardIndex];

    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Study Mode Header */}
        <header className="border-b bg-card p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Button variant="ghost" onClick={() => setStudyMode(false)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Exit Study Mode
            </Button>
            <div className="text-center">
              <h2 className="font-semibold">{deck.name}</h2>
              <p className="text-sm text-muted-foreground">
                {currentCardIndex + 1} of {studyCards.length}
              </p>
            </div>
            <div className="w-24">
              <Progress
                value={((currentCardIndex + 1) / studyCards.length) * 100}
                className="h-2"
              />
            </div>
          </div>
        </header>

        {/* Study Interface */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-2xl">
            <Card
              className="min-h-[400px] cursor-pointer transition-transform hover:scale-105"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <CardContent className="p-8 flex items-center justify-center text-center min-h-[400px]">
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    {isFlipped ? "Answer" : "Question"}
                  </div>
                  <div className="text-xl font-medium text-pretty">
                    {isFlipped ? currentCard.back : currentCard.front}
                  </div>
                  {!isFlipped && (
                    <div className="text-sm text-muted-foreground">
                      Click to reveal answer
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Navigation and Answer Buttons */}
            <div className="mt-6 space-y-4">
              {isFlipped && (
                <div className="flex gap-4 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => handleAnswer(false)}
                    className="flex-1 max-w-48"
                  >
                    Review again 🔄
                  </Button>
                  <Button
                    onClick={() => handleAnswer(true)}
                    className="flex-1 max-w-48"
                  >
                    Got it ✅
                  </Button>
                </div>
              )}

              <div className="flex justify-between items-center">
                <Button
                  variant="ghost"
                  onClick={prevCard}
                  disabled={currentCardIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => setIsFlipped(!isFlipped)}
                >
                  <RotateCw className="h-4 w-4 mr-2" />
                  Flip Card
                </Button>

                <Button
                  variant="ghost"
                  onClick={nextCard}
                  disabled={currentCardIndex === studyCards.length - 1}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link href="/flashcards">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Flashcards
            </Button>
          </Link>
          <div className="flex items-start md:items-center gap-4 justify-between flex-col md:flex-row">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-sm bg-blue-500" />
              <h1 className="text-2xl font-bold text-foreground">
                {deck.name}
              </h1>
            </div>
            <Sheet open={isCreateCardOpen} onOpenChange={setIsCreateCardOpen}>
              <SheetTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Card
                </Button>
              </SheetTrigger>
              <SheetContent className="sm:max-w-2xl">
                <SheetHeader>
                  <SheetTitle>Add Flashcard</SheetTitle>
                </SheetHeader>
                <div className="space-y-4 p-4">
                  <div className="space-y-2">
                    <Label htmlFor="card-front">Front (Question)</Label>
                    <Textarea
                      id="card-front"
                      value={newCard.front}
                      onChange={(e) =>
                        setNewCard((prev) => ({
                          ...prev,
                          front: e.target.value,
                        }))
                      }
                      placeholder="Enter the question or prompt"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="card-back">Back (Answer)</Label>
                    <Textarea
                      id="card-back"
                      value={newCard.back}
                      onChange={(e) =>
                        setNewCard((prev) => ({
                          ...prev,
                          back: e.target.value,
                        }))
                      }
                      placeholder="Enter the answer or explanation"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="card-difficulty">Difficulty</Label>
                    <Select
                      value={newCard.difficulty}
                      onValueChange={(value: any) =>
                        setNewCard((prev) => ({
                          ...prev,
                          difficulty: value,
                        }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={createCard} className="w-full">
                    Add Card
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Deck Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Total Cards</p>
                  <p className="text-2xl font-bold">{cards?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium">Mastered</p>
                  <p className="text-2xl font-bold">{masteredCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Progress</p>
                  <p className="text-2xl font-bold">
                    {Math.round(masteredPercentage)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-sm font-medium">Last Studied</p>
                  <p className="text-sm font-bold">
                    {/* {deck.lastStudied
                      ? new Date(deck.lastStudied).toLocaleDateString()
                      : "Never"} */}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          <Progress value={masteredPercentage} className="h-3" />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <Button size="lg" onClick={() => startStudyMode("all")}>
            <Play className="h-4 w-4 mr-2" />
            Start Study Mode
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => startStudyMode("unmastered")}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Review Unmastered
          </Button>
          {/* <Link href={`/flashcards?deck=${deck._id}`}> */}
          <Button variant="outline" size="lg">
            <Brain className="h-4 w-4 mr-2" />
            Full Study Session
          </Button>
          {/* </Link> */}
        </div>

        {/* Cards Grid */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">All Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.length > 0 ? (
              cards?.map((card) => (
                <Link
                  key={card._id}
                  href={`/dashboard/flashcards/${deck._id}/${card._id}`}
                >
                  <FlashcardItem
                    item={{
                      id: card._id,
                      title:
                        card.front.length > 50
                          ? card.front.substring(0, 50) + "..."
                          : card.front,
                      subject: card.difficulty,
                      date: card.isMastered
                        ? "Mastered"
                        : `${card.timesCorrect}/${card.timesCorrect + card.timesIncorrect} correct`,
                      participants: card.timesCorrect + card.timesIncorrect,
                      color: card.isMastered
                        ? "border-t-green-500"
                        : card.difficulty === "Hard"
                          ? "border-t-red-500"
                          : card.difficulty === "Medium"
                            ? "border-t-yellow-500"
                            : "border-t-blue-500",
                    }}
                  />
                </Link>
              ))
            ) : (
              <div className="py-10">
                <h4 className="text-lg font-bold ">No cards found</h4>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
