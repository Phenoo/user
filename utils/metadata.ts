import { Metadata } from "next";

interface MetadataProps {
  title?: string;
  description?: string;
  icons?: Metadata["icons"];
  noIndex?: boolean;
  keywords?: string[];
  author?: string;
  twitterHandle?: string;
  type?: "website" | "article" | "profile";
  locale?: string;
  alternates?: Record<string, string>;
  publishedTime?: string;
  modifiedTime?: string;
}

export const generateMetadata = ({
  description = `Master any subject faster with AI-powered flashcards, spaced repetition, and smart study tools. Join thousands of students studying smarter, not harder.`,

  noIndex = false,
  keywords = [
    "AI study app",
    "flashcards for students",
    "spaced repetition",
    "exam prep tool",
    "study smarter",
    "learning productivity",
    "exam prep",
    "student productivity",
    "memorization techniques",
    "online learning",
    "learning app",
    "study planner",
    "active recall",
    "test preparation",
  ],
  author = "Eze",
  type = "website",
}: MetadataProps = {}): Metadata => {
  const metadataBase = new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://usoro.app"
  );

  return {
    metadataBase,
    title: {
      template: "%s | Usoro - AI-Powered Flashcards & Study Tools for Students",
      default: "Usoro - Study",
    },
    description,
    keywords,
    authors: [{ name: author }],
    creator: author,
    publisher: process.env.NEXT_PUBLIC_APP_NAME,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      title: "Usoro - AI-Powered Flashcards & Study Tools for Students",
      description:
        "Master any subject faster with AI-powered flashcards and spaced repetition. Study smarter, not harder.",
      url: "https://usoro.app",
      siteName: "Usoro",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: "Usoro - AI-Powered Flashcards & Study Tools for Students",
        },
      ],
      locale: "en_US",
      type: "website",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: "G-1C0HV5XF3N",
    },
  };
};
