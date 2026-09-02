"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Sparkles,
  BarChart3,
  CreditCard,
  BookOpen,
  Brain,
  Timer,
  TrendingUp,
  Settings,
  Users,
  Trophy,
  CheckSquare,
  FileText,
  Layers,
  GraduationCap,
} from "lucide-react";

export function SearchDashboard({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = React.useState("");

  const user = useQuery(api.users.currentUser);
  const userId = user?._id;

  const courses =
    useQuery(api.courses.getAllCourses, userId ? { userId } : "skip") || [];
  const decks =
    useQuery(api.flashcards.getUserDecks, userId ? { userId } : "skip") || [];
  const searchResults = useQuery(
    api.search.global,
    searchTerm.trim().length >= 2
      ? { search: searchTerm.trim(), limit: 20 }
      : "skip"
  );

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((current) => !current);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [setOpen]);

  const handleSelect = (callback: () => void) => {
    setOpen(false);
    callback();
  };

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          value={searchTerm}
          onValueChange={setSearchTerm}
          placeholder="Search courses, tasks, documents, and flashcards..."
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {!!searchResults?.length && (
            <>
              <CommandGroup heading="Your study content">
                {searchResults.map((result) => (
                  <CommandItem
                    key={`${result.type}:${result.id}`}
                    value={`${result.title} ${result.subtitle}`}
                    onSelect={() =>
                      handleSelect(() => router.push(result.href))
                    }
                  >
                    {result.type === "course" ? (
                      <BookOpen className="mr-2 h-4 w-4" />
                    ) : result.type === "deck" || result.type === "flashcard" ? (
                      <Brain className="mr-2 h-4 w-4" />
                    ) : result.type === "task" || result.type === "assignment" ? (
                      <CheckSquare className="mr-2 h-4 w-4" />
                    ) : (
                      <FileText className="mr-2 h-4 w-4" />
                    )}
                    <span className="min-w-0">
                      <span className="block truncate">{result.title}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {result.subtitle}
                      </span>
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

          <CommandGroup heading="AI Suggestions">
            <CommandItem
              onSelect={() =>
                handleSelect(() => router.push("/dashboard/flashcards?ai=true"))
              }
            >
              <Sparkles className="mr-2 h-4 w-4" />
              <span>Generate Flashcards with AI</span>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                handleSelect(() => router.push("/dashboard/ai-suggestions"))
              }
            >
              <Sparkles className="mr-2 h-4 w-4" />
              <span>AI Study Recommendations</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Analytics">
            <CommandItem
              onSelect={() =>
                handleSelect(() => router.push("/dashboard/analytics"))
              }
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              <span>Study Analytics</span>
            </CommandItem>

            <CommandItem
              onSelect={() =>
                handleSelect(() => router.push("/dashboard/semester-analysis"))
              }
            >
              <GraduationCap className="mr-2 h-4 w-4" />
              <span>Semester Analysis</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Courses">
            <CommandItem
              onSelect={() =>
                handleSelect(() => router.push("/dashboard/courses"))
              }
            >
              <BookOpen className="mr-2 h-4 w-4" />
              <span>All Courses</span>
            </CommandItem>

            {courses.length > 0 && (
              <>
                <CommandSeparator />
                {courses.slice(0, 5).map((course) => (
                  <CommandItem
                    key={course._id}
                    onSelect={() =>
                      handleSelect(() =>
                        router.push(`/dashboard/courses/course/${course._id}`)
                      )
                    }
                  >
                    <BookOpen className="mr-2 h-4 w-4 opacity-50" />
                    <span className="ml-2">{course.name}</span>
                  </CommandItem>
                ))}
              </>
            )}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Flashcards">
            <CommandItem
              onSelect={() =>
                handleSelect(() => router.push("/dashboard/flashcards"))
              }
            >
              <Brain className="mr-2 h-4 w-4" />
              <span>All Flashcard Decks</span>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                handleSelect(() =>
                  router.push("/dashboard/flashcards?mode=study")
                )
              }
            >
              <Brain className="mr-2 h-4 w-4" />
              <span>Start Study Session</span>
            </CommandItem>
            {decks.length > 0 && (
              <>
                <CommandSeparator />
                {decks.slice(0, 5).map((deck) => (
                  <CommandItem
                    key={deck._id}
                    onSelect={() =>
                      handleSelect(() =>
                        router.push(`/dashboard/flashcards/${deck._id}`)
                      )
                    }
                  >
                    <Brain className="mr-2 h-4 w-4 opacity-50" />
                    <span className="ml-2">{deck.name}</span>
                  </CommandItem>
                ))}
              </>
            )}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Study Tools">
            <CommandItem
              onSelect={() =>
                handleSelect(() => router.push("/dashboard/pomodoro"))
              }
            >
              <Timer className="mr-2 h-4 w-4" />
              <span>Pomodoro Timer</span>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                handleSelect(() => router.push("/dashboard/tasks"))
              }
            >
              <CheckSquare className="mr-2 h-4 w-4" />
              <span>Task Manager</span>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                handleSelect(() => router.push("/dashboard/transcript"))
              }
            >
              <FileText className="mr-2 h-4 w-4" />
              <span>Lecture Transcripts</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Community">
            <CommandItem
              onSelect={() =>
                handleSelect(() => router.push("/dashboard/study-groups"))
              }
            >
              <Users className="mr-2 h-4 w-4" />
              <span>Study Groups</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Settings">
            <CommandItem
              onSelect={() =>
                handleSelect(() => router.push("/dashboard/settings"))
              }
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>General Settings</span>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                handleSelect(() =>
                  router.push("/dashboard/settings?section=billing")
                )
              }
            >
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Billing & Subscription</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
