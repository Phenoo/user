// YouTube API service for fetching educational videos
// You'll need to get a YouTube Data API v3 key from Google Cloud Console

export interface YouTubeVideo {
  id: string;
  title: string;
  channel: string;
  duration: string;
  thumbnail: string;
  relevance: "Highly Relevant" | "Relevant" | "Somewhat Relevant";
  description?: string;
  publishedAt?: string;
  viewCount?: string;
  likeCount?: string;
  url?: string;
}

export interface YouTubeSearchResponse {
  items: Array<{
    id: {
      videoId: string;
    };
    snippet: {
      title: string;
      channelTitle: string;
      description: string;
      thumbnails: {
        high: {
          url: string;
        };
        medium: {
          url: string;
        };
        default: {
          url: string;
        };
      };
      publishedAt: string;
    };
  }>;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
}

export interface YouTubeVideoDetailsResponse {
  items: Array<{
    id: string;
    contentDetails: {
      duration: string;
    };
    statistics: {
      viewCount: string;
      likeCount: string;
    };
  }>;
}

class YouTubeAPIService {
  private apiKey: string;
  private baseURL = "https://www.googleapis.com/youtube/v3";
  private cache = new Map<
    string,
    { data: YouTubeVideo[]; timestamp: number }
  >();
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  constructor() {
    // Get API key from environment variables
    this.apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || "";

    if (!this.apiKey) {
      console.warn(
        "YouTube API key not found. Please set NEXT_PUBLIC_YOUTUBE_API_KEY in your environment variables."
      );
    }
  }

  /**
   * Check if cached data is still valid
   */
  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_DURATION;
  }

  /**
   * Get cached data if available and valid
   */
  private getCachedData(key: string): YouTubeVideo[] | null {
    const cached = this.cache.get(key);
    if (cached && this.isCacheValid(cached.timestamp)) {
      console.log(`Using cached YouTube data for: ${key}`);
      return cached.data;
    }
    return null;
  }

  /**
   * Cache data with timestamp
   */
  private setCachedData(key: string, data: YouTubeVideo[]): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Convert ISO 8601 duration to readable format (e.g., PT15M32S -> 15:32)
   */
  private formatDuration(duration: string): string {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return "0:00";

    const hours = parseInt(match[1] || "0");
    const minutes = parseInt(match[2] || "0");
    const seconds = parseInt(match[3] || "0");

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  /**
   * Format view count (e.g., 1234567 -> 1.2M)
   */
  private formatViewCount(count: string): string {
    const num = parseInt(count);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  }

  /**
   * Determine relevance based on title and description keywords
   */
  private determineRelevance(
    title: string,
    description: string,
    searchQuery: string
  ): "Highly Relevant" | "Relevant" | "Somewhat Relevant" {
    const titleLower = title.toLowerCase();
    const descLower = description.toLowerCase();
    const queryLower = searchQuery.toLowerCase();

    // Extract key terms from search query
    const queryTerms = queryLower.split(" ").filter((term) => term.length > 2);

    // Count matches in title (higher weight)
    const titleMatches = queryTerms.filter((term) =>
      titleLower.includes(term)
    ).length;

    // Count matches in description (lower weight)
    const descMatches = queryTerms.filter((term) =>
      descLower.includes(term)
    ).length;

    const totalMatches = titleMatches * 2 + descMatches;
    const totalTerms = queryTerms.length * 2;

    const relevanceScore = totalMatches / totalTerms;

    if (relevanceScore >= 0.7) return "Highly Relevant";
    if (relevanceScore >= 0.4) return "Relevant";
    return "Somewhat Relevant";
  }

  /**
   * Search for videos based on course subject and topic
   */
  async searchVideos(
    query: string,
    maxResults: number = 10
  ): Promise<YouTubeVideo[]> {
    if (!this.apiKey) {
      console.error("YouTube API key not configured");
      return [];
    }

    // Check cache first
    const cacheKey = `search_${query}_${maxResults}`;
    const cachedData = this.getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      // Search for videos
      const searchResponse = await fetch(
        `${this.baseURL}/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${maxResults}&key=${this.apiKey}`
      );

      if (!searchResponse.ok) {
        const errorData = await searchResponse.json().catch(() => ({}));
        const errorMessage =
          errorData.error?.message || `HTTP ${searchResponse.status}`;
        const errorReason = errorData.error?.errors?.[0]?.reason || "unknown";

        console.error("YouTube API Search Error:", {
          status: searchResponse.status,
          statusText: searchResponse.statusText,
          error: errorData.error,
          query,
          apiKey: this.apiKey
            ? `${this.apiKey.substring(0, 10)}...`
            : "not set",
        });

        throw new Error(
          `YouTube API error (${searchResponse.status}): ${errorMessage}. Reason: ${errorReason}`
        );
      }

      const searchData: YouTubeSearchResponse = await searchResponse.json();

      if (!searchData.items || searchData.items.length === 0) {
        return [];
      }

      // Get video IDs for detailed information
      const videoIds = searchData.items
        .map((item) => item.id.videoId)
        .join(",");

      // Get video details (duration, view count, etc.)
      const detailsResponse = await fetch(
        `${this.baseURL}/videos?part=contentDetails,statistics&id=${videoIds}&key=${this.apiKey}`
      );

      if (!detailsResponse.ok) {
        const errorData = await detailsResponse.json().catch(() => ({}));
        const errorMessage =
          errorData.error?.message || `HTTP ${detailsResponse.status}`;
        const errorReason = errorData.error?.errors?.[0]?.reason || "unknown";

        console.error("YouTube API Details Error:", {
          status: detailsResponse.status,
          statusText: detailsResponse.statusText,
          error: errorData.error,
          videoIds,
          apiKey: this.apiKey
            ? `${this.apiKey.substring(0, 10)}...`
            : "not set",
        });

        throw new Error(
          `YouTube API error (${detailsResponse.status}): ${errorMessage}. Reason: ${errorReason}`
        );
      }

      const detailsData: YouTubeVideoDetailsResponse =
        await detailsResponse.json();

      // Combine search results with video details
      const videos: YouTubeVideo[] = searchData.items.map((item, index) => {
        const details = detailsData.items[index];
        const relevance = this.determineRelevance(
          item.snippet.title,
          item.snippet.description,
          query
        );

        return {
          id: item.id.videoId,
          title: item.snippet.title,
          channel: item.snippet.channelTitle,
          duration: details
            ? this.formatDuration(details.contentDetails.duration)
            : "0:00",
          thumbnail:
            item.snippet.thumbnails.high?.url ||
            item.snippet.thumbnails.medium?.url ||
            item.snippet.thumbnails.default?.url,
          relevance,
          description: item.snippet.description,
          publishedAt: item.snippet.publishedAt,
          viewCount: details
            ? this.formatViewCount(details.statistics.viewCount)
            : "0",
          likeCount: details
            ? this.formatViewCount(details.statistics.likeCount)
            : "0",
          url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        };
      });

      // Cache the results
      this.setCachedData(cacheKey, videos);
      return videos;
    } catch (error) {
      console.error("Error fetching YouTube videos:", error);
      return [];
    }
  }

  /**
   * Get educational videos for a specific course subject (Quota Optimized)
   */
  async getCourseVideos(
    courseName: string,
    topics: string[] = []
  ): Promise<YouTubeVideo[]> {
    // Use only the most effective search query to save quota
    const primaryQuery = `${courseName} tutorial`;

    try {
      // Single search request instead of multiple
      const videos = await this.searchVideos(primaryQuery, 8);

      // If we have topics, try one additional search
      if (topics.length > 0 && videos.length < 6) {
        const topicQuery = `${courseName} ${topics[0]} explained`;
        const additionalVideos = await this.searchVideos(topicQuery, 4);

        // Combine and remove duplicates
        const videoMap = new Map<string, YouTubeVideo>();
        [...videos, ...additionalVideos].forEach((video) => {
          if (!videoMap.has(video.id)) {
            videoMap.set(video.id, video);
          }
        });

        return Array.from(videoMap.values()).slice(0, 12);
      }

      return videos;
    } catch (error) {
      console.error("Error fetching course videos:", error);
      return [];
    }
  }

  /**
   * Get trending educational videos
   */
  async getTrendingEducationalVideos(): Promise<YouTubeVideo[]> {
    try {
      // Search for trending educational content
      const queries = [
        "educational tutorial",
        "online course",
        "study guide",
        "academic lecture",
        "learning tutorial",
      ];

      const allVideos = await Promise.all(
        queries.map((query) => this.searchVideos(query, 2))
      );

      // Flatten and remove duplicates
      const videoMap = new Map<string, YouTubeVideo>();
      allVideos.flat().forEach((video) => {
        if (!videoMap.has(video.id)) {
          videoMap.set(video.id, video);
        }
      });

      return Array.from(videoMap.values()).slice(0, 8);
    } catch (error) {
      console.error("Error fetching trending videos:", error);
      return [];
    }
  }
}

// Export singleton instance
export const youtubeAPI = new YouTubeAPIService();

// Export the class for testing
export default YouTubeAPIService;
