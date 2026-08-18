"use client";

import React, { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, Check, Crown, Loader2, Plus, RefreshCw, Sparkles, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import CoursesSelect from "@/components/courses-select";

interface GeneratedCard { front: string; back: string; difficulty: "Easy" | "Medium" | "Hard"; cardType?: "basic" | "cloze" | "basic_reversed"; explanation?: string; sourceLabel?: string; }
interface AIFlashcardGeneratorSheetProps { open?: boolean; onOpenChange?: (open: boolean) => void; trigger?: React.ReactNode; defaultCourseId?: string; }

export function AIFlashcardGeneratorSheet({ open, onOpenChange, trigger, defaultCourseId = "" }: AIFlashcardGeneratorSheetProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open !== undefined ? open : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  const user = useQuery(api.users.currentUser);
  const userId = user?._id;
  const courses = useQuery(api.courses.getAllCourses, userId ? { userId } : "skip") || [];
  const createDeckWithCards = useMutation(api.flashcards.createDeckWithGeneratedCards);
  const [step, setStep] = useState<"setup" | "review">("setup");
  const [selectedCourseId, setSelectedCourseId] = useState(defaultCourseId);
  const [deckName, setDeckName] = useState("");
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [mode, setMode] = useState("Balanced");
  const [generatedCards, setGeneratedCards] = useState<GeneratedCard[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const userPlan = user?.subscriptionPlan || "FREE";
  const cardLimit = userPlan === "STUDENTPRO" ? 20 : userPlan === "STUDENT" ? 10 : 2;
  const selectedCourse = courses.find((course) => course._id === selectedCourseId);

  const requestGeneration = async (count: number, replaceIndex?: number) => {
    if (!selectedCourseId || !userId) { toast.error("Choose a course first"); return; }
    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-flashcards", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topic: `${selectedCourse?.name || "Course"} — ${topic || deckName || "high-yield review"}${notes ? `\nSource notes:\n${notes}` : ""}`, count, difficulty: mode, userId: userId.toString(), courseId: selectedCourseId, courseName: selectedCourse?.name, userCourses: courses.map((course) => ({ name: course.name, code: course.code, description: course.description })) }) });
      const data = await response.json();
      if (!response.ok || !Array.isArray(data.flashcards) || !data.flashcards.length) throw new Error(data.error || "No usable cards were generated");
      const cards = data.flashcards as GeneratedCard[];
      setGeneratedCards((previous) => replaceIndex === undefined ? cards : previous.map((card, index) => index === replaceIndex ? cards[0] : card));
      setStep("review");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Generation failed"); }
    finally { setIsGenerating(false); }
  };

  const saveDeck = async () => {
    if (!userId || !selectedCourseId || !generatedCards.length) return;
    try {
      await createDeckWithCards({ userId, name: deckName.trim() || `${selectedCourse?.name || "Course"} review`, description: `AI-generated review deck for ${selectedCourse?.name || "your course"}`, courseId: selectedCourseId as Id<"courses">, difficulty: "Medium", color: "border-t-[#7c6cf2]", cards: generatedCards.map((card) => ({ front: card.front.trim(), back: card.back.trim(), difficulty: card.difficulty, cardType: card.cardType, explanation: card.explanation, sourceLabel: card.sourceLabel })) });
      toast.success(`${generatedCards.length} cards saved to your new deck`);
      reset();
      setOpen(false);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not save deck"); }
  };

  const reset = () => { setStep("setup"); setGeneratedCards([]); setDeckName(""); setTopic(""); setNotes(""); };
  const updateCard = (index: number, key: keyof GeneratedCard, value: string) => setGeneratedCards((cards) => cards.map((card, cardIndex) => cardIndex === index ? { ...card, [key]: value } : card));

  return <Sheet open={isOpen} onOpenChange={(nextOpen) => { setOpen(nextOpen); if (!nextOpen) reset(); }}><>{trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}<SheetContent className="w-full overflow-y-auto sm:max-w-2xl"><SheetHeader className="border-b pb-4"><div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /><SheetTitle>{step === "setup" ? "Create flashcards with AI" : "Review before saving"}</SheetTitle></div></SheetHeader>{step === "setup" ? <div className="space-y-5 p-4 pt-6"><div className="rounded-2xl border bg-primary/5 p-4"><div className="flex items-center justify-between gap-3"><Badge variant="secondary" className="rounded-full">{userPlan === "STUDENTPRO" ? "Scholar plan" : userPlan === "STUDENT" ? "Starter plan" : "Free plan"}</Badge><span className="text-xs font-semibold text-primary">Up to {cardLimit} cards</span></div><p className="mt-2 text-xs text-muted-foreground">You’ll inspect every card before anything is added to your library.</p></div><div className="space-y-2"><Label><BookOpen className="mr-1 inline h-4 w-4" /> Course</Label><CoursesSelect course={selectedCourseId} onChange={setSelectedCourseId} /></div><div className="space-y-2"><Label htmlFor="ai-deck-name">Deck name <span className="font-normal text-muted-foreground">(optional)</span></Label><Input id="ai-deck-name" value={deckName} onChange={(event) => setDeckName(event.target.value)} placeholder="e.g. Midterm — Chapter 3" /></div><div className="space-y-2"><Label htmlFor="ai-topic">What do you want to remember?</Label><Input id="ai-topic" value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="e.g. Little’s Law and bottleneck analysis" /></div><div className="space-y-2"><Label htmlFor="ai-notes">Paste notes or source material <span className="font-normal text-muted-foreground">(optional)</span></Label><Textarea id="ai-notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Source material keeps the cards grounded in your course." className="min-h-32" /></div><div className="space-y-2"><Label>Study focus</Label><Select value={mode} onValueChange={setMode}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Balanced">Balanced</SelectItem><SelectItem value="Exam Focus">Exam focus</SelectItem><SelectItem value="Definitions">Definitions</SelectItem><SelectItem value="Conceptual Understanding">Conceptual understanding</SelectItem><SelectItem value="Practice Recall">Practice recall</SelectItem></SelectContent></Select></div><Button onClick={() => void requestGeneration(cardLimit)} disabled={isGenerating || !selectedCourseId} className="h-12 w-full rounded-full text-base">{isGenerating ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Building a study set…</> : <><Sparkles className="mr-2 h-5 w-5" /> Generate draft</>}</Button><Link href="/dashboard/pricing" className="flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground">Need more cards? <Crown className="h-3 w-3 text-amber-500" /> View plans <ArrowRight className="h-3 w-3" /></Link></div> : <div className="space-y-4 p-4"><div className="flex items-center justify-between gap-3"><Button variant="ghost" size="sm" onClick={() => setStep("setup")}><ArrowLeft className="mr-2 h-4 w-4" /> Edit request</Button><span className="text-sm text-muted-foreground">{generatedCards.length} draft cards</span></div><div className="space-y-3">{generatedCards.map((card, index) => <div key={`${index}-${card.front.slice(0, 10)}`} className="space-y-3 rounded-2xl border p-4"><div className="flex items-center justify-between"><Badge variant="outline" className="rounded-full">Card {index + 1}</Badge><div className="flex gap-1"><Button variant="ghost" size="sm" aria-label={`Regenerate card ${index + 1}`} disabled={isGenerating} onClick={() => void requestGeneration(1, index)}><RefreshCw className="h-4 w-4" /></Button><Button variant="ghost" size="sm" aria-label={`Delete card ${index + 1}`} onClick={() => setGeneratedCards((cards) => cards.filter((_, cardIndex) => cardIndex !== index))}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></div><Textarea value={card.front} onChange={(event) => updateCard(index, "front", event.target.value)} aria-label={`Question ${index + 1}`} className="min-h-20" /><Textarea value={card.back} onChange={(event) => updateCard(index, "back", event.target.value)} aria-label={`Answer ${index + 1}`} className="min-h-24" /><Input value={card.explanation || ""} onChange={(event) => updateCard(index, "explanation", event.target.value)} aria-label={`Explanation ${index + 1}`} placeholder="Optional explanation" /></div>)}</div><Button variant="outline" className="w-full rounded-full" onClick={() => setGeneratedCards((cards) => [...cards, { front: "", back: "", difficulty: "Medium" }])}><Plus className="mr-2 h-4 w-4" /> Add another card</Button><Button onClick={() => void saveDeck()} disabled={!generatedCards.length || generatedCards.some((card) => !card.front.trim() || !card.back.trim()) || isGenerating} className="h-12 w-full rounded-full"><Check className="mr-2 h-5 w-5" /> Save {generatedCards.length} cards</Button></div>}</SheetContent></></Sheet>;
}
