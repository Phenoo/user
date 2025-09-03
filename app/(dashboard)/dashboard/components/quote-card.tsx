import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Quote } from "lucide-react";
import React from "react";

const QuoteCard = () => {
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

  const todaysQuote =
    inspirationalQuotes[Math.floor(Math.random() * inspirationalQuotes.length)];
  return (
    <Card className="">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Quote className="h-4 w-4 text-black" />
          Daily Inspiration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <blockquote className="space-y-3">
          <p className="text-sm italic text-foreground leading-relaxed">
            "{todaysQuote.text}"
          </p>
          <footer className="text-xs text-muted-foreground">
            — {todaysQuote.author}
          </footer>
        </blockquote>
      </CardContent>
    </Card>
  );
};

export default QuoteCard;
