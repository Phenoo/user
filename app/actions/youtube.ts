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

class YouTubeAPI {
  private apiKey: string;
  private baseUrl = "https://www.googleapis.com/youtube/v3";

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || "";
  }

  async searchVideos(query: string, maxResults = 12): Promise<YouTubeVideo[]> {
    if (!this.apiKey) {
      throw new Error("YouTube API key is not configured");
    }

    const searchUrl = `${this.baseUrl}/search?part=snippet&type=video&q=${encodeURIComponent(query)}&maxResults=${maxResults}&key=${this.apiKey}`;

    const response = await fetch(searchUrl);
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();

    return data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.medium.url,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      duration: "N/A",
      publishedAt: item.snippet.publishedAt,
      viewCount: "N/A",
      relevance: "Relevant" as const,
      description: item.snippet.description,
    }));
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
    throw error;
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
    throw error;
  }
}

export async function getTrendingEducationalVideos(): Promise<YouTubeVideo[]> {
  try {
    return await youtubeAPI.getTrendingEducationalVideos();
  } catch (error) {
    console.error("Error fetching trending videos:", error);
    throw error;
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
