"use client";

import { use, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Plus,
  BookOpen,
  Star,
  Target,
  Clock,
  Play,
  RotateCcw,
  Brain,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { FlashcardItem } from "@/components/flashcard-item";
import { RichTextEditor } from "../components/rich-text-editor";
import { StudyChart } from "../components/study-chart";
import { ConfidenceRating } from "../components/confidence-rating";

export default function DeckPage({
  params,
}: {
  params: Promise<{ deckId: Id<"flashcardDecks"> }>;
}) {
  const { deckId } = use(params);
  const userId = useQuery(api.users.currentUser);
  const deck = useQuery(api.flashcards.getDeck, { deckId });
  const cards = useQuery(api.flashcards.getCards, {
    userId: userId?._id!,
    deckId,
  });

  const updatePerformance = useMutation(api.flashcards.updateCardPerformance);
  const createCardMutation = useMutation(api.flashcards.createFlashcard);
  const deleteCardMutation = useMutation(api.flashcards.deleteFlashcard);
  const deleteDeckMutation = useMutation(api.flashcards.deleteDeck);

  const [studyMode, setStudyMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyCards, setStudyCards] = useState<any[]>([]);
  const [sessionStats, setSessionStats] = useState({
    mastered: 0,
    learning: 0,
    needsReview: 0,
  });

  const [isCreateCardOpen, setIsCreateCardOpen] = useState(false);
  const [newCard, setNewCard] = useState({
    front: "",
    back: "",
    difficulty: "Medium" as const,
    imageUrl: "",
  });

  const startStudyMode = (mode: "all" | "unmastered" | "due" = "all") => {
    if (!cards) return;

    let cardsToStudy = cards;

    if (mode === "unmastered") {
      cardsToStudy = cards.filter((card) => !card.isMastered);
    } else if (mode === "due") {
      // Filter cards that are due for review based on spaced repetition
      const now = Date.now();
      cardsToStudy = cards.filter((card) => {
        if (!card.nextReviewDate) return true;
        return new Date(card.nextReviewDate).getTime() <= now;
      });
    }

    // Shuffle cards for better learning
    const shuffled = [...cardsToStudy].sort(() => Math.random() - 0.5);
    setStudyCards(shuffled);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setStudyMode(true);
    setSessionStats({ mastered: 0, learning: 0, needsReview: 0 });
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

  const handleConfidenceRating = async (
    confidence: "hard" | "good" | "easy"
  ) => {
    const currentCard = studyCards[currentCardIndex];
    if (!currentCard) return;

    // Update session stats
    if (confidence === "easy") {
      setSessionStats((prev) => ({ ...prev, mastered: prev.mastered + 1 }));
    } else if (confidence === "good") {
      setSessionStats((prev) => ({ ...prev, learning: prev.learning + 1 }));
    } else {
      setSessionStats((prev) => ({
        ...prev,
        needsReview: prev.needsReview + 1,
      }));
    }

    await updatePerformance({
      cardId: currentCard._id,
      isCorrect: confidence !== "hard",
      confidence,
    });

    setTimeout(() => {
      if (currentCardIndex < studyCards.length - 1) {
        nextCard();
      } else {
        setStudyMode(false);
      }
    }, 500);
  };

  const createCard = async () => {
    if (!userId?._id || !newCard.front.trim() || !newCard.back.trim()) return;

    await createCardMutation({
      userId: userId._id,
      deckId,
      front: newCard.front,
      back: newCard.back,
      difficulty: newCard.difficulty,
      imageUrl: newCard.imageUrl,
    });

    setNewCard({ front: "", back: "", difficulty: "Medium", imageUrl: "" });
    setIsCreateCardOpen(false);
  };

  const handleDeleteDeck = async () => {
    await deleteDeckMutation({ deckId });
    window.location.href = "/dashboard/flashcards";
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
          <Link href="/dashboard/flashcards">
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
  const dueForReview =
    cards?.filter((card) => {
      if (!card.nextReviewDate) return true;
      return new Date(card.nextReviewDate).getTime() <= Date.now();
    }).length || 0;

  if (studyMode && studyCards.length > 0) {
    const currentCard = studyCards[currentCardIndex];

    return (
      <div className="min-h-screen bg-background flex flex-col">
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
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="text-green-600 font-medium">
                  {sessionStats.mastered}
                </span>
                {" / "}
                <span className="text-yellow-600 font-medium">
                  {sessionStats.learning}
                </span>
                {" / "}
                <span className="text-red-600 font-medium">
                  {sessionStats.needsReview}
                </span>
              </div>
              <Progress
                value={((currentCardIndex + 1) / studyCards.length) * 100}
                className="h-2 w-24"
              />
            </div>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-2xl">
            <Card
              className="min-h-[400px] cursor-pointer transition-transform hover:scale-105"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <CardContent className="p-8 flex items-center justify-center text-center min-h-[400px]">
                <div className="space-y-4 w-full">
                  <Badge variant="outline">
                    {isFlipped ? "Answer" : "Question"}
                  </Badge>
                  <div
                    className="text-xl font-medium text-pretty leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: isFlipped ? currentCard.back : currentCard.front,
                    }}
                  />
                  {currentCard.imageUrl && (
                    <img
                      src={currentCard.imageUrl || "/placeholder.svg"}
                      alt="Card visual"
                      className="max-w-full h-auto rounded-lg mx-auto"
                    />
                  )}
                  {!isFlipped && (
                    <p className="text-sm text-muted-foreground">
                      Click to reveal answer
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 space-y-4">
              {isFlipped && (
                <ConfidenceRating onRate={handleConfidenceRating} />
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
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link href="/dashboard/flashcards">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Flashcards
            </Button>
          </Link>
          <div className="flex items-start md:items-center gap-4 justify-between flex-col md:flex-row mt-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-sm ${deck.color || "bg-blue-500"}`}
              />
              <h1 className="text-2xl font-bold text-foreground">
                {deck.name}
              </h1>
            </div>
            <div className="flex gap-2">
              <Sheet open={isCreateCardOpen} onOpenChange={setIsCreateCardOpen}>
                <SheetTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Card
                  </Button>
                </SheetTrigger>
                <SheetContent className="sm:max-w-2xl overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Add Flashcard</SheetTitle>
                  </SheetHeader>
                  <div className="space-y-4 p-4">
                    <div className="space-y-2">
                      <Label htmlFor="card-front">Front (Question)</Label>
                      <RichTextEditor
                        value={newCard.front}
                        onChange={(value) =>
                          setNewCard((prev) => ({ ...prev, front: value }))
                        }
                        placeholder="Enter the question or prompt (supports LaTeX: $$E=mc^2$$)"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="card-back">Back (Answer)</Label>
                      <RichTextEditor
                        value={newCard.back}
                        onChange={(value) =>
                          setNewCard((prev) => ({ ...prev, back: value }))
                        }
                        placeholder="Enter the answer or explanation"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="card-image">Image URL (Optional)</Label>
                      <input
                        type="text"
                        id="card-image"
                        value={newCard.imageUrl}
                        onChange={(e) =>
                          setNewCard((prev) => ({
                            ...prev,
                            imageUrl: e.target.value,
                          }))
                        }
                        placeholder="https://example.com/image.jpg"
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="card-difficulty">Difficulty</Label>
                      <Select
                        value={newCard.difficulty}
                        onValueChange={(value: any) =>
                          setNewCard((prev) => ({ ...prev, difficulty: value }))
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

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this deck? This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteDeck}
                      className="bg-destructive hover:bg-destructive/80"
                    >
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
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
                  <p className="text-sm font-medium">Due for Review</p>
                  <p className="text-2xl font-bold">{dueForReview}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          <Progress value={masteredPercentage} className="h-3" />
        </div>

        <StudyChart cards={cards || []} />

        <div className="flex gap-4 mb-8 flex-wrap">
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
          <Button
            variant="outline"
            size="lg"
            onClick={() => startStudyMode("due")}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Due for Review ({dueForReview})
          </Button>
        </div>

        {/* Cards Grid */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">All Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards && cards.length > 0 ? (
              cards.map((card) => (
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
              <div className="col-span-full text-center py-10">
                <h4 className="text-lg font-bold mb-2">No cards found</h4>
                <p className="text-muted-foreground mb-4">
                  Add your first flashcard to start studying
                </p>
                <Button onClick={() => setIsCreateCardOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Card
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
