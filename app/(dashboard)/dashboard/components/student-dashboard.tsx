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

import {
  TrendingUp,
  ChevronRight,
  Users,
  Quote,
  Search,
  MoreHorizontal,
  Plus,
  ChevronDown,
  Loader,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { OverviewEventCalendar } from "./overview-events";

import { RiTaskLine } from "react-icons/ri";

import { ChartConfig } from "@/components/ui/chart";
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
import { ModeToggle } from "@/components/mode-toggle";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import ChartSkeleton from "@/components/loader";

export const data = [
  {
    revenue: 10400,
    subscription: 40,
  },
  {
    revenue: 14405,
    subscription: 90,
  },
  {
    revenue: 9400,
    subscription: 200,
  },
  {
    revenue: 8200,
    subscription: 278,
  },
  {
    revenue: 7000,
    subscription: 89,
  },
  {
    revenue: 9600,
    subscription: 239,
  },
  {
    revenue: 11244,
    subscription: 78,
  },
  {
    revenue: 26475,
    subscription: 89,
  },
];

export function StudentDashboard() {
  const recentFlashcards = [
    { subject: "Biology", count: 24, mastered: 18 },
    { subject: "Chemistry", count: 32, mastered: 20 },
    { subject: "Physics", count: 28, mastered: 25 },
  ];

  const inspirationalQuotes = [
    {
      text: "The expert in anything was once a beginner.",
      author: "Helen Hayes",
    },
    {
      text: "Education is the most powerful weapon which you can use to change the world.",
      author: "Nelson Mandela",
    },
    {
      text: "The beautiful thing about learning is that no one can take it away from you.",
      author: "B.B. King",
    },
    {
      text: "Success is the sum of small efforts repeated day in and day out.",
      author: "Robert Collier",
    },
  ];

  return (
    <div className="min-h-screen max-w-7xl p-4 mx-auto w-full flex flex-col gap-8">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div>
          <h4 className="text-2xl md:text-3xl lg:text-4xl font-bold">
            Hello Daniel!
          </h4>
          <ModeToggle />
        </div>
        <div className="flex gap-4 items-center flex-wrap">
          <div className="flex gap-2 bg-card rounded-3xl flex-1 items-center p-1 px-4">
            <CiSearch className="h-5 w-5 stroke-1" />
            <Input
              className="bg-transparent min-w-[250px] border-none shadow-none"
              placeholder="Search"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="rounded-3xl">
                Create
                <Plus className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Create</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                Pomodoro <GoStopwatch className="h-4 w-4 ml-auto" />
              </DropdownMenuItem>
              <DropdownMenuItem>
                Task
                <RiTaskLine className="h-4 w-4 ml-auto" />
              </DropdownMenuItem>
              <DropdownMenuItem>
                Event
                <LuCalendarCheck2 className="h-4 w-4 ml-auto" />
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
            <Card className="">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Current GPA</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold ">3.84</span>
                  <span className="text-sm text-black/80 font-medium">
                    +0.12
                  </span>
                </div>
                <Progress value={84} className="mt-3 h-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  Target: 3.9
                </p>
              </CardContent>
              <CardFooter>
                <Button className="rounded-3xl">
                  Quick Calculate
                  <GoArrowUpRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
            <TodayChartsView />
            <QuoteCard />
          </div>

          {/* Study Analytics */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Study Analytics
              </CardTitle>
              <Button variant="ghost" size="sm">
                View Details <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-7 gap-2">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                    (day, index) => (
                      <div key={day} className="text-center">
                        <p className="text-xs text-muted-foreground mb-2">
                          {day}
                        </p>
                        <div
                          className="bg-primary/20 rounded-sm mx-auto"
                          style={{
                            height: `${Math.random() * 40 + 20}px`,
                            width: "100%",
                          }}
                        />
                      </div>
                    )
                  )}
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    This week: 28.5 hours
                  </span>
                  <span className="text-muted-foreground font-medium">
                    +15% from last week
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Flashcards Progress */}
          <Card className="bg-transparent border-0 shadow-none border-none">
            <CardHeader className="flex flex-row items-center p-0 justify-between">
              <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
                Progress
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-sm">
                View All
                <GoArrowUpRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentFlashcards.map((flashcard, index) => (
                  <div
                    key={index}
                    className="flex flex-col bg-card rounded-sm "
                  >
                    <div className="flex justify-between gap-4">
                      <div className="pt-4 pl-4">
                        <h4>{flashcard.subject}</h4>
                      </div>
                      <div>
                        <Button
                          size={"icon"}
                          className="rounded-none bg-gradient-to-br from-blue-50 to-red-50"
                        >
                          <MoreHorizontal className="h-4 text-black w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between w-full  gap-4 p-4">
                      <div>
                        <p className="text-sm">Progress</p>
                      </div>
                      <div>
                        <h6 className="text-sm">
                          <span className="text-2xl">{flashcard.mastered}</span>
                          /{flashcard.count}
                        </h6>
                      </div>
                    </div>
                    <div className="w-full grid grid-cols-10 gap-2 px-4">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item, i) => (
                        <div
                          key={i}
                          className={cn(
                            "h-10 w-full rounded",
                            item * 4 < flashcard.mastered
                              ? "bg-primary/50"
                              : "bg-[#ddd] "
                          )}
                        ></div>
                      ))}
                    </div>
                    <div className="flex justify-between w-full  gap-4 mt-2 p-4">
                      <div></div>
                      <div className="flex gap-1 bg-[#ddd] dark:bg-neutral-700 p-2 rounded">
                        <IoFlagSharp className="h-4 w-4 mr-1" />
                        <p className="text-xs">June 12, 2025</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <StudyResourcesSection />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-4">
          <AISuggestionsCard />
          <OverviewEventCalendar />

          <Card>
            <CardHeader className="flex-row flex gap-2 items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Users className="h-5 w-5 text-primary" />
                Study Groups
              </CardTitle>
              <Button size={"icon"}>
                <Plus className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: "Calculus Study Group", members: 8, next: "Today 3PM" },
                {
                  name: "Chemistry Lab Prep",
                  members: 5,
                  next: "Tomorrow 2PM",
                },
              ].map((group, index) => (
                <div key={index} className="p-3 bg-card rounded-lg border">
                  <p className="font-medium text-sm">{group.name}</p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-foreground">
                      {group.members} members
                    </span>
                    <span className="text-xs text-foreground font-medium">
                      {group.next}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
