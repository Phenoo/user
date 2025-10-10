"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
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
import { Plus, BookOpen, Sparkles, Brain } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import CoursesSelect from "@/components/courses-select";
import { FlashcardContainer } from "./flashcard-container";
import { Button } from "@/components/ui/button";
import GenerateButton from "@/components/generate-button";

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

export const cardColors = [
  { bg: "bg-blue-500", border: "border-t-blue-500" },
  { bg: "bg-green-500", border: "border-t-green-500" },
  { bg: "bg-purple-500", border: "border-t-purple-500" },
  { bg: "bg-orange-500", border: "border-t-orange-500" },
  { bg: "bg-red-500", border: "border-t-red-500" },
  { bg: "bg-yellow-500", border: "border-t-yellow-500" },
  { bg: "bg-pink-500", border: "border-t-pink-500" },
  { bg: "bg-teal-500", border: "border-t-teal-500" },
  { bg: "bg-indigo-500", border: "border-t-indigo-500" },
  { bg: "bg-cyan-500", border: "border-t-cyan-500" },
  { bg: "bg-lime-500", border: "border-t-lime-500" },
  { bg: "bg-emerald-500", border: "border-t-emerald-500" },
  { bg: "bg-rose-500", border: "border-t-rose-500" },
  { bg: "bg-fuchsia-500", border: "border-t-fuchsia-500" },
  { bg: "bg-sky-500", border: "border-t-sky-500" },
];

export default function FlashcardsPageContainer() {
  const user = useQuery(api.users.currentUser);
  const userId = user?._id;

  const decks =
    useQuery(api.flashcards.getUserDecks, { userId: userId! }) || [];
  const createDeckMutation = useMutation(api.flashcards.createDeck);

  const [isCreateDeckOpen, setIsCreateDeckOpen] = useState(false);
  const [isAIGenerateOpen, setIsAIGenerateOpen] = useState(false);
  const [aiNotes, setAiNotes] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

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

  const createDeck = async () => {
    try {
      const deckId = await createDeckMutation({
        userId: userId!,
        color: newDeck.color,
        description: newDeck.description,
        difficulty: newDeck.difficulty,
        name: newDeck.name,
        isPublic: false,
        tags: newDeck.tags,
        courseId: newDeck.courseId as Id<"courses">,
        createdBy: userId!,
      });
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

  const generateFlashcardsFromNotes = async () => {
    if (!aiNotes.trim()) return;

    setIsGenerating(true);
    try {
      // This would call an AI API to generate flashcards
      // For now, we'll create a placeholder deck
      await createDeckMutation({
        userId: userId!,
        color: "border-t-purple-500",
        description: "AI-generated from notes",
        difficulty: "Medium",
        name: "AI Generated Deck",
        isPublic: false,
        tags: ["ai-generated"],
        courseId: newDeck.courseId as Id<"courses">,
        createdBy: userId!,
      });

      setIsAIGenerateOpen(false);
      setAiNotes("");
    } catch (error) {
      console.error("Failed to generate flashcards:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Brain className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">
                Flashcards Study
              </h1>
            </div>
            <div className="flex gap-2 ml-auto">
              <Sheet open={isAIGenerateOpen} onOpenChange={setIsAIGenerateOpen}>
                <SheetTrigger asChild>
                  <GenerateButton title="Cards" />
                </SheetTrigger>
                <SheetContent className="md:max-w-2xl w-full">
                  <SheetHeader>
                    <SheetTitle>AI-Assisted Flashcard Generation</SheetTitle>
                  </SheetHeader>
                  <div className="space-y-4 p-4">
                    <div className="space-y-2">
                      <Label htmlFor="ai-notes">Paste Your Notes or Text</Label>
                      <Textarea
                        id="ai-notes"
                        value={aiNotes}
                        onChange={(e) => setAiNotes(e.target.value)}
                        placeholder="Paste your study notes, lecture transcripts, or any text you want to convert into flashcards..."
                        className="min-h-[300px]"
                      />
                    </div>
                    <Button
                      onClick={generateFlashcardsFromNotes}
                      className="w-full"
                      disabled={isGenerating || !aiNotes.trim()}
                    >
                      {isGenerating ? "Generating..." : "Generate Flashcards"}
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>

              <Sheet open={isCreateDeckOpen} onOpenChange={setIsCreateDeckOpen}>
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
                        {cardColors.map((color) => (
                          <button
                            key={color.bg}
                            onClick={() =>
                              setNewDeck((prev) => ({
                                ...prev,
                                color: color.border,
                              }))
                            }
                            className={`w-8 h-8 rounded-sm ${color.bg} ${
                              newDeck.color === color.border
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
            <h2 className="text-2xl font-bold mb-2">No Decks Yet</h2>
            <p className="text-muted-foreground mb-6">
              Create your first flashcard deck to start studying effectively
              with active recall and spaced repetition.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => setIsCreateDeckOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Deck
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsAIGenerateOpen(true)}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                AI Generate
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
