"use client";

import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, BookOpen, Crown, ArrowUpRight } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import CoursesSelect from "@/components/courses-select";
import { toast } from "sonner";
import Link from "next/link";

interface AIFlashcardGeneratorSheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  defaultCourseId?: string;
}

export function AIFlashcardGeneratorSheet({
  open,
  onOpenChange,
  trigger,
  defaultCourseId = "",
}: AIFlashcardGeneratorSheetProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open !== undefined ? open : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const user = useQuery(api.users.currentUser);
  const userId = user?._id;

  const courses =
    useQuery(
      api.courses.getAllCourses,
      userId ? { userId: userId as Id<"users"> } : "skip"
    ) || [];

  const createDeckWithCards = useMutation(
    api.flashcards.createDeckWithGeneratedCards
  );

  const [selectedCourseId, setSelectedCourseId] = useState(defaultCourseId);
  const [deckName, setDeckName] = useState("");
  const [aiNotes, setAiNotes] = useState("");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">(
    "Medium"
  );
  const [isGenerating, setIsGenerating] = useState(false);

  // Plan limits: 20 for Scholar (STUDENTPRO), 10 for Starter (STUDENT), 2 for Free (FREE)
  const userPlan = user?.subscriptionPlan || "FREE";
  const cardLimit =
    userPlan === "STUDENTPRO" ? 20 : userPlan === "STUDENT" ? 10 : 2;

  const planLabel =
    userPlan === "STUDENTPRO"
      ? "Scholar / Pro Plan"
      : userPlan === "STUDENT"
      ? "Starter Plan"
      : "Free Plan";

  const handleGenerate = async () => {
    if (!selectedCourseId) {
      toast.error("Please select a course first");
      return;
    }

    const selectedCourse = courses.find((c) => c._id === selectedCourseId);
    const courseName = selectedCourse ? selectedCourse.name : "Course";

    setIsGenerating(true);

    try {
      const topicPrompt =
        deckName.trim() ||
        aiNotes.trim().slice(0, 100) ||
        `${courseName} key concepts`;

      const response = await fetch("/api/generate-flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: `${courseName} - ${topicPrompt}`,
          count: cardLimit,
          difficulty,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.flashcards) {
        throw new Error(data.error || "Failed to generate flashcards");
      }

      const createdDeckId = await createDeckWithCards({
        userId: userId!,
        name: deckName.trim() || `${courseName} AI Deck`,
        description: `AI-generated deck (${data.flashcards.length} cards) for ${courseName}`,
        courseId: selectedCourseId as Id<"courses">,
        difficulty,
        color: "border-t-purple-500",
        cards: data.flashcards.map((card: any) => ({
          front: card.front,
          back: card.back,
          difficulty:
            (card.difficulty as "Easy" | "Medium" | "Hard") || difficulty,
        })),
      });

      toast.success(
        `Generated ${data.flashcards.length} flashcards for ${courseName}!`
      );

      // Reset and close sheet
      setSelectedCourseId("");
      setDeckName("");
      setAiNotes("");
      setOpen(false);
    } catch (error: any) {
      console.error("Flashcard generation error:", error);
      toast.error(error.message || "Failed to generate flashcards");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      <SheetContent className="md:max-w-2xl w-full overflow-y-auto">
        <SheetHeader className="pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              <SheetTitle>AI Flashcard Generator</SheetTitle>
            </div>
            <Link href="/dashboard/pricing">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 font-semibold"
              >
                <Crown className="h-4 w-4 text-amber-500" />
                Upgrade Plan
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </SheetHeader>

        <div className="space-y-5 p-4 pt-6">
          {/* Card Limit & Upgrade Notification Banner */}
          <div className="p-3 bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 rounded-xl border border-purple-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="font-semibold">
                  {planLabel}
                </Badge>
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                  {cardLimit} Cards per Generation
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {userPlan === "FREE"
                  ? "Free plan generates 2 cards per session. Upgrade for 10 or 20 cards!"
                  : userPlan === "STUDENT"
                  ? "Starter plan generates 10 cards per session. Upgrade to Scholar for 20 cards!"
                  : "Scholar plan gives you maximum 20 cards per generation!"}
              </p>
            </div>
            <Link href="/dashboard/pricing" className="shrink-0 w-full sm:w-auto">
              <Button size="sm" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium gap-1 text-xs">
                <Crown className="h-3.5 w-3.5" />
                Upgrade
              </Button>
            </Link>
          </div>

          {/* 1. Course Selection */}
          <div className="space-y-2">
            <Label htmlFor="course-select" className="font-semibold flex items-center gap-1">
              <BookOpen className="h-4 w-4 text-primary" />
              Select Course <span className="text-red-500">*</span>
            </Label>
            <CoursesSelect
              course={selectedCourseId}
              onChange={(cId) => setSelectedCourseId(cId)}
            />
            {!selectedCourseId && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Please pick a course to link your generated flashcard deck.
              </p>
            )}
          </div>

          {/* 2. Deck Title / Topic */}
          <div className="space-y-2">
            <Label htmlFor="deck-topic" className="font-semibold">
              Deck Title / Topic (Optional)
            </Label>
            <Input
              id="deck-topic"
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
              placeholder="e.g. Midterm Chapter 3 Review, Calculus Integration..."
            />
          </div>

          {/* 3. Notes or Study Content */}
          <div className="space-y-2">
            <Label htmlFor="ai-notes" className="font-semibold">
              Notes or Study Material (Optional)
            </Label>
            <Textarea
              id="ai-notes"
              value={aiNotes}
              onChange={(e) => setAiNotes(e.target.value)}
              placeholder="Paste study notes, lecture transcripts, or key formulas here to guide the AI..."
              className="min-h-[120px]"
            />
          </div>

          {/* 4. Target Difficulty */}
          <div className="space-y-2">
            <Label className="font-semibold">Target Difficulty</Label>
            <Select
              value={difficulty}
              onValueChange={(val: any) => setDifficulty(val)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Easy">Easy (Fundamentals)</SelectItem>
                <SelectItem value="Medium">Medium (Standard Exam Level)</SelectItem>
                <SelectItem value="Hard">Hard (Advanced Application)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !selectedCourseId}
              className="w-full h-11 font-semibold text-base bg-primary hover:bg-primary/90"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Generating {cardLimit} Flashcards...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generate {cardLimit} Flashcards with AI
                </>
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
