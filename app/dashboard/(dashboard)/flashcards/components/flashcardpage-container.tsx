"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Check,
  Clock3,
  Filter,
  Library,
  Plus,
  Search,
  Sparkles,
  Target,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import CoursesSelect from "@/components/courses-select";
import { AIFlashcardGeneratorSheet } from "./ai-flashcard-generator-sheet";

export const cardColors = [
  { bg: "bg-[#f47b57]", border: "border-t-[#f47b57]" },
  { bg: "bg-[#7c6cf2]", border: "border-t-[#7c6cf2]" },
  { bg: "bg-[#2fb7a7]", border: "border-t-[#2fb7a7]" },
  { bg: "bg-[#eabf4a]", border: "border-t-[#eabf4a]" },
  { bg: "bg-[#4e91d9]", border: "border-t-[#4e91d9]" },
];

const colorValues = ["border-t-[#f47b57]", "border-t-[#7c6cf2]", "border-t-[#2fb7a7]", "border-t-[#eabf4a]", "border-t-[#4e91d9]"];

export default function FlashcardsPageContainer() {
  const searchParams = useSearchParams();
  const defaultCourseId = searchParams.get("course") || "";
  const user = useQuery(api.users.currentUser);
  const overview = useQuery(api.flashcards.getFlashcardOverview, user ? {} : "skip");
  const courses = useQuery(api.courses.getAllCourses, user?._id ? { userId: user._id } : "skip") || [];
  const createDeckMutation = useMutation(api.flashcards.createDeck);

  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newDeck, setNewDeck] = useState({ name: "", description: "", courseId: defaultCourseId, difficulty: "Medium" as const, color: colorValues[0] });

  const decks = useMemo(() => overview?.decks || [], [overview]);
  const filteredDecks = useMemo(() => decks.filter((deck) => {
    const query = search.toLowerCase();
    const matchesSearch = !query || deck.name.toLowerCase().includes(query) || deck.subject.toLowerCase().includes(query) || deck.description.toLowerCase().includes(query);
    const matchesCourse = courseFilter === "all" || deck.courseId === courseFilter;
    return matchesSearch && matchesCourse;
  }), [courseFilter, decks, search]);

  if (user === undefined || (user && overview === undefined)) {
    return <div className="min-h-screen bg-background p-6"><div className="mx-auto max-w-6xl space-y-6"><Skeleton className="h-12 w-72" /><Skeleton className="h-40 w-full rounded-3xl" /><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((item) => <Skeleton key={item} className="h-52 rounded-2xl" />)}</div></div></div>;
  }

  const summary = overview?.summary || { total: 0, due: 0, learning: 0, mature: 0, reviews: 0 };
  const firstDueDeck = decks.find((deck) => deck.stats.due > 0);
  const createDeck = async () => {
    if (!user?._id || !newDeck.name.trim() || !newDeck.courseId) {
      toast.error("Add a deck name and course first.");
      return;
    }
    try {
      await createDeckMutation({ userId: user._id, createdBy: user._id, name: newDeck.name, description: newDeck.description, courseId: newDeck.courseId as Id<"courses">, difficulty: newDeck.difficulty, color: newDeck.color, isPublic: false, tags: [] });
      toast.success("Deck created. Add your first card when you’re ready.");
      setNewDeck({ name: "", description: "", courseId: defaultCourseId, difficulty: "Medium", color: colorValues[0] });
      setIsCreateOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create deck");
    }
  };

  return (
    <main className="min-h-screen bg-[#fbfaf8] px-4 py-6 text-foreground dark:bg-background sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-primary"><Brain className="h-4 w-4" /> Learning studio</div>
            <h1 className="text-4xl font-semibold tracking-tight">Review smarter. Remember longer.</h1>
            <p className="mt-2 max-w-xl text-muted-foreground">A calm place to turn course material into durable memory, one focused review at a time.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <AIFlashcardGeneratorSheet defaultCourseId={defaultCourseId} trigger={<Button className="gap-2 rounded-full px-5"><Sparkles className="h-4 w-4" /> Create with AI</Button>} />
            <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <SheetTrigger asChild><Button variant="outline" className="gap-2 rounded-full px-5"><Plus className="h-4 w-4" /> New deck</Button></SheetTrigger>
              <SheetContent className="w-full sm:max-w-lg">
                <SheetHeader><SheetTitle>Create a deck</SheetTitle></SheetHeader>
                <div className="space-y-5 p-4">
                  <div className="space-y-2"><Label htmlFor="deck-name">Deck name</Label><Input id="deck-name" value={newDeck.name} onChange={(event) => setNewDeck({ ...newDeck, name: event.target.value })} placeholder="e.g. Queueing theory — exam review" /></div>
                  <div className="space-y-2"><Label htmlFor="deck-description">Description <span className="font-normal text-muted-foreground">(optional)</span></Label><Textarea id="deck-description" value={newDeck.description} onChange={(event) => setNewDeck({ ...newDeck, description: event.target.value })} placeholder="What will this deck help you remember?" /></div>
                  <div className="space-y-2"><Label>Course</Label><CoursesSelect course={newDeck.courseId} onChange={(courseId) => setNewDeck({ ...newDeck, courseId })} /></div>
                  <div className="space-y-2"><Label>Accent</Label><div className="flex gap-3">{cardColors.map((color) => <button key={color.border} type="button" aria-label={`Use ${color.bg} accent`} onClick={() => setNewDeck({ ...newDeck, color: color.border })} className={`h-8 w-8 rounded-full ${color.bg} ${newDeck.color === color.border ? "ring-2 ring-foreground ring-offset-2" : ""}`} />)}</div></div>
                  <Button className="w-full rounded-full" onClick={createDeck}><Check className="mr-2 h-4 w-4" /> Create deck</Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr]">
          <Card className="overflow-hidden rounded-3xl border-0 bg-[#181818] text-white shadow-xl shadow-black/10">
            <CardContent className="flex h-full flex-col justify-between gap-8 p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4"><div><p className="text-sm text-white/60">Your next best action</p><h2 className="mt-2 text-3xl font-semibold tracking-tight">{summary.due ? `${summary.due} cards due` : "You’re caught up"}</h2><p className="mt-2 text-white/65">{summary.due ? `About ${Math.max(1, Math.round(summary.due * 0.5))} minutes of focused review.` : "Your next reviews will appear here when they’re ready."}</p></div><div className="rounded-2xl bg-white/10 p-3"><Target className="h-6 w-6 text-[#f4c95d]" /></div></div>
              {firstDueDeck ? <Link href={`/dashboard/flashcards/${firstDueDeck._id}?mode=due`}><Button className="w-fit rounded-full bg-white px-5 text-black hover:bg-white/90">Start review <ArrowRight className="ml-2 h-4 w-4" /></Button></Link> : <Button disabled className="w-fit rounded-full bg-white/10 text-white/50">Nothing due right now</Button>}
            </CardContent>
          </Card>
          <StatCard icon={<Clock3 className="h-5 w-5" />} label="Learning" value={summary.learning} detail="still taking shape" />
          <StatCard icon={<Library className="h-5 w-5" />} label="Mature cards" value={summary.mature} detail={`${summary.total} total cards`} />
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-2xl font-semibold tracking-tight">Your library</h2><p className="text-sm text-muted-foreground">Keep each deck close to the course it belongs to.</p></div><div className="flex flex-wrap gap-2"><div className="relative min-w-52 flex-1 sm:flex-none"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search decks" className="rounded-full pl-9" /></div><div className="flex items-center gap-2 rounded-full border bg-background px-3"><Filter className="h-4 w-4 text-muted-foreground" /><select aria-label="Filter decks by course" className="h-9 bg-transparent text-sm outline-none" value={courseFilter} onChange={(event) => setCourseFilter(event.target.value)}><option value="all">All courses</option>{courses.map((course) => <option key={course._id} value={course._id}>{course.code}</option>)}</select></div></div></div>
          {filteredDecks.length ? <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{filteredDecks.map((deck) => <Link key={deck._id} href={`/dashboard/flashcards/${deck._id}`}><Card className={`group h-full rounded-2xl border-t-4 ${deck.color || "border-t-primary"} transition-all hover:-translate-y-0.5 hover:shadow-lg`}><CardHeader className="pb-3"><div className="flex items-start justify-between gap-3"><Badge variant="secondary" className="rounded-full">{deck.subject}</Badge>{deck.stats.due > 0 && <Badge className="rounded-full bg-[#f8e8d7] text-[#9a4d2b] hover:bg-[#f8e8d7]">{deck.stats.due} due</Badge>}</div><CardTitle className="pt-2 text-xl">{deck.name}</CardTitle><p className="line-clamp-2 text-sm text-muted-foreground">{deck.description || "A focused deck for active recall."}</p></CardHeader><CardContent><div className="mb-4 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${deck.stats.total ? Math.min(100, (deck.stats.mature / deck.stats.total) * 100) : 0}%` }} /></div><div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground"><span><strong className="block text-sm text-foreground">{deck.stats.total}</strong>cards</span><span><strong className="block text-sm text-foreground">{deck.stats.learning}</strong>learning</span><span><strong className="block text-sm text-foreground">{deck.stats.mature}</strong>mature</span></div><div className="mt-5 flex items-center justify-between text-sm font-medium text-primary">Open deck <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></div></CardContent></Card></Link>)}</div> : <Card className="rounded-3xl border-dashed"><CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center"><div className="mb-5 rounded-2xl bg-primary/10 p-4 text-primary"><BookOpen className="h-8 w-8" /></div><h3 className="text-xl font-semibold">Turn your course material into something you’ll remember.</h3><p className="mt-2 max-w-md text-sm text-muted-foreground">Start with a small deck from your notes, then let adaptive reviews do the timing.</p><div className="mt-6 flex flex-wrap justify-center gap-2"><AIFlashcardGeneratorSheet trigger={<Button className="rounded-full"><Sparkles className="mr-2 h-4 w-4" /> Generate with AI</Button>} /><Button variant="outline" className="rounded-full" onClick={() => setIsCreateOpen(true)}><Plus className="mr-2 h-4 w-4" /> Create manually</Button></div></CardContent></Card>}
        </section>
      </div>
    </main>
  );
}

function StatCard({ icon, label, value, detail }: { icon: ReactNode; label: string; value: number; detail: string }) {
  return <Card className="rounded-3xl border bg-white/70 dark:bg-card"><CardContent className="flex h-full flex-col justify-between gap-8 p-6"><div className="flex items-center justify-between"><span className="text-sm font-medium text-muted-foreground">{label}</span><span className="rounded-xl bg-primary/10 p-2 text-primary">{icon}</span></div><div><p className="text-4xl font-semibold tracking-tight">{value}</p><p className="mt-1 text-sm text-muted-foreground">{detail}</p></div></CardContent></Card>;
}
