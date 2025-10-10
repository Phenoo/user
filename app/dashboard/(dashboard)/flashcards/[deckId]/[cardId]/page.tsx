"use client";

import { use, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Brain,
  Star,
  ArrowRight,
  RotateCw,
  Trash2,
  Edit,
} from "lucide-react";
import { ConfidenceRating } from "../../components/confidence-rating";
import { RichTextEditor } from "../../components/rich-text-editor";

export default function CardPage({
  params,
}: {
  params: Promise<{ deckId: string; cardId: string }>;
}) {
  const { deckId, cardId } = use(params);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const user = useQuery(api.users.currentUser);
  const deck = useQuery(api.flashcards.getDeck, {
    deckId: deckId as Id<"flashcardDecks">,
  });
  const cards = useQuery(api.flashcards.getDeckCards, {
    deckId: deckId as Id<"flashcardDecks">,
  });
  const card = cards?.find((c) => c._id === cardId);

  const updatePerformance = useMutation(api.flashcards.updateCardPerformance);
  const updateCardMutation = useMutation(api.flashcards.updateFlashcard);
  const deleteCardMutation = useMutation(api.flashcards.deleteFlashcard);

  const [editCard, setEditCard] = useState({
    front: card?.front || "",
    back: card?.back || "",
    difficulty: card?.difficulty || "Medium",
    imageUrl: card?.imageUrl || "",
  });

  const handleConfidenceRating = async (
    confidence: "hard" | "good" | "easy"
  ) => {
    if (!card) return;

    await updatePerformance({
      cardId: card._id,
      isCorrect: confidence !== "hard",
      confidence,
    });

    const currentIndex = cards?.findIndex((c) => c._id === card._id) || 0;
    const nextCard =
      cards && currentIndex < cards.length - 1 ? cards[currentIndex + 1] : null;

    if (nextCard) {
      window.location.href = `/flashcards/${deck?._id}/${nextCard._id}`;
    }
  };

  const handleUpdateCard = async () => {
    if (!card) return;

    await updateCardMutation({
      cardId: card._id,
      front: editCard.front,
      back: editCard.back,
      difficulty: editCard.difficulty as "Easy" | "Medium" | "Hard",
      imageUrl: editCard.imageUrl,
    });

    setIsEditOpen(false);
  };

  const handleDeleteCard = async () => {
    if (!card) return;

    await deleteCardMutation({
      cardId: card._id,
      userId: user?._id as Id<"users">,
    });
    window.location.href = `/dashboard/flashcards/${deck?._id}`;
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
          <Link href="/dashboard/flashcards">
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
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto w-full px-4 py-4">
          <div className="flex items-start flex-col gap-4">
            <Link href={`/dashboard/flashcards/${deck._id}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to {deck.name}
              </Button>
            </Link>
            <div className="flex items-center justify-between w-full">
              <h1 className="text-2xl font-bold text-foreground">
                Card {currentIndex + 1} of {cards.length}
              </h1>
              <div className="flex gap-2">
                <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="sm:max-w-2xl overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Edit Flashcard</SheetTitle>
                    </SheetHeader>
                    <div className="space-y-4 p-4">
                      <div className="space-y-2">
                        <Label>Front (Question)</Label>
                        <RichTextEditor
                          value={editCard.front}
                          onChange={(value) =>
                            setEditCard((prev) => ({ ...prev, front: value }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Back (Answer)</Label>
                        <RichTextEditor
                          value={editCard.back}
                          onChange={(value) =>
                            setEditCard((prev) => ({ ...prev, back: value }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Image URL (Optional)</Label>
                        <input
                          type="text"
                          value={editCard.imageUrl}
                          onChange={(e) =>
                            setEditCard((prev) => ({
                              ...prev,
                              imageUrl: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border rounded-md"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Difficulty</Label>
                        <Select
                          value={editCard.difficulty}
                          onValueChange={(value) => {
                            //@ts-ignore
                            setEditCard((prev) => ({
                              ...prev,
                              difficulty: value,
                            }));
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Easy">Easy</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleUpdateCard} className="w-full">
                        Save Changes
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
                        Are you sure you want to delete this card?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive hover:bg-destructive/80"
                        onClick={handleDeleteCard}
                      >
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
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
              <Card className="absolute inset-0 w-full h-full backface-hidden border-2 border-primary/20">
                <CardContent className="p-8 h-full flex flex-col justify-center items-center text-center overflow-y-auto">
                  <div className="space-y-4 w-full">
                    <Badge variant="outline">Question</Badge>
                    <div
                      className="text-xl font-medium text-balance leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: card.front }}
                    />
                    {card.imageUrl && (
                      <img
                        src={card.imageUrl || "/placeholder.svg"}
                        alt="Card visual"
                        className="max-w-full h-auto rounded-lg mx-auto"
                      />
                    )}
                    <p className="text-sm text-muted-foreground">
                      Click to reveal answer
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 border-2 border-green-500/20 bg-green-50/50 dark:bg-green-950/20">
                <CardContent className="p-8 h-full flex flex-col justify-center items-center text-center overflow-y-auto">
                  <div className="space-y-4 w-full">
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    >
                      Answer
                    </Badge>
                    <div
                      className="text-xl font-medium text-balance leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: card.back }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {isFlipped && (
          <div className="mb-6">
            <ConfidenceRating onRate={handleConfidenceRating} />
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center">
          {prevCard ? (
            <Link href={`/dashboard/flashcards/${deck._id}/${prevCard._id}`}>
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous Card
              </Button>
            </Link>
          ) : (
            <div />
          )}

          <Button variant="outline" onClick={() => setIsFlipped(!isFlipped)}>
            <RotateCw className="h-4 w-4 mr-2" />
            Flip Card
          </Button>

          {nextCard ? (
            <Link href={`/dashboard/flashcards/${deck._id}/${nextCard._id}`}>
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
