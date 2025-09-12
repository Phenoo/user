"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import { Plus, BookOpen } from "lucide-react";
import { FlashcardItem } from "@/components/flashcard-item";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import CoursesSelect from "@/components/courses-select";
import { FlashcardContainer } from "./flashcard-container";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  image?: string;
  audio?: string;
  difficulty: "easy" | "medium" | "hard";
  lastReviewed?: Date;
  timesCorrect: number;
  timesIncorrect: number;
  mastered: boolean;
}

export interface FlashcardDeck {
  _id: string;
  name: string;
  description: string;
  subject: string;
  cards?: Flashcard[];
  color: string;
  createdAt: Date;
  lastStudied?: Date;
}

export interface FlashcardItemProps {
  id: string;
  title: string;
  subject: string;
  date: string;
  participants: number;
  color: string;
  type: "course" | "document";
}
export default function FlashcardsPageContainer() {
  const user = useQuery(api.users.currentUser);
  const userId = user?._id;

  const decks =
    useQuery(api.flashcards.getUserDecks, { userId: userId! }) || [];
  const createDeckMutation = useMutation(api.flashcards.createDeck);
  const updateCardPerformance = useMutation(
    api.flashcards.updateCardPerformance
  );

  const [selectedDeck, setSelectedDeck] = useState<string>("");
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyMode, setStudyMode] = useState<"all" | "unmastered" | "review">(
    "all"
  );
  const [isCreateDeckOpen, setIsCreateDeckOpen] = useState(false);
  const [isCreateCardOpen, setIsCreateCardOpen] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    incorrect: 0,
    total: 0,
  });

  const selectedDeckCards =
    useQuery(
      api.flashcards.getDeckCards,
      selectedDeck ? { deckId: selectedDeck as Id<"flashcardDecks"> } : "skip"
    ) || [];

  const [newDeck, setNewDeck] = useState({
    name: "",
    description: "",
    courseId: "",
    subject: "",
    color: "bg-blue-500",
    difficulty: "Medium" as const,
    isPublic: false,
    tags: [] as string[],
  });

  const currentDeck = decks.find((deck) => deck._id === selectedDeck);
  const studyCards = selectedDeckCards.filter((card) => {
    if (studyMode === "unmastered") return !card.isMastered;
    if (studyMode === "review") return card.lastStudied && !card.isMastered;
    return true;
  });

  const currentCard = studyCards[currentCardIndex];

  const [courseSubject, setCourseSubject] = useState("");

  const getCourses =
    useQuery(api.courses.getAllCourses, {
      userId: user?._id as Id<"users">,
    }) || [];

  const nextCard = () => {
    if (currentCardIndex < studyCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    }
  };

  const previousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleAnswer = async (correct: boolean) => {
    if (!currentCard) return;

    try {
      await updateCardPerformance({
        cardId: currentCard._id,
        isCorrect: correct,
      });

      setSessionStats((prev) => ({
        correct: correct ? prev.correct + 1 : prev.correct,
        incorrect: correct ? prev.incorrect : prev.incorrect + 1,
        total: prev.total + 1,
      }));

      // Auto-advance to next card
      setTimeout(() => {
        if (currentCardIndex < studyCards.length - 1) {
          nextCard();
        }
      }, 500);
    } catch (error) {
      console.error("Failed to update card performance:", error);
    }
  };

  const shuffleCards = () => {
    if (!currentDeck) return;
    // Reset to first card after shuffle
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  const createDeck = async () => {
    try {
      const deckId = await createDeckMutation({
        userId: userId!,
        subject: courseSubject,
        color: newDeck.color,
        description: newDeck.description,
        difficulty: newDeck.difficulty,
        name: newDeck.name,
        isPublic: false,
        tags: newDeck.tags,
        courseId: newDeck.courseId as Id<"courses">,
        createdBy: userId!,
      });
      setSelectedDeck(deckId);
      setIsCreateDeckOpen(false);
      setNewDeck({
        name: "",
        description: "",
        subject: "",
        color: "bg-blue-500",
        difficulty: "Medium",
        isPublic: false,
        courseId: "",
        tags: [],
      });
    } catch (error) {
      console.error("Failed to create deck:", error);
    }
  };

  useEffect(() => {
    const newcourseSubject =
      getCourses &&
      newDeck.courseId &&
      getCourses.filter((item) => item._id === newDeck.courseId)[0].code;
    console.log(newcourseSubject);

    setCourseSubject(newcourseSubject);
  }, [newDeck.courseId]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setIsFlipped(!isFlipped);
      } else if (e.key === "ArrowLeft") {
        previousCard();
      } else if (e.key === "ArrowRight") {
        nextCard();
      } else if (e.key === "1") {
        handleAnswer(false);
      } else if (e.key === "2") {
        handleAnswer(true);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isFlipped, currentCardIndex, studyCards.length]);

  return (
    <>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">
                  Flashcards Study
                </h1>
              </div>
              <div className="flex gap-2 ml-auto">
                <Sheet
                  open={isCreateDeckOpen}
                  onOpenChange={setIsCreateDeckOpen}
                >
                  <SheetTrigger asChild>
                    <Button variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      New Deck
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="md:max-w-2xl w-full">
                    <SheetHeader>
                      <SheetTitle>Create Flashcard Deck</SheetTitle>
                    </SheetHeader>
                    <div className="space-y-4 p-4">
                      <div className="space-y-2">
                        <Label htmlFor="deck-name">Deck Name</Label>
                        <Input
                          id="deck-name"
                          value={newDeck.name}
                          onChange={(e) =>
                            setNewDeck((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          placeholder="e.g., Programming Fundamentals"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="deck-description">Description</Label>
                        <Textarea
                          id="deck-description"
                          value={newDeck.description}
                          onChange={(e) =>
                            setNewDeck((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          placeholder="Brief description of the deck"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="deck-subject">Subject</Label>

                        <CoursesSelect
                          course={newDeck.courseId}
                          onChange={(e) => {
                            setNewDeck((prev) => ({
                              ...prev,
                              courseId: e,
                            }));
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Difficulty</Label>
                        <Select
                          value={newDeck.difficulty}
                          onValueChange={(value: any) =>
                            setNewDeck((prev) => ({
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
                      <div className="space-y-2">
                        <Label>Color</Label>
                        <div className="flex gap-2">
                          {[
                            "bg-blue-500",
                            "bg-green-500",
                            "bg-purple-500",
                            "bg-orange-500",
                            "bg-red-500",
                          ].map((color) => (
                            <button
                              key={color}
                              onClick={() =>
                                setNewDeck((prev) => ({ ...prev, color }))
                              }
                              className={`w-8 h-8 rounded-sm ${color} ${
                                newDeck.color === color
                                  ? "ring-2 ring-foreground"
                                  : ""
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <Button onClick={createDeck} className="w-full">
                        Create Deck
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto p-6">
          {decks && decks.length > 0 ? (
            <FlashcardContainer decks={decks} />
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">No Cards to Study</h2>
              <p className="text-muted-foreground mb-6">
                {studyMode === "unmastered"
                  ? "All cards in this deck are mastered! Try switching to 'All Cards' mode."
                  : "This deck doesn't have any cards yet. Add some cards to start studying."}
              </p>
              <Button onClick={() => setIsCreateCardOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Card
              </Button>
            </div>
          )}
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
    </>
  );
}
