"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
  Edit3,
  Flag,
  Keyboard,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Target,
  Trophy,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { AIFlashcardGeneratorSheet } from "../components/ai-flashcard-generator-sheet";

type Rating = "again" | "hard" | "good" | "easy";
type StudyMode = "due" | "all" | "learning" | "cram";

const ratingMeta: Record<Rating, { label: string; hint: string; color: string; shortcut: string }> = {
  again: { label: "Again", hint: "Need another look", color: "border-[#e58270] bg-[#fff3f0] text-[#a64432]", shortcut: "1" },
  hard: { label: "Hard", hint: "Took real effort", color: "border-[#e3b46c] bg-[#fff8e9] text-[#8e5b19]", shortcut: "2" },
  good: { label: "Good", hint: "Solid recall", color: "border-[#83c9b7] bg-[#effaf6] text-[#20725f]", shortcut: "3" },
  easy: { label: "Easy", hint: "Immediate recall", color: "border-[#93b8e5] bg-[#f0f6ff] text-[#2b5d9c]", shortcut: "4" },
};

export default function DeckPage({ params }: { params: Promise<{ deckId: Id<"flashcardDecks"> }> }) {
  const { deckId } = use(params);
  const user = useQuery(api.users.currentUser);
  const deck = useQuery(api.flashcards.getDeck, user ? { deckId } : "skip");
  const cards = useQuery(api.flashcards.getDeckCards, user ? { deckId } : "skip");
  const createCardMutation = useMutation(api.flashcards.createFlashcard);
  const createSessionMutation = useMutation(api.flashcards.createStudySession);
  const reviewCardMutation = useMutation(api.flashcards.reviewCard);
  const endSessionMutation = useMutation(api.flashcards.endStudySession);
  const toggleSuspendMutation = useMutation(api.flashcards.toggleSuspendCard);
  const deleteDeckMutation = useMutation(api.flashcards.deleteDeck);

  const [activeTab, setActiveTab] = useState<"cards" | "analytics" | "settings">("cards");
  const [search, setSearch] = useState("");
  const [studyMode, setStudyMode] = useState<StudyMode | null>(null);
  const [studyCards, setStudyCards] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [sessionId, setSessionId] = useState<Id<"studySessions"> | null>(null);
  const [sessionStartedAt, setSessionStartedAt] = useState(0);
  const [sessionStats, setSessionStats] = useState({ again: 0, hard: 0, good: 0, easy: 0 });
  const [isComplete, setIsComplete] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newCard, setNewCard] = useState({ front: "", back: "", explanation: "", difficulty: "Medium" as const });

  const dueCards = useMemo(() => (cards || []).filter((card: any) => !card.suspended && (!card.due && !card.nextReviewDate || (card.due ?? card.nextReviewDate) <= Date.now())), [cards]);
  const learningCards = useMemo(() => (cards || []).filter((card: any) => card.state === "learning" || card.state === "relearning"), [cards]);
  const matureCards = useMemo(() => (cards || []).filter((card: any) => card.state === "review" && (card.stability ?? 0) >= 21), [cards]);
  const filteredCards = useMemo(() => (cards || []).filter((card: any) => !search || card.front.toLowerCase().includes(search.toLowerCase()) || card.back.toLowerCase().includes(search.toLowerCase())), [cards, search]);

  const startStudy = async (mode: StudyMode) => {
    if (!cards?.length || !user?._id) return;
    const now = Date.now();
    const eligible = cards.filter((card: any) => {
      if (card.suspended || card.buried) return false;
      if (mode === "due") return (!card.due && !card.nextReviewDate) || (card.due ?? card.nextReviewDate) <= now;
      if (mode === "learning") return card.state === "learning" || card.state === "relearning";
      return true;
    }).sort((a: any, b: any) => (a.due ?? a.nextReviewDate ?? 0) - (b.due ?? b.nextReviewDate ?? 0)).slice(0, 50);
    if (!eligible.length) { toast.info(mode === "due" ? "You’re caught up on this deck." : "There are no cards in this view yet."); return; }
    try {
      const newSessionId = await createSessionMutation({ deckId, mode, limit: 50 });
      setStudyCards(eligible);
      setStudyMode(mode);
      setSessionId(newSessionId);
      setSessionStartedAt(Date.now());
      setSessionStats({ again: 0, hard: 0, good: 0, easy: 0 });
      setCurrentIndex(0);
      setRevealed(false);
      setIsComplete(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start this session");
    }
  };

  const finishSession = async (nextStats: typeof sessionStats) => {
    if (sessionId) {
      void endSessionMutation({ sessionId, cardsStudied: studyCards.length, correctAnswers: nextStats.hard + nextStats.good + nextStats.easy, incorrectAnswers: nextStats.again, duration: Math.max(1, Math.round((Date.now() - sessionStartedAt) / 60000)) }).catch(() => undefined);
    }
    setIsComplete(true);
    setStudyMode(null);
  };

  const rateCard = (rating: Rating) => {
    const card = studyCards[currentIndex];
    if (!card || !sessionId) return;
    const nextStats = { ...sessionStats, [rating]: sessionStats[rating] + 1 };
    setSessionStats(nextStats);
    void reviewCardMutation({ cardId: card._id, rating, sessionId, responseTimeMs: undefined }).catch((error) => toast.error(error instanceof Error ? error.message : "Review could not be saved"));
    if (currentIndex >= studyCards.length - 1) void finishSession(nextStats);
    else { setCurrentIndex((index) => index + 1); setRevealed(false); }
  };

  useEffect(() => {
    if (!studyMode) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      if (event.key === " " || event.key === "Enter") { event.preventDefault(); if (!revealed) setRevealed(true); return; }
      const rating = (["again", "hard", "good", "easy"] as Rating[])[Number(event.key) - 1];
      if (revealed && rating) rateCard(rating);
      if (event.key.toLowerCase() === "s") void toggleSuspendMutation({ cardId: studyCards[currentIndex]?._id, suspended: true });
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const createCard = async () => {
    if (!user?._id || !newCard.front.trim() || !newCard.back.trim()) return;
    try {
      await createCardMutation({ userId: user._id, deckId, front: newCard.front, back: newCard.back, explanation: newCard.explanation || undefined, difficulty: newCard.difficulty });
      setNewCard({ front: "", back: "", explanation: "", difficulty: "Medium" });
      setIsCreateOpen(false);
      toast.success("Card added");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not add card"); }
  };

  if (deck === undefined || cards === undefined) return <div className="min-h-screen bg-[#fbfaf8] p-6"><div className="mx-auto max-w-6xl space-y-5"><Skeleton className="h-8 w-40" /><Skeleton className="h-36 w-full rounded-3xl" /><Skeleton className="h-96 w-full rounded-3xl" /></div></div>;
  if (!deck) return <div className="flex min-h-screen flex-col items-center justify-center gap-4"><Trophy className="h-12 w-12 text-muted-foreground" /><p className="text-muted-foreground">This deck is no longer available.</p><Link href="/dashboard/flashcards"><Button>Back to flashcards</Button></Link></div>;

  if (studyMode && studyCards[currentIndex]) {
    const card = studyCards[currentIndex];
    const progress = ((currentIndex + 1) / studyCards.length) * 100;
    return <StudyPlayer deck={deck} card={card} currentIndex={currentIndex} total={studyCards.length} progress={progress} revealed={revealed} setRevealed={setRevealed} onRate={rateCard} onExit={() => setStudyMode(null)} />;
  }

  return <main className="min-h-screen bg-[#fbfaf8] px-4 py-6 dark:bg-background sm:px-6 lg:px-8"><div className="mx-auto max-w-6xl space-y-6">
    <Link href="/dashboard/flashcards" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to flashcards</Link>
    <section className="rounded-3xl bg-[#181818] p-6 text-white shadow-xl shadow-black/10 sm:p-8"><div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"><div><div className="mb-3 flex flex-wrap items-center gap-2"><Badge className="rounded-full bg-white/10 text-white hover:bg-white/10">{deck.subject}</Badge>{deck.tags?.includes("ai-generated") && <Badge className="rounded-full bg-[#8b7bf4]/30 text-[#ddd8ff] hover:bg-[#8b7bf4]/30"><Sparkles className="mr-1 h-3 w-3" /> AI generated</Badge>}</div><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{deck.name}</h1><p className="mt-2 max-w-2xl text-white/65">{deck.description || "A focused deck for active recall."}</p></div><div className="flex flex-wrap gap-2"><Button onClick={() => startStudy("due")} disabled={!dueCards.length} className="rounded-full bg-white px-5 text-black hover:bg-white/90"><Play className="mr-2 h-4 w-4" /> Study due {dueCards.length ? `· ${dueCards.length}` : ""}</Button><Button onClick={() => startStudy("cram")} variant="outline" className="rounded-full border-white/20 bg-transparent text-white hover:bg-white/10"><RotateCcw className="mr-2 h-4 w-4" /> Cram</Button></div></div></section>

    <div className="grid gap-3 sm:grid-cols-4"><Metric label="Due now" value={dueCards.length} accent="text-[#b65d42]" /><Metric label="Learning" value={learningCards.length} accent="text-[#a06d1e]" /><Metric label="Mature" value={matureCards.length} accent="text-[#2f7b68]" /><Metric label="Total cards" value={cards.length} accent="text-[#4b67a5]" /></div>

    {isComplete && <Card className="rounded-3xl border-primary/20 bg-primary/5"><CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-2 text-primary"><Check className="h-5 w-5" /><span className="font-semibold">Session complete</span></div><p className="mt-1 text-sm text-muted-foreground">{sessionStats.good + sessionStats.easy + sessionStats.hard} cards reviewed · {sessionStats.again} to revisit</p></div><Button onClick={() => startStudy("due")} variant="outline" className="rounded-full">Study more <ArrowRight className="ml-2 h-4 w-4" /></Button></CardContent></Card>}

    <div className="flex flex-wrap items-center justify-between gap-3 border-b"><div className="flex gap-1 overflow-x-auto">{(["cards", "analytics", "settings"] as const).map((tab) => <button key={tab} onClick={() => setActiveTab(tab)} className={`border-b-2 px-3 py-3 text-sm font-medium capitalize transition-colors ${activeTab === tab ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{tab}</button>)}</div><div className="flex flex-wrap gap-2 pb-2"><Button variant="outline" size="sm" className="rounded-full" onClick={() => startStudy("all")}><Target className="mr-2 h-4 w-4" /> Study all</Button><AIFlashcardGeneratorSheet defaultCourseId={deck.courseId || ""} trigger={<Button variant="outline" size="sm" className="rounded-full"><Sparkles className="mr-2 h-4 w-4" /> Add with AI</Button>} /><Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}><SheetTrigger asChild><Button size="sm" className="rounded-full"><Plus className="mr-2 h-4 w-4" /> Add card</Button></SheetTrigger><SheetContent className="w-full sm:max-w-lg"><SheetHeader><SheetTitle>Add a card</SheetTitle></SheetHeader><div className="space-y-4 p-4"><div className="space-y-2"><Label htmlFor="front">Question</Label><Textarea id="front" value={newCard.front} onChange={(event) => setNewCard({ ...newCard, front: event.target.value })} placeholder="Ask one clear, answerable question..." className="min-h-32" /></div><div className="space-y-2"><Label htmlFor="back">Answer</Label><Textarea id="back" value={newCard.back} onChange={(event) => setNewCard({ ...newCard, back: event.target.value })} placeholder="Write the smallest complete answer..." className="min-h-32" /></div><div className="space-y-2"><Label htmlFor="explanation">Explanation <span className="font-normal text-muted-foreground">(optional)</span></Label><Textarea id="explanation" value={newCard.explanation} onChange={(event) => setNewCard({ ...newCard, explanation: event.target.value })} placeholder="Add context, an example, or a memory cue." /></div><Button className="w-full rounded-full" onClick={createCard}>Add card</Button></div></SheetContent></Sheet></div></div>

    {activeTab === "cards" && <section className="space-y-4"><div className="relative max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search this deck" className="rounded-full pl-9" /></div>{filteredCards.length ? <div className="space-y-3">{filteredCards.map((card: any, index) => <Card key={card._id} className="rounded-2xl"><CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center"><div className="flex min-w-0 flex-1 items-start gap-4"><span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">{index + 1}</span><div className="min-w-0"><Link href={`/dashboard/flashcards/${deckId}/${card._id}`} className="line-clamp-2 font-medium hover:text-primary">{displayCloze(card.front, true)}</Link><p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{displayCloze(card.back, false)}</p><div className="mt-3 flex flex-wrap gap-2"><Badge variant="outline" className="rounded-full text-xs">{card.state === "review" ? "Mature" : card.state === "new" ? "New" : "Learning"}</Badge>{card.suspended && <Badge variant="secondary" className="rounded-full text-xs">Suspended</Badge>}</div></div></div><div className="flex shrink-0 gap-2"><Link href={`/dashboard/flashcards/${deckId}/${card._id}`}><Button variant="ghost" size="sm" aria-label="Edit card"><Edit3 className="h-4 w-4" /></Button></Link><Button variant="ghost" size="sm" aria-label={card.suspended ? "Unsuspend card" : "Suspend card"} onClick={() => void toggleSuspendMutation({ cardId: card._id, suspended: !card.suspended })}>{card.suspended ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}</Button></div></CardContent></Card>)}</div> : <EmptyDeck onAdd={() => setIsCreateOpen(true)} />}</section>}
    {activeTab === "analytics" && <Analytics cards={cards} due={dueCards.length} />}
    {activeTab === "settings" && <Card className="rounded-3xl"><CardHeader><CardTitle>Deck settings</CardTitle></CardHeader><CardContent className="space-y-5"><div className="flex items-start gap-3 rounded-2xl bg-muted/50 p-4"><Flag className="mt-0.5 h-5 w-5 text-muted-foreground" /><div><p className="font-medium">Cram mode is safe</p><p className="text-sm text-muted-foreground">Cram reviews cards immediately without changing their normal schedule.</p></div></div><Button variant="destructive" className="rounded-full" onClick={async () => { if (window.confirm("Delete this deck and its review history?")) { await deleteDeckMutation({ deckId }); window.location.href = "/dashboard/flashcards"; } }}>Delete deck</Button></CardContent></Card>}
  </div></main>;
}

function StudyPlayer({ deck, card, currentIndex, total, progress, revealed, setRevealed, onRate, onExit }: { deck: any; card: any; currentIndex: number; total: number; progress: number; revealed: boolean; setRevealed: (value: boolean) => void; onRate: (rating: Rating) => void; onExit: () => void }) {
  return <main className="min-h-screen bg-[#f4f1eb] px-4 py-4 dark:bg-background sm:px-6"><div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-3xl flex-col"><header className="flex items-center justify-between gap-4 py-2"><Button variant="ghost" onClick={onExit} className="rounded-full"><X className="mr-2 h-4 w-4" /> Exit</Button><div className="text-center"><p className="text-sm font-semibold">{deck.name}</p><p className="text-xs text-muted-foreground">{currentIndex + 1} of {total}</p></div><div className="flex items-center gap-2 text-xs text-muted-foreground"><Keyboard className="h-4 w-4" /><span className="hidden sm:inline">Space to reveal</span></div></header><Progress value={progress} className="h-1.5" /><section className="flex flex-1 flex-col justify-center py-8"><Card className="min-h-[440px] rounded-[2rem] border-0 bg-white shadow-xl shadow-black/5 dark:bg-card"><CardContent className="flex min-h-[440px] flex-col items-center justify-center p-7 text-center sm:p-14"><Badge variant="outline" className="rounded-full">{revealed ? "Answer" : "Question"}</Badge><div className="prose prose-lg mt-8 max-w-none text-foreground dark:prose-invert"><ReactMarkdown remarkPlugins={[remarkGfm]}>{displayCloze(revealed ? card.back : card.front, !revealed)}</ReactMarkdown></div>{revealed && card.explanation && <div className="mt-8 max-w-xl rounded-2xl bg-muted/60 p-4 text-left text-sm"><p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Why it matters</p><ReactMarkdown remarkPlugins={[remarkGfm]}>{card.explanation}</ReactMarkdown></div>}{!revealed && <Button onClick={() => setRevealed(true)} className="mt-10 h-12 rounded-full px-8 text-base">Show answer <ArrowRight className="ml-2 h-4 w-4" /></Button>}</CardContent></Card>{revealed && <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">{(Object.keys(ratingMeta) as Rating[]).map((rating) => <button key={rating} onClick={() => onRate(rating)} className={`min-h-16 rounded-2xl border text-left transition-transform hover:-translate-y-0.5 ${ratingMeta[rating].color}`}><span className="flex items-center justify-between px-3 pt-2 text-sm font-semibold"><span>{ratingMeta[rating].label}</span><kbd className="rounded bg-black/5 px-1.5 py-0.5 text-[10px]">{ratingMeta[rating].shortcut}</kbd></span><span className="block px-3 pb-2 text-[11px] opacity-75">{ratingMeta[rating].hint}</span></button>)}</div>}</section><footer className="flex items-center justify-center gap-2 pb-3 text-xs text-muted-foreground"><span>One idea at a time.</span>{!revealed && <span>· Press Enter to reveal</span>}</footer></div></main>;
}

function Metric({ label, value, accent }: { label: string; value: number; accent: string }) { return <Card className="rounded-2xl bg-white/70 dark:bg-card"><CardContent className="p-5"><p className="text-sm text-muted-foreground">{label}</p><p className={`mt-2 text-3xl font-semibold ${accent}`}>{value}</p></CardContent></Card>; }

function EmptyDeck({ onAdd }: { onAdd: () => void }) { return <Card className="rounded-3xl border-dashed"><CardContent className="flex flex-col items-center py-16 text-center"><div className="rounded-2xl bg-primary/10 p-4 text-primary"><Plus className="h-7 w-7" /></div><h3 className="mt-4 text-lg font-semibold">This deck is ready for its first card.</h3><p className="mt-1 text-sm text-muted-foreground">Add one clear question and one complete answer.</p><Button onClick={onAdd} className="mt-5 rounded-full">Add card</Button></CardContent></Card>; }

function Analytics({ cards, due }: { cards: any[]; due: number }) { const reviews = cards.reduce((sum, card) => sum + (card.reps ?? card.timesCorrect ?? 0), 0); const accuracy = cards.reduce((sum, card) => sum + (card.timesCorrect ?? 0), 0) / Math.max(1, cards.reduce((sum, card) => sum + (card.timesCorrect ?? 0) + (card.timesIncorrect ?? 0), 0)); return <div className="grid gap-4 md:grid-cols-2"><Card className="rounded-3xl"><CardHeader><CardTitle>Learning health</CardTitle></CardHeader><CardContent className="space-y-5"><HealthRow label="Recall history" value={`${reviews} reviews`} /><HealthRow label="Current due load" value={`${due} cards`} /><HealthRow label="Observed recall" value={`${Math.round(accuracy * 100)}%`} /></CardContent></Card><Card className="rounded-3xl"><CardHeader><CardTitle>How this deck works</CardTitle></CardHeader><CardContent className="space-y-3 text-sm text-muted-foreground"><p>Reviews adapt to how effortful each recall felt. Difficult cards return sooner; stable cards gradually spread out.</p><p>“Mature” means a card has built enough stability to be reviewed less often, not that it can never be forgotten.</p></CardContent></Card></div>; }
function HealthRow({ label, value }: { label: string; value: string }) { return <div className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"><span className="text-sm text-muted-foreground">{label}</span><span className="font-semibold">{value}</span></div>; }
function displayCloze(text: string, hide: boolean) { return hide ? text.replace(/\{\{c\d+::(.*?)(?:::[^}]+)?\}\}/g, "_____" ) : text.replace(/\{\{c\d+::(.*?)(?:::[^}]+)?\}\}/g, "$1"); }
