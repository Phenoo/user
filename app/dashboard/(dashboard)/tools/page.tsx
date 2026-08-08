"use client";

import { useState } from "react";
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
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Study Guide State
  const [studySubject, setStudySubject] = useState("");
  const [studyTopics, setStudyTopics] = useState("");
  const [examDate, setExamDate] = useState("");
  const [studyGuideResult, setStudyGuideResult] = useState("");
  const [studyGuideLoading, setStudyGuideLoading] = useState(false);

  // Copy state
  const [copiedEssay, setCopiedEssay] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedStudyGuide, setCopiedStudyGuide] = useState(false);

  const handleGenerateEssay = async () => {
    if (!essayTopic.trim()) return;

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
      setEssayResult(data.data?.text || data.text);
    } catch (error) {
      console.error("[v0] Error generating essay:", error);
      setEssayResult("Failed to generate essay. Please try again.");
    } finally {
      setEssayLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!summaryContent.trim()) return;

    setSummaryLoading(true);
    setSummaryResult("");

    try {
      const response = await fetch("/api/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: summaryContent,
          summaryType,
          userId,
        }),
      });

      const data = await response.json();
      setSummaryResult(data.data?.text || data.text);
    } catch (error) {
      console.error("[v0] Error generating summary:", error);
      setSummaryResult("Failed to generate summary. Please try again.");
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleGenerateStudyGuide = async () => {
    if (!studySubject.trim() || !studyTopics.trim()) return;

    setStudyGuideLoading(true);
    setStudyGuideResult("");

    try {
      const topicsArray = studyTopics.split(",").map((t) => t.trim());

      const response = await fetch("/api/generate-study-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: studySubject,
          topics: topicsArray,
          examDate,
          userId,
        }),
      });

      const data = await response.json();
      setStudyGuideResult(data.data?.text || data.text);
    } catch (error) {
      console.error("[v0] Error generating study guide:", error);
      setStudyGuideResult("Failed to generate study guide. Please try again.");
    } finally {
      setStudyGuideLoading(false);
    }
  };

  const copyToClipboard = async (
    text: string,
    type: "essay" | "summary" | "study-guide"
  ) => {
    await navigator.clipboard.writeText(text);

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
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block"
          >
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold mb-2">AI Text Generation Tools</h1>
          <p className="text-muted-foreground">
            Generate essays, summaries, and study guides powered by GPT-4o
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

                <div className="min-h-[400px] max-h-[600px] overflow-y-auto">
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
                    disabled={summaryLoading || !summaryContent.trim()}
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

                <div className="min-h-[400px] max-h-[600px] overflow-y-auto">
                  {summaryLoading ? (
                    <SkeletonLoader />
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
                      !studySubject.trim() ||
                      !studyTopics.trim()
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

                <div className="min-h-[400px] max-h-[600px] overflow-y-auto">
                  {studyGuideLoading ? (
                    <SkeletonLoader />
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
