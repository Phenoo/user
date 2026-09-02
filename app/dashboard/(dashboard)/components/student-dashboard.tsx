"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { IoFlagSharp } from "react-icons/io5";

import { GoArrowUpRight, GoStopwatch } from "react-icons/go";
import { LuCalendarCheck2 } from "react-icons/lu";
import { CiSearch } from "react-icons/ci";
import { CgTranscript } from "react-icons/cg";

import {
  TrendingUp,
  ChevronRight,
  Users,
  MoreHorizontal,
  Plus,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { OverviewEventCalendar } from "./overview-events";

import { RiTaskLine } from "react-icons/ri";

import { cn } from "@/lib/utils";
import QuoteCard from "./quote-card";
import { TodayChartsView } from "./today-tasks";
import AISuggestionsCard from "./AISuggestionsCard";
import StudyResourcesSection from "./StudyResourcesSection";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import LoadingComponent from "@/components/loader";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import NewStudyGroup from "../study-groups/_components/new-study-group";
import CpaCard from "./cpa-card";
import { GoogleMeetIntegration } from "@/components/google-meeting-integration";
import { useAuthToken } from "@convex-dev/auth/react";
import { SearchDashboard } from "./search-dashboard";
import { StudyAnalytics } from "../pomodoro/_components/study-analytics";
import { useEffect, useState } from "react";
import QuickAccessHub from "./quick-access-hub";

function CourseProgressItem({
  course,
  userId,
  router,
}: {
  course: any;
  userId: Id<"users">;
  router: any;
}) {
  const decks =
    useQuery(api.flashcards.getUserDecksByCourseId, {
      courseId: course._id,
      userId,
    }) || [];

  let totalCards = 0;
  let masteredCards = 0;

  decks.forEach((deck) => {
    totalCards += deck.totalCards || 0;
    masteredCards += deck.masteredCards || 0;
  });

  const progressRatio = totalCards > 0 ? masteredCards / totalCards : 0;
  const filledBars = Math.round(progressRatio * 10);

  return (
    <div className="flex flex-col bg-card rounded border p-4">
      <div className="flex justify-between gap-4 items-center">
        <div>
          <h4 className="font-semibold text-sm">{course.name}</h4>
          <span className="text-xs text-muted-foreground">{course.code}</span>
        </div>
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size={"icon"} variant="ghost" className="h-8 w-8">
                <MoreHorizontal className="h-4 text-foreground w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/dashboard/courses/course/${course._id}`)
                }
              >
                View Course
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/dashboard/flashcards?course=${course._id}`)
                }
              >
                Study Flashcards
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="flex justify-between w-full items-center mt-3 mb-2">
        <p className="text-xs text-muted-foreground">Progress</p>
        <h6 className="text-xs font-semibold">
          <span className="text-base font-bold">{masteredCards}</span>/{totalCards}
        </h6>
      </div>
      <div className="w-full grid grid-cols-10 gap-1">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
          <div
            key={item}
            className={cn(
              "h-8 w-full rounded-sm transition-colors",
              item <= filledBars ? "bg-primary" : "bg-muted"
            )}
          />
        ))}
      </div>
    </div>
  );
}

export function StudentDashboard() {
  const user = useQuery(api.users.currentUser);
  const router = useRouter();
  const token = useAuthToken();
  const [open, setOpen] = useState(false);

  const getProfile = useAction(api.users.getUserProfile);

  const weeklyStats = useQuery(api.sessions.getWeeklyStats, {
    userId: user?._id as Id<"users">,
  });

  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFetchProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const userProfile = await getProfile();
      setProfile(userProfile);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle the OAuth redirect result without exposing the server-side token.
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const googleConnected = urlParams.get("connected");
    const error = urlParams.get("error");

    if (googleConnected || error) {
      urlParams.delete("connected");
      urlParams.delete("status");
      urlParams.delete("error");
      urlParams.delete("integration");
      const query = urlParams.toString();
      window.history.replaceState(
        {},
        document.title,
        `${window.location.pathname}${query ? `?${query}` : ""}`
      );
    }

    if (error) {
      let errorMessage = "Failed to connect Google account";
      if (error === "no_code") {
        errorMessage = "Authorization code not received from Google";
      } else if (error === "callback_error" || error === "callback_processing_error") {
        errorMessage = "Error processing Google authorization";
      } else if (error === "insufficient_google_permissions") {
        errorMessage = "Google did not grant all required permissions";
      } else if (error === "oauth_user_mismatch") {
        errorMessage = "Your signed-in account changed during Google authorization";
      }
      alert(errorMessage);
    }
  }, []);

  // Keyboard shortcut listener (Cmd+K / Ctrl+K for search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev: boolean) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const userId = user?._id;

  const getStudyGroups = useQuery(api.studyGroups.getUserStudyGroups, {
    userId: userId as Id<"users">,
  });

  const courses =
    useQuery(api.courses.getAllCourses, {
      userId: user?._id as Id<"users">,
    }) || [];

  if (user === undefined) {
    return (
      <div className="min-h-screen max-w-7xl p-4 mx-auto w-full flex flex-col gap-8">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-44 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-36 w-full rounded-xl" />
              <Skeleton className="h-36 w-full rounded-xl" />
            </div>
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen max-w-7xl p-4 mx-auto w-full flex flex-col gap-8">
        <div className="flex flex-col md:flex-row gap-4 justify-between ">
          <div>
            <h4 className="text-2xl md:text-3xl lg:text-4xl font-bold">
              Hello {user?.name ? `, ${user.name}` : ""}!
            </h4>
          </div>
          <div className="flex gap-4 items-center flex-wrap">
            <button
              type="button"
              aria-label="Open search dialog (Command K)"
              className="flex gap-2 bg-card border rounded-3xl flex-1 items-center p-2.5 px-4 cursor-pointer hover:border-primary/50 transition-colors text-left"
              onClick={() => setOpen(true)}
            >
              <CiSearch className="h-5 w-5 stroke-1 text-muted-foreground" />
              <span className="min-w-[180px] sm:min-w-[220px] text-sm text-muted-foreground">
                Search tools, courses, tasks...
              </span>
              <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground ml-auto">
                ⌘K
              </kbd>
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="rounded-3xl gap-1.5" aria-label="Create new item">
                  Create
                  <Plus className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Quick Create</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard/pomodoro")}
                >
                  Pomodoro <GoStopwatch className="h-4 w-4 ml-auto text-rose-500" />
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard/tasks")}
                >
                  Task <RiTaskLine className="h-4 w-4 ml-auto text-blue-500" />
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard/flashcards")}
                >
                  Flashcard Deck <CgTranscript className="h-4 w-4 ml-auto text-amber-500" />
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard/schedule")}
                >
                  Event <LuCalendarCheck2 className="h-4 w-4 ml-auto text-emerald-500" />
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard/study-groups")}
                >
                  Study Group <Users className="h-4 w-4 ml-auto text-purple-500" />
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard/transcript")}
                >
                  Transcript <CgTranscript className="h-4 w-4 ml-auto text-cyan-500" />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <CpaCard />
              <TodayChartsView />
              <QuoteCard />
            </div>

            {/* Study Analytics */}
            {weeklyStats && (
              <StudyAnalytics
                totalHours={weeklyStats.totalHours}
                percentageChange={15}
                dailyHours={weeklyStats.dailyHours}
              />
            )}
            {/* Flashcards Progress */}

            <QuickAccessHub />

               <Card className="bg-transparent border-0 shadow-none border-none">
              <CardHeader className="flex flex-row items-center p-0 justify-between">
                <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
                  Progress
                </CardTitle>
                <Link href={"/dashboard/courses"}>
                  <Button variant="ghost" size="sm" className="text-sm">
                    View All
                    <GoArrowUpRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                {courses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {courses
                      .filter((_, i) => i < 3)
                      .map((course) => (
                        <CourseProgressItem
                          key={course._id}
                          course={course}
                          userId={user?._id as Id<"users">}
                          router={router}
                        />
                      ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-muted-foreground text-sm border rounded-lg">
                    No courses added yet. Add your first course to track progress!
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-4">
            <AISuggestionsCard />
            <OverviewEventCalendar />
            <Card>
              <CardHeader className="flex-row flex gap-2 items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  Study Groups
                </CardTitle>
                <NewStudyGroup title={false} />
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {getStudyGroups && getStudyGroups.length ? (
                  getStudyGroups
                    .filter((_, i) => i < 3)
                    .map((group, index) => (
                      <Link
                        key={index}
                        href={`/dashboard/study-groups/${group._id}`}
                        className=""
                      >
                        <div className="p-3 bg-card rounded-lg border">
                          <p className="font-medium text-sm">{group.name}</p>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-foreground">
                              {group.currentMembers} members
                            </span>
                            <span className="text-xs text-foreground font-medium">
                              {group.meetingSchedule}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))
                ) : (
                  <div className="py-4">
                    <p className="text-sm">No study groups found</p>
                  </div>
                )}

                <Link href={"/dashboard/study-groups"}>
                  <Button>View all</Button>
                </Link>
              </CardContent>
            </Card>
            <GoogleMeetIntegration />
          </div>
        </div>
      </div>

      <SearchDashboard open={open} setOpen={setOpen} />
    </>
  );
}
