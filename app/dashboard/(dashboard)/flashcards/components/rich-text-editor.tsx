"use client";

import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Bold, Italic, Code } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
}: RichTextEditorProps) {
  const [preview, setPreview] = useState("");

  useEffect(() => {
    let processed = value;

    // Convert LaTeX delimiters for rendering
    processed = processed.replace(
      /\$\$(.*?)\$\$/g,
      '<span class="latex-block">$$$1$$</span>'
    );
    processed = processed.replace(
      /\$(.*?)\$/g,
      '<span class="latex-inline">$$$1$$</span>'
    );

    // Basic markdown-style formatting
    processed = processed.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    processed = processed.replace(/\*(.*?)\*/g, "<em>$1</em>");
    processed = processed.replace(
      /`(.*?)`/g,
      '<code class="bg-muted px-1 rounded">$1</code>'
    );

    setPreview(processed);
  }, [value]);

  const insertFormatting = (before: string, after: string) => {
    const textarea = document.querySelector("textarea") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newValue =
      value.substring(0, start) +
      before +
      selectedText +
      after +
      value.substring(end);

    onChange(newValue);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2 mb-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => insertFormatting("**", "**")}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => insertFormatting("*", "*")}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => insertFormatting("`", "`")}
        >
          <Code className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => insertFormatting("$$", "$$")}
        >
          LaTeX
        </Button>
      </div>

      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[150px] font-mono text-sm"
      />

      {value && (
        <div className="border rounded-md p-4 bg-muted/30">
          <p className="text-xs text-muted-foreground mb-2">Preview:</p>
          <div
            className="prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: preview }}
          />
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Supports: **bold**, *italic*, `code`, $$LaTeX$$
      </p>
    </div>
  );
}
