"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Edit,
  Users,
  BookOpen,
  FileText,
  GraduationCap,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface FlashcardItem {
  id: string;
  title: string;
  subject: string;
  date: string;
  participants: number;
  color: string;
  type: "course" | "document";
}

const mockFlashcards: FlashcardItem[] = [
  {
    id: "1",
    title: "Chapter 3",
    subject: "Party History",
    date: "Academic Year 1 2024 - 2025",
    participants: 3,
    color: "border-t-rose-400",
    type: "course",
  },
  {
    id: "2",
    title: "Chapter 4",
    subject: "Aesthetics",
    date: "Academic Year 1 (2024 - 2025)",
    participants: 2,
    color: "border-t-green-400",
    type: "course",
  },
  {
    id: "3",
    title: "Chapter 3",
    subject: "Aesthetics",
    date: "Academic Year 1 (2024 - 2025)",
    participants: 2,
    color: "border-t-green-400",
    type: "course",
  },
  {
    id: "4",
    title: "Chapter 2",
    subject: "Party History",
    date: "Academic Year 1 (2024 - 2025)",
    participants: 1,
    color: "border-t-rose-400",
    type: "course",
  },
  {
    id: "5",
    title: "Chapter 1",
    subject: "Aesthetics",
    date: "Academic Year 1 (2024 - 2025)",
    participants: 2,
    color: "border-t-green-400",
    type: "course",
  },
  {
    id: "6",
    title: "How something is done vocabulary",
    subject: "Beginner English",
    date: "8 hours ago",
    participants: 1,
    color: "border-t-yellow-400",
    type: "document",
  },
  {
    id: "7",
    title: "Home vocabulary",
    subject: "Beginner English",
    date: "7 hours ago",
    participants: 1,
    color: "border-yellow-400",
    type: "document",
  },
];

export function FlashcardContainer() {
  const [activeTab, setActiveTab] = useState("my-documents");
  const [isCreateCourseOpen, setIsCreateCourseOpen] = useState(false);
  const [isCreateDocumentOpen, setIsCreateDocumentOpen] = useState(false);

  const groupedByDate = mockFlashcards.reduce(
    (acc, item) => {
      const dateKey = item.date.includes("Academic Year")
        ? "Library"
        : item.date.includes("hours ago")
          ? getDateFromHours(item.date)
          : item.date;
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(item);
      return acc;
    },
    {} as Record<string, FlashcardItem[]>
  );

  function getDateFromHours(timeStr: string): string {
    const hours = Number.parseInt(timeStr.split(" ")[0]);
    const date = new Date();
    date.setHours(date.getHours() - hours);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  return (
    <div className="min-h-screen max-w-7xl p-4 mx-auto w-full flex flex-col gap-8">
      {/* Header */}
      <div className="mb-6 flex md:items-center justify-between gap-4 flex-col md:flex-row">
        <h1 className="text-2xl font-bold text-foreground">Flashcards</h1>
        <div className="flex gap-2">
          <Dialog
            open={isCreateCourseOpen}
            onOpenChange={setIsCreateCourseOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline">
                <GraduationCap className="mr-2 h-4 w-4" />
                Create Course
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create Course</DialogTitle>
              </DialogHeader>
              <CreateCourseForm onClose={() => setIsCreateCourseOpen(false)} />
            </DialogContent>
          </Dialog>

          <Dialog
            open={isCreateDocumentOpen}
            onOpenChange={setIsCreateDocumentOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Create Document
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create Document</DialogTitle>
              </DialogHeader>
              <CreateDocumentForm
                onClose={() => setIsCreateDocumentOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabs */}
      <div className="w-full">
        <div className="grid w-fit grid-cols-2 bg-muted p-1 rounded-3xl mb-6">
          <div
            className={cn(
              "text-sm py-2 md:py-4 px-4 md:px-6 cursor-pointer hover:bg-rose-100 rounded-3xl flex items-center justify-center transition-colors",
              activeTab === "my-documents"
                ? "bg-primary text-foreground font-bold"
                : "hover:bg-rose-100 text-background"
            )}
            onClick={() => setActiveTab("my-documents")}
          >
            My Documents
          </div>
          <div
            onClick={() => setActiveTab("my-courses")}
            className={cn(
              "text-sm py-4 px-6 cursor-pointer rounded-3xl text-background  flex items-center justify-center transition-colors",
              activeTab === "my-courses"
                ? "bg-primary text-foreground font-bold"
                : "hover:bg-rose-100 text-background"
            )}
          >
            My Courses
          </div>
        </div>

        {activeTab === "my-documents" && (
          <div className="space-y-6 w-full">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recently Viewed</h2>
            </div>

            {Object.entries(groupedByDate).map(([date, items]) => (
              <div key={date} className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">
                  {/* {date} */}
                </h3>
                <div className="grid gap-4 md:grid-cols-4">
                  {items
                    .filter((item) => item.type === "document")
                    .map((item) => (
                      <FlashcardItem key={item.id} item={item} />
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "my-courses" && (
          <div className="space-y-6 w-full">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">My Courses</h2>
            </div>

            {mockFlashcards.filter((item) => item.type === "course").length >
              0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Library
                </h3>
                <div className="grid gap-4 md:grid-cols-4 w-full">
                  {mockFlashcards
                    .filter((item) => item.type === "course")
                    .map((item) => (
                      <FlashcardItem key={item.id} item={item} />
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function FlashcardItem({ item }: { item: FlashcardItem }) {
  return (
    <Card
      className={`relative ${item.color} border-t-4 shadow-sm transition-shadow hover:shadow-md`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded bg-black/5 p-2">
              {item.type === "course" ? (
                <BookOpen className="h-4 w-4" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
            </div>
            <Badge variant="secondary" className="text-xs">
              {item.subject}
            </Badge>
          </div>
          <button className=" cursor-pointer rounded-full bg-transparent p-0">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <CardTitle className="text-base font-semibold">
            {item.title}
          </CardTitle>
          <p className="text-xs text-muted-foreground">{item.date}</p>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="h-3 w-3" />
          <span>
            {item.participants} participant{item.participants !== 1 ? "s" : ""}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function CreateCourseForm({ onClose }: { onClose: () => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="course-name">Course Name</Label>
        <Input id="course-name" placeholder="Enter course name..." />
      </div>

      <div className="space-y-2">
        <Label htmlFor="course-description">Description</Label>
        <Textarea
          id="course-description"
          placeholder="Course description..."
          className="min-h-[80px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="course-subject">Subject</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="party-history">Party History</SelectItem>
            <SelectItem value="aesthetics">Aesthetics</SelectItem>
            <SelectItem value="english">Beginner English</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="academic-year">Academic Year</Label>
        <Input id="academic-year" placeholder="e.g., 2024-2025" />
      </div>

      <div className="flex items-center space-x-2">
        <Switch id="add-participants" />
        <Label htmlFor="add-participants">Add participants</Label>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onClose}>Create Course</Button>
      </div>
    </div>
  );
}

function CreateDocumentForm({ onClose }: { onClose: () => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="document-title">Document Title</Label>
        <Input id="document-title" placeholder="Enter document title..." />
      </div>

      <div className="space-y-2">
        <Label htmlFor="document-description">Description</Label>
        <Textarea
          id="document-description"
          placeholder="Document description..."
          className="min-h-[80px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="document-subject">Subject</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="party-history">Party History</SelectItem>
            <SelectItem value="aesthetics">Aesthetics</SelectItem>
            <SelectItem value="english">Beginner English</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <Label>Formatting Options</Label>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <span className="font-bold">B</span>
          </Button>
          <Button variant="outline" size="sm">
            <span className="italic">I</span>
          </Button>
          <Button variant="outline" size="sm">
            <span className="underline">U</span>
          </Button>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onClose}>Create Document</Button>
      </div>
    </div>
  );
}
