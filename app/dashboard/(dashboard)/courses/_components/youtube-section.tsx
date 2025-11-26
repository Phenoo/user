"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { useYouTubeVideos } from "@/hooks/use-youtube-videos";
import {
  YouTubeVideoCard,
  YouTubeVideoCardSkeleton,
} from "@/components/youtube-video-card";
import { YouTubeDebug } from "@/components/youtube-debug";
import { YouTubeQuotaMonitor } from "@/components/youtube-quota-monitor";

interface YouTubeSectionProps {
  courseName: string;
  courseDescription?: string;
}

export function YouTubeSection({
  courseName,
  courseDescription,
}: YouTubeSectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [videoFilter, setVideoFilter] = useState("all");
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get YouTube videos using the API
  const {
    videos: youtubeVideos,
    loading: youtubeLoading,
    error: youtubeError,
    searchVideos: searchYouTubeVideos,
  } = useYouTubeVideos({
    courseName: courseName || "",
    topics: courseDescription ? [courseDescription] : [],
    enabled: !!courseName,
  });

  // Handle video search and filtering with debouncing
  const handleVideoSearch = async (query: string) => {
    if (query.trim()) {
      await searchYouTubeVideos(query);
    }
  };

  // Debounced search effect
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchTerm.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        handleVideoSearch(searchTerm);
      }, 500); // 500ms debounce
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  const filteredVideos = youtubeVideos.filter((video) => {
    const matchesSearch =
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.channel.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      videoFilter === "all" || video.relevance === videoFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-foreground">
          YouTube Video Suggestions
        </h2>
        <div className="flex gap-2">
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search videos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button
              onClick={() => handleVideoSearch(searchTerm)}
              disabled={youtubeLoading || !searchTerm.trim()}
              size="sm"
            >
              {youtubeLoading ? "Searching..." : "Search Now"}
            </Button>
          </div>
          <Select value={videoFilter} onValueChange={setVideoFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Videos</SelectItem>
              <SelectItem value="Highly Relevant">Highly Relevant</SelectItem>
              <SelectItem value="Relevant">Relevant</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Error State */}
      {youtubeError && (
        <div className="space-y-6">
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">
              Error loading videos: {youtubeError}
            </p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </div>

          {/* Debug Components */}
          <div className="flex flex-col lg:flex-row gap-4 justify-center">
            <YouTubeDebug apiKey={process.env.YOUTUBE_API_KEY} />
            <YouTubeQuotaMonitor />
          </div>
        </div>
      )}

      {/* Loading State */}
      {youtubeLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <YouTubeVideoCardSkeleton key={index} />
          ))}
        </div>
      )}

      {/* Videos Grid */}
      {!youtubeLoading && !youtubeError && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredVideos.length > 0 ? (
            filteredVideos.map((video) => (
              <YouTubeVideoCard
                key={video.id}
                video={video}
                onWatch={(video) => {
                  // Track video watch event if needed
                  console.log("Watching video:", video.title);
                  window.open(video.url, "_blank");
                }}
              />
            ))
          ) : (
            <div className="col-span-2 text-center py-8">
              <p className="text-muted-foreground mb-4">
                No videos found for this course.
              </p>
              <Button
                onClick={() => handleVideoSearch(`${courseName} tutorial`)}
                variant="outline"
              >
                Search for Videos
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
