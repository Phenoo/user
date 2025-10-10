"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import { FlashcardDeck } from "../page";
import Link from "next/link";
import { FlashcardItem } from "@/components/flashcard-item";

export interface FlashcardItemProps {
  id: string;
  title: string;
  subject: string;
  date: string;
  participants: number;
  color: string;
}

export function FlashcardContainer({ decks }: { decks: FlashcardDeck[] }) {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div className="w-full">
      <div className="grid w-fit grid-cols-3 bg-muted p-1 gap-2  rounded-3xl mb-6">
        <div
          className={cn(
            "text-sm py-4 px-6 cursor-pointer rounded-3xl  h-9 text-foreground  flex items-center justify-center transition-colors",
            activeTab === "all"
              ? "bg-primary text-foreground font-bold"
              : "hover:bg-rose-100 hover:text-black"
          )}
          onClick={() => setActiveTab("all")}
        >
          All Cards
        </div>
        <div
          onClick={() => setActiveTab("unmastered")}
          className={cn(
            "text-sm py-4 px-6 cursor-pointer rounded-3xl  h-9 text-foreground  flex items-center justify-center transition-colors",
            activeTab === "unmastered"
              ? "bg-primary text-foreground font-bold"
              : "hover:bg-rose-100 hover:text-black"
          )}
        >
          Unmastered
        </div>
        <div
          onClick={() => setActiveTab("review")}
          className={cn(
            "text-sm py-4 px-6 cursor-pointer rounded-3xl  h-9 text-foreground  flex items-center justify-center transition-colors",
            activeTab === "review"
              ? "bg-primary text-foreground font-bold"
              : "hover:bg-rose-100 hover:text-black"
          )}
        >
          Review
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {decks.map((deck) => (
          <Link key={deck._id} href={`/dashboard/flashcards/${deck._id}`}>
            <FlashcardItem
              item={{
                id: deck._id,
                title: deck.name,
                subject: deck.subject,
                date: deck.lastStudied
                  ? deck.lastStudied.toLocaleDateString()
                  : "Never studied",
                participants: 0,
                color: deck.color,
              }}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
