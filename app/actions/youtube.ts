"use server";

// YouTube API interface and types
export interface YouTubeVideo {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
  url: string;
  duration: string;
  publishedAt: string;
  viewCount: string;
  relevance: "Highly Relevant" | "Relevant" | "Somewhat Relevant";
  description: string;
}

const FALLBACK_VIDEOS: YouTubeVideo[] = [
  {
    id: "rfscVS0vtbw",
    title: "Computer Science & Academic Study Guide Overview",
    channel: "CS50 / Educational Tutorials",
    thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60",
    url: "https://www.youtube.com/watch?v=rfscVS0vtbw",
    duration: "1:59:00",
    publishedAt: new Date().toISOString(),
    viewCount: "2.4M",
    relevance: "Highly Relevant",
    description: "Comprehensive introduction and tutorial overview for academic courses and study subjects.",
  },
  {
    id: "WUvTyaaNkzM",
    title: "Core Concepts & Problem Solving Tutorial",
    channel: "3Blue1Brown / Academic Guides",
    thumbnail: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&auto=format&fit=crop&q=60",
    url: "https://www.youtube.com/watch?v=WUvTyaaNkzM",
    duration: "17:00",
    publishedAt: new Date().toISOString(),
    viewCount: "1.5M",
    relevance: "Relevant",
    description: "In-depth explanation of core course fundamentals, principles, and practice problems.",
  },
  {
    id: "ukLnPbI6ngy",
    title: "Effective Study Techniques & Exam Preparation",
    channel: "Academic Success Hub",
    thumbnail: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500&auto=format&fit=crop&q=60",
    url: "https://www.youtube.com/watch?v=ukLnPbI6ngy",
    duration: "12:45",
    publishedAt: new Date().toISOString(),
    viewCount: "850K",
    relevance: "Relevant",
    description: "Proven learning strategies, active recall, and spaced repetition methods for students.",
  },
];

class YouTubeAPI {
  private apiKey: string;
  private baseUrl = "https://www.googleapis.com/youtube/v3";

  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY || "";
  }

  async searchVideos(query: string, maxResults = 12): Promise<YouTubeVideo[]> {
    if (!this.apiKey) {
      console.warn("YouTube API key is not configured. Returning fallback educational content.");
      return FALLBACK_VIDEOS;
    }

    try {
      const searchUrl = `${this.baseUrl}/search?part=snippet&type=video&q=${encodeURIComponent(query)}&maxResults=${maxResults}&key=${this.apiKey}`;

      const response = await fetch(searchUrl);
      if (!response.ok) {
        console.warn(`YouTube API response error (${response.status}). Returning fallback educational videos.`);
        return FALLBACK_VIDEOS;
      }

      const data = await response.json();
      if (!data.items || !Array.isArray(data.items)) {
        return FALLBACK_VIDEOS;
      }

      return data.items.map((item: any) => ({
        id: item.id?.videoId || Math.random().toString(),
        title: item.snippet?.title || "Educational Tutorial",
        channel: item.snippet?.channelTitle || "Educational Channel",
        thumbnail: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url || "",
        url: `https://www.youtube.com/watch?v=${item.id?.videoId || ""}`,
        duration: "N/A",
        publishedAt: item.snippet?.publishedAt || new Date().toISOString(),
        viewCount: "N/A",
        relevance: "Relevant" as const,
        description: item.snippet?.description || "",
      }));
    } catch (error) {
      console.error("Failed to query YouTube API:", error);
      return FALLBACK_VIDEOS;
    }
  }

  async getCourseVideos(
    courseName: string,
    topics: string[] = []
  ): Promise<YouTubeVideo[]> {
    const searchQuery = `${courseName} ${topics.join(" ")} tutorial course`;
    return this.searchVideos(searchQuery, 12);
  }

  async getTrendingEducationalVideos(): Promise<YouTubeVideo[]> {
    return this.searchVideos("educational tutorial programming", 12);
  }
}

const youtubeAPI = new YouTubeAPI();

export async function searchYouTubeVideos(
  query: string,
  maxResults = 12
): Promise<YouTubeVideo[]> {
  try {
    return await youtubeAPI.searchVideos(query, maxResults);
  } catch (error) {
    console.error("Error searching YouTube videos:", error);
    return FALLBACK_VIDEOS;
  }
}

export async function getCourseVideos(
  courseName: string,
  topics: string[] = []
): Promise<YouTubeVideo[]> {
  try {
    return await youtubeAPI.getCourseVideos(courseName, topics);
  } catch (error) {
    console.error("Error fetching course videos:", error);
    return FALLBACK_VIDEOS;
  }
}

export async function getTrendingEducationalVideos(): Promise<YouTubeVideo[]> {
  try {
    return await youtubeAPI.getTrendingEducationalVideos();
  } catch (error) {
    console.error("Error fetching trending videos:", error);
    return FALLBACK_VIDEOS;
  }
}

export async function checkYouTubeAPIStatus(): Promise<{
  apiKeyStatus: "valid" | "invalid" | "missing";
  quotaStatus: "available" | "exceeded" | "unknown";
  lastError?: string;
}> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey || apiKey.trim() === "") {
    return {
      apiKeyStatus: "missing",
      quotaStatus: "unknown",
    };
  }

  if (!apiKey.startsWith("AIza") || apiKey.length !== 39) {
    return {
      apiKeyStatus: "invalid",
      quotaStatus: "unknown",
    };
  }

  try {
    const testUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=test&maxResults=1&key=${apiKey}`;
    const response = await fetch(testUrl);

    if (response.ok) {
      return {
        apiKeyStatus: "valid",
        quotaStatus: "available",
      };
    } else if (response.status === 403) {
      const errorData = await response.json();
      if (errorData.error?.errors?.[0]?.reason === "quotaExceeded") {
        return {
          apiKeyStatus: "valid",
          quotaStatus: "exceeded",
        };
      } else {
        return {
          apiKeyStatus: "valid",
          quotaStatus: "unknown",
          lastError: `API Error: ${response.status}`,
        };
      }
    } else {
      return {
        apiKeyStatus: "valid",
        quotaStatus: "unknown",
        lastError: `HTTP ${response.status}: ${response.statusText}`,
      };
    }
  } catch (error) {
    return {
      apiKeyStatus: "valid",
      quotaStatus: "unknown",
      lastError: error instanceof Error ? error.message : "Network error",
    };
  }
}
