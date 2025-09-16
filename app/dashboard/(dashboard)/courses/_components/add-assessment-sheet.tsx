"use client";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";

interface AddAssessmentSheetProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  courseId: Id<"courses">;
  userId: Id<"users">;
  onAssessmentAdded: () => void; // Callback to refresh assessments
}

export function AddAssessmentSheet({
  isOpen,
  setIsOpen,
  courseId,
  userId,
  onAssessmentAdded,
}: AddAssessmentSheetProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [score, setScore] = useState<string>("");
  const [maxScore, setMaxScore] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [date, setDate] = useState("");
  const [feedback, setFeedback] = useState("");
  const [status, setStatus] = useState<"graded" | "pending" | "upcoming">(
    "upcoming"
  );
  const [isLoading, setIsLoading] = useState(false);

  const addAssessment = useMutation(api.assessments.addAssessment);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!name || !type || !weight || !date) {
      toast.error(
        "Please fill in all required fields (Name, Type, Weight, Date)"
      );
      setIsLoading(false);
      return;
    }

    const parsedScore = score ? parseInt(score) : null;
    const parsedMaxScore = maxScore ? parseInt(maxScore) : null;
    const parsedWeight = parseInt(weight);

    if (isNaN(parsedWeight)) {
      toast.error("Weight must be a valid number.");
      setIsLoading(false);
      return;
    }
    if (parsedScore !== null && (isNaN(parsedScore) || parsedScore < 0)) {
      toast.error("Score must be a valid non-negative number.");
      setIsLoading(false);
      return;
    }
    if (
      parsedMaxScore !== null &&
      (isNaN(parsedMaxScore) || parsedMaxScore <= 0)
    ) {
      toast.error("Max Score must be a valid positive number.");
      setIsLoading(false);
      return;
    }
    if (
      parsedScore !== null &&
      parsedMaxScore !== null &&
      parsedScore > parsedMaxScore
    ) {
      toast.error("Score cannot be greater than Max Score.");
      setIsLoading(false);
      return;
    }

    try {
      await addAssessment({
        userId: userId,
        courseId,
        name,
        type,
        score: parsedScore || 0,
        maxScore: parsedMaxScore || 0,
        weight: parsedWeight,
        date,
        feedback: feedback || "",
        status,
      });
      toast.success("Assessment added successfully!");
      // Reset form
      setName("");
      setType("");
      setScore("");
      setMaxScore("");
      setWeight("");
      setDate("");
      setFeedback("");
      setStatus("upcoming");
      setIsOpen(false);
      onAssessmentAdded(); // Call callback to refetch assessments
    } catch (error) {
      toast.error("Failed to add assessment.");
      console.error("Failed to add assessment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Add New Assessment</SheetTitle>
          <SheetDescription>
            Fill in the details for a new course assessment.
          </SheetDescription>
        </SheetHeader>
        <div className="h-full overflow-y-scroll">
          <form onSubmit={handleSubmit} className="grid gap-4 p-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Assessment Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Midterm Exam, Assignment 1"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={setType} required>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Exam">Exam</SelectItem>
                  <SelectItem value="Assignment">Assignment</SelectItem>
                  <SelectItem value="Quiz">Quiz</SelectItem>
                  <SelectItem value="Project">Project</SelectItem>
                  <SelectItem value="Participation">Participation</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="score">Score (Optional)</Label>
                <Input
                  id="score"
                  type="number"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  placeholder="e.g., 85"
                  min="0"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="maxScore">Max Score (Optional)</Label>
                <Input
                  id="maxScore"
                  type="number"
                  value={maxScore}
                  onChange={(e) => setMaxScore(e.target.value)}
                  placeholder="e.g., 100"
                  min="1"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="weight">Weight (%)</Label>
              <Input
                id="weight"
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g., 30"
                required
                min="0"
                max="100"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="date">Due Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={status}
                onValueChange={(value: "graded" | "pending" | "upcoming") =>
                  setStatus(value)
                }
                required
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="pending">Pending Grading</SelectItem>
                  <SelectItem value="graded">Graded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="feedback">Feedback (Optional)</Label>
              <Textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Any feedback for this assessment..."
              />
            </div>

            <Button type="submit" disabled={isLoading} className="mt-4">
              {isLoading ? "Adding..." : "Add Assessment"}
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
