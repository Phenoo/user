"use client";

import React, { useEffect, useState } from "react";
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
import { Button } from "@/components/ui/button";
import CoursesSelect from "@/components/courses-select";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useParams } from "next/navigation";
import { cardColors } from "./flashcardpage-container";
import { useUsageTracking } from "@/hooks/use-usage-tracking";
import { UsageIndicator } from "@/components/usage-tracking/usage-indicator";

const NewFlashcard = () => {
  const [selectedDeck, setSelectedDeck] = useState<string>("");
  const createDeckMutation = useMutation(api.flashcards.createDeck);
  const [isCreateDeckOpen, setIsCreateDeckOpen] = useState(false);
  const { trackUsage } = useUsageTracking();

  const params = useParams();

  const user = useQuery(api.users.currentUser);
  const userId = user?._id;
  const [newDeck, setNewDeck] = useState({
    name: "",
    description: "",
    courseId: "",
    color: cardColors[0].border,
    difficulty: "Medium" as const,
    isPublic: false,
    tags: [] as string[],
  });

  const createDeck = async () => {
    try {
      // Track usage before creating deck
      const usageTracked = await trackUsage("DECKS_CREATED");
      if (!usageTracked) {
        return; // Usage limit reached or error occurred
      }

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
      setSelectedDeck(deckId);
      setIsCreateDeckOpen(false);
      setNewDeck({
        name: "",
        description: "",
        color: cardColors[0].border,
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
    setNewDeck((prev) => ({
      ...prev,
      courseId: params.id as string,
    }));
  }, [params.id]);

  return (
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
          <div className="space-y-3">
            <UsageIndicator
              feature="DECKS_CREATED"
              showDetails={true}
              className="mb-2"
            />
            <Button onClick={createDeck} className="w-full">
              Create Deck
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NewFlashcard;
