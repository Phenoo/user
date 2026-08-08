"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useChat } from "@ai-sdk/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import {
  Sparkles,
  Bot,
  X,
  Maximize2,
  Trash2,
  Send,
  Copy,
  Check,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SUGGESTIONS = [
  "Help me study for my upcoming exam",
  "Explain this concept simply",
  "Create a study schedule",
  "Quiz me on key terms",
];

export function FloatingAIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("all");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pathname = usePathname();

  const user = useQuery(api.users.currentUser);
  const courses =
    useQuery(
      api.courses.getAllCourses,
      user?._id ? { userId: user._id as Id<"users"> } : "skip"
    ) || [];

  const { messages, sendMessage, status, setMessages } = useChat({
    onError: (error) => {
      toast.error("Failed to send message", {
        description: error.message,
      });
    },
  });

  const isLoading = status === "submitted" || status === "streaming";

  // Hide floating chat button when on full chat page to avoid redundancy
  const isFullChatPage = pathname === "/dashboard/chat";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, status]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const selectedCourse = courses.find((c) => c._id === selectedCourseId);
    const bodyPayload = selectedCourse
      ? {
          courseId: selectedCourse._id,
          courseName: selectedCourse.name,
          courseCode: selectedCourse.code,
          userId: user?._id?.toString() || "anonymous",
        }
      : {
          userId: user?._id?.toString() || "anonymous",
        };

    sendMessage({ text: input.trim() }, { body: bodyPayload });
    setInput("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    const selectedCourse = courses.find((c) => c._id === selectedCourseId);
    const bodyPayload = selectedCourse
      ? {
          courseId: selectedCourse._id,
          courseName: selectedCourse.name,
          courseCode: selectedCourse.code,
          userId: user?._id?.toString() || "anonymous",
        }
      : {
          userId: user?._id?.toString() || "anonymous",
        };

    sendMessage({ text: suggestion }, { body: bodyPayload });
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    setMessages([]);
    toast.info("Conversation reset");
  };

  if (isFullChatPage) {
    return null;
  }

  const activeCourse = courses.find((c) => c._id === selectedCourseId);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Floating Chat Drawer Window */}
      {isOpen && (
        <Card className="w-[360px] sm:w-[410px] h-[560px] max-h-[84vh] shadow-2xl border border-border flex flex-col overflow-hidden bg-background/98 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5 duration-200 rounded-2xl">
          {/* Header */}
          <div className="p-3.5 px-4 bg-muted/40 border-b flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-background rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-semibold text-sm leading-none">
                    AI Study Assistant
                  </h3>
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0 h-4 font-normal"
                  >
                    AI
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Online & Ready
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={handleClear}
                  title="Clear chat"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
              <Link href="/dashboard/chat" onClick={() => setIsOpen(false)}>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-muted-foreground"
                  title="Expand to full screen"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </Button>
              </Link>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-muted-foreground"
                onClick={() => setIsOpen(false)}
                title="Close chat"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Course Selector Toolbar */}
          <div className="p-2 px-3 bg-muted/20 border-b flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Reference:</span>
            </div>
            <Select
              value={selectedCourseId}
              onValueChange={setSelectedCourseId}
            >
              <SelectTrigger className="h-7 text-xs border-muted bg-background focus:ring-0">
                <SelectValue placeholder="All Courses (General)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses (General)</SelectItem>
                {courses.map((c) => (
                  <SelectItem key={c._id} value={c._id}>
                    {c.code ? `${c.code}: ${c.name}` : c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm scrollbar-thin">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-2 space-y-4 my-auto">
                <div className="w-12 h-12 rounded-2xl bg-muted border text-foreground flex items-center justify-center shadow-sm">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-sm">How can I help you today?</h4>
                  <p className="text-xs text-muted-foreground max-w-[260px]">
                    {activeCourse
                      ? `Ask any question tailored to ${activeCourse.name} (${activeCourse.code}).`
                      : "Ask any question about your courses, homework, or exam preparations."}
                  </p>
                </div>
                <div className="w-full space-y-2 pt-2">
                  {SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left text-xs p-2.5 rounded-xl border bg-muted/40 hover:bg-muted transition-colors flex items-center justify-between group"
                    >
                      <span className="text-muted-foreground group-hover:text-foreground">
                        {suggestion}
                      </span>
                      <Sparkles className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex flex-col ${
                    message.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {message.role === "user" ? "You" : "AI Assistant"}
                    </span>
                  </div>
                  <div
                    className={`group relative max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                      message.role === "user"
                        ? "bg-foreground text-background shadow-sm rounded-br-none"
                        : "bg-muted/80 text-foreground border border-border/60 rounded-bl-none"
                    }`}
                  >
                    {message.parts.map((part, pIdx) => {
                      if (part.type === "text") {
                        return (
                          <div key={pIdx} className="whitespace-pre-wrap">
                            {part.text}
                          </div>
                        );
                      }
                      return null;
                    })}

                    {message.role === "assistant" && (
                      <button
                        onClick={() => {
                          const fullText = message.parts
                            .filter((p) => p.type === "text")
                            .map((p) => p.text)
                            .join("\n");
                          handleCopy(message.id, fullText);
                        }}
                        className="absolute -right-7 top-1 opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-foreground transition-opacity"
                        title="Copy message"
                      >
                        {copiedId === message.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex items-start gap-2">
                <div className="bg-muted/80 border border-border/60 text-foreground rounded-2xl rounded-bl-none px-3.5 py-2.5 text-xs flex items-center gap-2">
                  <div className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-foreground/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-foreground/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-foreground/60 rounded-full animate-bounce" />
                  </div>
                  <span className="text-muted-foreground text-[11px]">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input */}
          <form
            onSubmit={handleSubmit}
            className="p-3 bg-background border-t shrink-0 flex items-center gap-2"
          >
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                activeCourse
                  ? `Ask AI about ${activeCourse.name}...`
                  : "Ask AI anything..."
              }
              className="flex-1 resize-none bg-muted/40 border border-input focus:border-ring rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring max-h-24 scrollbar-none"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className="h-8 w-8 rounded-xl bg-foreground text-background hover:bg-foreground/90 shrink-0 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
        </Card>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center justify-center w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-foreground text-background shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 border border-border focus:outline-none"
        aria-label="Toggle AI Study Assistant"
      >
        {/* Subtle glow border */}
        <span className="absolute inset-0 rounded-full border border-foreground/20 group-hover:scale-110 transition-transform duration-300 pointer-events-none" />

        {/* Icon toggle */}
        {isOpen ? (
          <X className="w-5 h-5 transition-transform duration-200" />
        ) : (
          <div className="relative">
            <Sparkles className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full" />
          </div>
        )}

        {/* Hover Tooltip */}
        {!isOpen && (
          <span className="absolute right-15 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-popover text-popover-foreground text-xs font-medium whitespace-nowrap shadow-lg border border-border opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            Ask AI Assistant
          </span>
        )}
      </button>
    </div>
  );
}
