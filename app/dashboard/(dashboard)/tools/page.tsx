"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  BookOpen,
  FileCheck,
  Loader2,
  Copy,
  Check,
  ArrowLeft,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

const SkeletonLoader = () => (
  <div className="space-y-4 w-full h-full pt-4">
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-11/12" />
    <Skeleton className="h-4 w-4/5" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-5/6" />
  </div>
);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function readGeneratedText(
  response: Response,
  fallbackError: string
): Promise<string> {
  let payload: unknown = null;

  try {
    payload = await response.json();
  } catch {
    // Keep the fallback message for non-JSON responses.
  }

  if (!response.ok) {
    const message =
      isRecord(payload) && typeof payload.error === "string"
        ? payload.error
        : fallbackError;
    throw new Error(message);
  }

  const data = isRecord(payload) && isRecord(payload.data) ? payload.data : null;
  const text = data && typeof data.text === "string"
    ? data.text
    : isRecord(payload) && typeof payload.text === "string"
      ? payload.text
      : "";

  if (!text.trim()) {
    throw new Error("The AI service returned an empty response. Please try again.");
  }

  return text;
}

export default function ToolsPage() {
  const user = useQuery(api.users.currentUser);
  const userId = user?._id || "";

  // Essay Generator State
  const [essayTopic, setEssayTopic] = useState("");
  const [essayLength, setEssayLength] = useState("500");
  const [academicLevel, setAcademicLevel] = useState("high-school");
  const [essayResult, setEssayResult] = useState("");
  const [essayLoading, setEssayLoading] = useState(false);

  // Summary Generator State
  const [summaryContent, setSummaryContent] = useState("");
  const [summaryType, setSummaryType] = useState("brief");
  const [summaryResult, setSummaryResult] = useState("");
  const [summaryError, setSummaryError] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Study Guide State
  const [studySubject, setStudySubject] = useState("");
  const [studyTopics, setStudyTopics] = useState("");
  const [examDate, setExamDate] = useState("");
  const [studyGuideResult, setStudyGuideResult] = useState("");
  const [studyGuideError, setStudyGuideError] = useState("");
  const [studyGuideLoading, setStudyGuideLoading] = useState(false);

  const summaryAbortRef = useRef<AbortController | null>(null);
  const studyGuideAbortRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      summaryAbortRef.current?.abort();
      studyGuideAbortRef.current?.abort();
    };
  }, []);

  // Copy state
  const [copiedEssay, setCopiedEssay] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedStudyGuide, setCopiedStudyGuide] = useState(false);

  const handleGenerateEssay = async () => {
    if (!essayTopic.trim()) {
      toast.error("Please enter an essay topic");
      return;
    }

    setEssayLoading(true);
    setEssayResult("");

    try {
      const response = await fetch("/api/generate-essay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: essayTopic,
          length: essayLength,
          academicLevel,
          userId,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate essay");
      }
      setEssayResult(data.data?.text || data.text);
      toast.success("Essay generated successfully");
    } catch (error) {
      console.error("Error generating essay:", error);
      const message = error instanceof Error ? error.message : "Failed to generate essay";
      setEssayResult(`Failed to generate essay. ${message}`);
      toast.error(message);
    } finally {
      setEssayLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    const content = summaryContent.trim();

    if (content.length < 50) {
      toast.error("Please enter at least 50 characters to summarize");
      return;
    }

    if (!userId) {
      toast.error("Please sign in before using the AI tools");
      return;
    }

    setSummaryLoading(true);
    setSummaryResult("");
    setSummaryError("");
    const controller = new AbortController();
    summaryAbortRef.current = controller;

    try {
      const response = await fetch("/api/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          summaryType,
          userId,
        }),
        signal: controller.signal,
      });

      const generatedText = await readGeneratedText(
        response,
        "Failed to generate summary"
      );
      if (!isMountedRef.current) return;
      setSummaryResult(generatedText);
      toast.success("Summary generated successfully");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      if (!isMountedRef.current) return;
      console.error("Error generating summary:", error);
      const message = error instanceof Error ? error.message : "Failed to generate summary";
      setSummaryError(message);
      toast.error(message);
    } finally {
      if (summaryAbortRef.current === controller) {
        summaryAbortRef.current = null;
      }
      if (isMountedRef.current) {
        setSummaryLoading(false);
      }
    }
  };

  const handleGenerateStudyGuide = async () => {
    const subject = studySubject.trim();
    const topicsArray = studyTopics
      .split(",")
      .map((topic) => topic.trim())
      .filter(Boolean);

    if (subject.length < 2 || topicsArray.length === 0) {
      toast.error("Please enter both subject and topics");
      return;
    }

    if (topicsArray.length > 20) {
      toast.error("Please enter no more than 20 topics");
      return;
    }

    if (!userId) {
      toast.error("Please sign in before using the AI tools");
      return;
    }

    setStudyGuideLoading(true);
    setStudyGuideResult("");
    setStudyGuideError("");
    const controller = new AbortController();
    studyGuideAbortRef.current = controller;

    try {
      const response = await fetch("/api/generate-study-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          topics: topicsArray,
          examDate,
          userId,
        }),
        signal: controller.signal,
      });

      const generatedText = await readGeneratedText(
        response,
        "Failed to generate study guide"
      );
      if (!isMountedRef.current) return;
      setStudyGuideResult(generatedText);
      toast.success("Study guide generated successfully");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      if (!isMountedRef.current) return;
      console.error("Error generating study guide:", error);
      const message = error instanceof Error ? error.message : "Failed to generate study guide";
      setStudyGuideError(message);
      toast.error(message);
    } finally {
      if (studyGuideAbortRef.current === controller) {
        studyGuideAbortRef.current = null;
      }
      if (isMountedRef.current) {
        setStudyGuideLoading(false);
      }
    }
  };

  const copyToClipboard = async (
    text: string,
    type: "essay" | "summary" | "study-guide"
  ) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Could not copy the content. Please select and copy it manually.");
      return;
    }

    if (type === "essay") {
      setCopiedEssay(true);
      setTimeout(() => setCopiedEssay(false), 2000);
    } else if (type === "summary") {
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    } else {
      setCopiedStudyGuide(true);
      setTimeout(() => setCopiedStudyGuide(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold mb-2">AI Text Generation Tools</h1>
          <p className="text-muted-foreground">
            Generate essays, summaries, and study guides with AI
          </p>
        </div>

        {/* Tools Tabs */}
        <Tabs defaultValue="essay" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="essay">
              <FileText className="w-4 h-4 mr-2" />
              Essay Generator
            </TabsTrigger>
            <TabsTrigger value="summary">
              <FileCheck className="w-4 h-4 mr-2" />
              Summarizer
            </TabsTrigger>
            <TabsTrigger value="study-guide">
              <BookOpen className="w-4 h-4 mr-2" />
              Study Guide
            </TabsTrigger>
          </TabsList>

          {/* Essay Generator */}
          <TabsContent value="essay" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 space-y-4">
                <h2 className="text-2xl font-semibold">Generate Essay</h2>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="essay-topic">Essay Topic</Label>
                    <Input
                      id="essay-topic"
                      placeholder="e.g., The impact of climate change on biodiversity"
                      value={essayTopic}
                      onChange={(e) => setEssayTopic(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="essay-length">Length (words)</Label>
                    <Select value={essayLength} onValueChange={setEssayLength}>
                      <SelectTrigger id="essay-length">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="300">300 words</SelectItem>
                        <SelectItem value="500">500 words</SelectItem>
                        <SelectItem value="750">750 words</SelectItem>
                        <SelectItem value="1000">1000 words</SelectItem>
                        <SelectItem value="1500">1500 words</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="academic-level">Academic Level</Label>
                    <Select
                      value={academicLevel}
                      onValueChange={setAcademicLevel}
                    >
                      <SelectTrigger id="academic-level">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="middle-school">
                          Middle School
                        </SelectItem>
                        <SelectItem value="high-school">High School</SelectItem>
                        <SelectItem value="undergraduate">
                          Undergraduate
                        </SelectItem>
                        <SelectItem value="graduate">Graduate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={handleGenerateEssay}
                    disabled={essayLoading || !essayTopic.trim()}
                    className="w-full"
                  >
                    {essayLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "Generate Essay"
                    )}
                  </Button>
                </div>
              </Card>

              <Card className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Generated Essay</h3>
                  {essayResult && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(essayResult, "essay")}
                    >
                      {copiedEssay ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </div>

                <div
                  className="min-h-[400px] max-h-[600px] overflow-y-auto"
                  aria-live="polite"
                >
                  {essayLoading ? (
                    <SkeletonLoader />
                  ) : essayResult ? (
                    <div className="prose prose-invert max-w-none whitespace-pre-wrap leading-relaxed [&>p]:mb-4 [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:mb-4 [&>h2]:text-xl [&>h2]:font-bold [&>h2]:mb-3 [&>h3]:text-lg [&>h3]:font-bold [&>h3]:mb-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-4 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-4">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {essayResult}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                      Your generated essay will appear here
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Summary Generator */}
          <TabsContent value="summary" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 space-y-4">
                <h2 className="text-2xl font-semibold">Generate Summary</h2>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="summary-content">
                      Content to Summarize
                    </Label>
                    <Textarea
                      id="summary-content"
                      placeholder="Paste the text you want to summarize..."
                      value={summaryContent}
                      onChange={(e) => setSummaryContent(e.target.value)}
                      rows={10}
                      className="h-96 overflow-y-auto"
                    />
                    <p className="text-xs text-muted-foreground">
                      {summaryContent.trim().length}/50 minimum characters
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="summary-type">Summary Type</Label>
                    <Select value={summaryType} onValueChange={setSummaryType}>
                      <SelectTrigger id="summary-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="brief">
                          Brief (2-3 paragraphs)
                        </SelectItem>
                        <SelectItem value="detailed">Detailed</SelectItem>
                        <SelectItem value="bullet">Bullet Points</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={handleGenerateSummary}
                    disabled={
                      summaryLoading ||
                      summaryContent.trim().length < 50 ||
                      !userId
                    }
                    className="w-full"
                  >
                    {summaryLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "Generate Summary"
                    )}
                  </Button>
                </div>
              </Card>

              <Card className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Generated Summary</h3>
                  {summaryResult && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(summaryResult, "summary")}
                    >
                      {copiedSummary ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </div>

                <div
                  className="min-h-[400px] max-h-[600px] overflow-y-auto"
                  aria-live="polite"
                >
                  {summaryLoading ? (
                    <SkeletonLoader />
                  ) : summaryError ? (
                    <div className="flex items-center justify-center h-[400px] text-center text-sm text-destructive">
                      {summaryError}
                    </div>
                  ) : summaryResult ? (
                    <div className="prose prose-invert max-w-none whitespace-pre-wrap leading-relaxed [&>p]:mb-4 [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:mb-4 [&>h2]:text-xl [&>h2]:font-bold [&>h2]:mb-3 [&>h3]:text-lg [&>h3]:font-bold [&>h3]:mb-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-4 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-4">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {summaryResult}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                      Your generated summary will appear here
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Study Guide Generator */}
          <TabsContent value="study-guide" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 space-y-4">
                <h2 className="text-2xl font-semibold">Generate Study Guide</h2>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="study-subject">Subject</Label>
                    <Input
                      id="study-subject"
                      placeholder="e.g., Biology, World History, Calculus"
                      value={studySubject}
                      onChange={(e) => setStudySubject(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="study-topics">
                      Topics (comma-separated)
                    </Label>
                    <Textarea
                      id="study-topics"
                      placeholder="e.g., Cell structure, Photosynthesis, Mitosis"
                      value={studyTopics}
                      onChange={(e) => setStudyTopics(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="exam-date">Exam Date (optional)</Label>
                    <Input
                      id="exam-date"
                      type="date"
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                    />
                  </div>

                  <Button
                    onClick={handleGenerateStudyGuide}
                    disabled={
                      studyGuideLoading ||
                      studySubject.trim().length < 2 ||
                      !studyTopics.split(",").some((topic) => topic.trim()) ||
                      !userId
                    }
                    className="w-full"
                  >
                    {studyGuideLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "Generate Study Guide"
                    )}
                  </Button>
                </div>
              </Card>

              <Card className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">
                    Generated Study Guide
                  </h3>
                  {studyGuideResult && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(studyGuideResult, "study-guide")
                      }
                    >
                      {copiedStudyGuide ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </div>

                <div
                  className="min-h-[400px] max-h-[600px] overflow-y-auto"
                  aria-live="polite"
                >
                  {studyGuideLoading ? (
                    <SkeletonLoader />
                  ) : studyGuideError ? (
                    <div className="flex items-center justify-center h-[400px] text-center text-sm text-destructive">
                      {studyGuideError}
                    </div>
                  ) : studyGuideResult ? (
                    <div className="prose prose-invert max-w-none whitespace-pre-wrap leading-relaxed [&>p]:mb-4 [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:mb-4 [&>h2]:text-xl [&>h2]:font-bold [&>h2]:mb-3 [&>h3]:text-lg [&>h3]:font-bold [&>h3]:mb-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-4 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-4">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {studyGuideResult}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                      Your generated study guide will appear here
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
