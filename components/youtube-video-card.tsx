"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, ExternalLink, Eye, ThumbsUp, Calendar } from "lucide-react";
import { YouTubeVideo } from "@/lib/youtube-api";

interface YouTubeVideoCardProps {
  video: YouTubeVideo;
  onWatch?: (video: YouTubeVideo) => void;
  className?: string;
}

export function YouTubeVideoCard({
  video,
  onWatch,
  className,
}: YouTubeVideoCardProps) {
  const handleWatchClick = () => {
    if (onWatch) {
      onWatch(video);
    } else {
      // Default behavior: open in new tab
      window.open(video.url, "_blank");
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getRelevanceColor = (relevance: string) => {
    switch (relevance) {
      case "Highly Relevant":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Relevant":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "Somewhat Relevant":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <Card className={`hover:shadow-lg transition-shadow ${className}`}>
      <CardContent className="p-0">
        {/* Video Thumbnail */}
        <div className="aspect-video relative group">
          <img
            src={video.thumbnail || "/placeholder.jpg"}
            alt={video.title}
            className="w-full h-full object-cover rounded-t-lg"
            loading="lazy"
          />

          {/* Play Button Overlay */}
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="lg"
              className="rounded-full bg-red-600 hover:bg-red-700"
              onClick={handleWatchClick}
            >
              <Play className="h-6 w-6" />
            </Button>
          </div>

          {/* Duration Badge */}
          <Badge className="absolute bottom-2 right-2 bg-black/80 text-white">
            {video.duration}
          </Badge>

          {/* Relevance Badge */}
          <Badge
            className={`absolute top-2 right-2 ${getRelevanceColor(video.relevance)}`}
          >
            {video.relevance}
          </Badge>
        </div>

        {/* Video Info */}
        <div className="p-4 space-y-3">
          {/* Title */}
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-semibold text-balance leading-tight line-clamp-2">
              {video.title}
            </h3>
          </div>

          {/* Channel */}
          <p className="text-muted-foreground text-sm font-medium">
            {video.channel}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {video.viewCount && (
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {video.viewCount} views
              </div>
            )}
            {video.likeCount && (
              <div className="flex items-center gap-1">
                <ThumbsUp className="h-3 w-3" />
                {video.likeCount}
              </div>
            )}
            {video.publishedAt && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(video.publishedAt)}
              </div>
            )}
          </div>

          {/* Description Preview */}
          {video.description && (
            <p className="text-muted-foreground text-xs line-clamp-2">
              {video.description}
            </p>
          )}

          {/* Action Button */}
          <Button
            variant="outline"
            size="sm"
            className="w-full bg-transparent hover:bg-red-50 hover:text-red-600 hover:border-red-200"
            onClick={handleWatchClick}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Watch on YouTube
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Loading skeleton component
export function YouTubeVideoCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardContent className="p-0">
        <div className="aspect-video bg-gray-200 rounded-t-lg"></div>
        <div className="p-4 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          <div className="flex gap-2">
            <div className="h-3 bg-gray-200 rounded w-16"></div>
            <div className="h-3 bg-gray-200 rounded w-12"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      </CardContent>
    </Card>
  );
}
