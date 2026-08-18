"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Timer,
  Calculator,
  CheckSquare,
  Users,
  MessageSquare,
  ArrowUpRight,
  BookOpen,
  Sparkles,
} from "lucide-react";

interface QuickTool {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: string;
  color: string;
  bgColor: string;
}

const quickTools: QuickTool[] = [
  {
    id: "flashcards",
    name: "Flashcards & Decks",
    description: "Review smart flashcards and study sets",
    href: "/dashboard/flashcards",
    icon: Brain,
    badge: "Study",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10 border-amber-500/20",
  },
  {
    id: "pomodoro",
    name: "Pomodoro Timer",
    description: "Start focused study sessions with timers",
    href: "/dashboard/pomodoro",
    icon: Timer,
    badge: "Focus",
    color: "text-rose-500",
    bgColor: "bg-rose-500/10 border-rose-500/20",
  },
  {
    id: "quick-calculate",
    name: "GPA & Target Calculator",
    description: "Calculate current GPA and target grades",
    href: "/dashboard/quick-calculate",
    icon: Calculator,
    badge: "Grades",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    id: "tasks",
    name: "Tasks & Assignments",
    description: "Track deadlines, homework, and to-dos",
    href: "/dashboard/tasks",
    icon: CheckSquare,
    badge: "Planner",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10 border-blue-500/20",
  },
  {
    id: "study-groups",
    name: "Study Groups & Meet",
    description: "Join group video calls & study sessions",
    href: "/dashboard/study-groups",
    icon: Users,
    badge: "Collaborate",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10 border-purple-500/20",
  },
  {
    id: "ai-chat",
    name: "AI Study Assistant",
    description: "Ask questions, generate notes & summaries",
    href: "/dashboard/chat",
    icon: MessageSquare,
    badge: "AI Powered",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10 border-cyan-500/20",
  },
];

export function QuickAccessHub() {
  return (
    <section
      aria-label="Quick Access Study Tools"
      className="space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg md:text-xl lg:text-2xl font-semibold tracking-tight">
            Quick Tools Hub
          </h3>
        </div>
        <span className="text-xs text-muted-foreground hidden sm:inline-block">
          Press <kbd className="px-1.5 py-0.5 text-[10px] font-semibold bg-muted rounded border shadow-sm">⌘K</kbd> or <kbd className="px-1.5 py-0.5 text-[10px] font-semibold bg-muted rounded border shadow-sm">Ctrl+K</kbd> to search tools anytime
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.id}
              href={tool.href}
              aria-label={`Open ${tool.name}: ${tool.description}`}
              className="group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-xl transition-all"
            >
              <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-primary/50 group-hover:-translate-y-0.5 cursor-pointer bg-card/60 backdrop-blur-sm">
                <CardContent className="p-3.5 flex flex-col justify-between h-full space-y-3">
                  <div className="flex items-start justify-between">
                    <div
                      className={`p-2 rounded-lg border ${tool.bgColor} transition-colors`}
                    >
                      <Icon className={`h-5 w-5 ${tool.color}`} />
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0 font-medium group-hover:border-primary/40"
                    >
                      {tool.badge}
                    </Badge>
                  </div>

                  <div>
                    <h4 className="font-medium text-xs sm:text-sm line-clamp-1 group-hover:text-primary transition-colors flex items-center justify-between">
                      <span>{tool.name}</span>
                      <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-primary shrink-0" />
                    </h4>
                    <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5 hidden sm:block">
                      {tool.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default QuickAccessHub;
