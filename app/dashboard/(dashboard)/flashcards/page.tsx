import React from "react";

import type { Metadata } from "next";
import FlashcardsPageContainer from "./components/flashcardpage-container";

export const metadata: Metadata = {
  title: "Flashcards",
};

interface Flashcard {
  id: string;
  front: string;
  back: string;
  image?: string;
  audio?: string;
  difficulty: "easy" | "medium" | "hard";
  lastReviewed?: Date;
  timesCorrect: number;
  timesIncorrect: number;
  mastered: boolean;
}

export interface FlashcardDeck {
  _id: string;
  name: string;
  description: string;
  subject: string;
  cards?: Flashcard[];
  color: string;
  createdAt: number;
  lastStudied?: Date;
}

const FlashCardPage = () => {
  return <FlashcardsPageContainer />;
};

export default FlashCardPage;
