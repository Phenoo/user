"use client";

import { useState, useEffect, useCallback } from "react";
import {
  type YouTubeVideo,
  searchYouTubeVideos,
  getCourseVideos,
  getTrendingEducationalVideos,
} from "@/app/actions/youtube";

interface UseYouTubeVideosProps {
  courseName: string;
  topics?: string[];
  enabled?: boolean;
}

interface UseYouTubeVideosReturn {
  videos: YouTubeVideo[];
  loading: boolean;
  error: string | null;
  searchVideos: (query: string) => Promise<void>;
  refreshVideos: () => Promise<void>;
}

const generateCacheKey = (courseName: string, topics: string[] = []) => {
  return `youtube-videos-${courseName}-${topics.join("-")}`;
};

const getCachedVideos = (cacheKey: string): YouTubeVideo[] | null => {
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      // Cache expires after 24 hours
      const isExpired = Date.now() - timestamp > 24 * 60 * 60 * 1000;
      if (!isExpired) {
        return data;
      } else {
        localStorage.removeItem(cacheKey);
      }
    }
  } catch (error) {
    console.error("Error reading from cache:", error);
  }
  return null;
};

const setCachedVideos = (cacheKey: string, videos: YouTubeVideo[]) => {
  try {
    const cacheData = {
      data: videos,
      timestamp: Date.now(),
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch (error) {
    console.error("Error writing to cache:", error);
  }
};

const getCachedSearchResults = (query: string): YouTubeVideo[] | null => {
  const cacheKey = `youtube-search-${query.toLowerCase().replace(/\s+/g, "-")}`;
  return getCachedVideos(cacheKey);
};

const setCachedSearchResults = (query: string, videos: YouTubeVideo[]) => {
  const cacheKey = `youtube-search-${query.toLowerCase().replace(/\s+/g, "-")}`;
  setCachedVideos(cacheKey, videos);
};

export function useYouTubeVideos({
  courseName,
  topics = [],
  enabled = true,
}: UseYouTubeVideosProps): UseYouTubeVideosReturn {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  const searchVideos = useCallback(async (query: string) => {
    if (!query.trim()) return;

    // Check cache first
    const cachedResults = getCachedSearchResults(query);
    if (cachedResults) {
      setVideos(cachedResults);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const searchResults = await searchYouTubeVideos(query, 12);
      setVideos(searchResults);
      // Cache the search results
      setCachedSearchResults(query, searchResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search videos");
      console.error("Error searching YouTube videos:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshVideos = useCallback(async () => {
    const cacheKey = generateCacheKey(courseName, topics);

    // Clear cache for this course
    localStorage.removeItem(cacheKey);

    setHasFetched(false);
    setLoading(true);
    setError(null);

    try {
      const fetchedVideos = await getCourseVideos(courseName, topics);
      setVideos(fetchedVideos);
      setHasFetched(true);

      // Cache the fresh results
      setCachedVideos(cacheKey, fetchedVideos);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch videos");
      console.error("Error fetching YouTube videos:", err);
    } finally {
      setLoading(false);
    }
  }, [courseName, topics]);

  useEffect(() => {
    if (enabled && courseName && !hasFetched) {
      const cacheKey = generateCacheKey(courseName, topics);

      // Check cache first
      const cachedVideos = getCachedVideos(cacheKey);
      if (cachedVideos) {
        setVideos(cachedVideos);
        setHasFetched(true);
        return;
      }

      setLoading(true);
      setError(null);

      getCourseVideos(courseName, topics)
        .then((fetchedVideos) => {
          setVideos(fetchedVideos);
          setHasFetched(true);
          // Cache the results
          setCachedVideos(cacheKey, fetchedVideos);
        })
        .catch((err) => {
          setError(
            err instanceof Error ? err.message : "Failed to fetch videos"
          );
          console.error("Error fetching YouTube videos:", err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [enabled, courseName, topics, hasFetched]);

  return {
    videos,
    loading,
    error,
    searchVideos,
    refreshVideos,
  };
}

// Hook for trending educational videos
export function useTrendingYouTubeVideos() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrendingVideos = useCallback(async () => {
    const cacheKey = "youtube-trending-educational";

    // Check cache first
    const cachedVideos = getCachedVideos(cacheKey);
    if (cachedVideos) {
      setVideos(cachedVideos);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const trendingVideos = await getTrendingEducationalVideos();
      setVideos(trendingVideos);
      // Cache the results
      setCachedVideos(cacheKey, trendingVideos);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch trending videos"
      );
      console.error("Error fetching trending YouTube videos:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrendingVideos();
  }, [fetchTrendingVideos]);

  return {
    videos,
    loading,
    error,
    refreshVideos: fetchTrendingVideos,
  };
}

export const clearYouTubeCaches = () => {
  const keys = Object.keys(localStorage);
  keys.forEach((key) => {
    if (
      key.startsWith("youtube-videos-") ||
      key.startsWith("youtube-search-") ||
      key === "youtube-trending-educational"
    ) {
      localStorage.removeItem(key);
    }
  });
};

// import { useState, useEffect, useCallback, useRef } from "react";
// import { youtubeAPI, YouTubeVideo } from "@/lib/youtube-api";

// interface UseYouTubeVideosProps {
//   courseName: string;
//   topics?: string[];
//   enabled?: boolean;
// }

// interface UseYouTubeVideosReturn {
//   videos: YouTubeVideo[];
//   loading: boolean;
//   error: string | null;
//   searchVideos: (query: string) => Promise<void>;
//   refreshVideos: () => Promise<void>;
// }

// export function useYouTubeVideos({
//   courseName,
//   topics = [],
//   enabled = true,
// }: UseYouTubeVideosProps): UseYouTubeVideosReturn {
//   const [videos, setVideos] = useState<YouTubeVideo[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [hasFetched, setHasFetched] = useState(false);

//   const searchVideos = useCallback(async (query: string) => {
//     if (!query.trim()) return;

//     setLoading(true);
//     setError(null);

//     try {
//       const searchResults = await youtubeAPI.searchVideos(query, 12);
//       setVideos(searchResults);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Failed to search videos");
//       console.error("Error searching YouTube videos:", err);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   const refreshVideos = useCallback(async () => {
//     setHasFetched(false);
//     setLoading(true);
//     setError(null);

//     try {
//       const fetchedVideos = await youtubeAPI.getCourseVideos(
//         courseName,
//         topics
//       );
//       setVideos(fetchedVideos);
//       setHasFetched(true);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Failed to fetch videos");
//       console.error("Error fetching YouTube videos:", err);
//     } finally {
//       setLoading(false);
//     }
//   }, [courseName, topics]);

//   // Fetch videos only once when component mounts
//   useEffect(() => {
//     if (enabled && courseName && !hasFetched) {
//       setLoading(true);
//       setError(null);

//       youtubeAPI
//         .getCourseVideos(courseName, topics)
//         .then((fetchedVideos) => {
//           setVideos(fetchedVideos);
//           setHasFetched(true);
//         })
//         .catch((err) => {
//           setError(
//             err instanceof Error ? err.message : "Failed to fetch videos"
//           );
//           console.error("Error fetching YouTube videos:", err);
//         })
//         .finally(() => {
//           setLoading(false);
//         });
//     }
//   }, [enabled, courseName, topics, hasFetched]);

//   return {
//     videos,
//     loading,
//     error,
//     searchVideos,
//     refreshVideos,
//   };
// }

// // Hook for trending educational videos
// export function useTrendingYouTubeVideos() {
//   const [videos, setVideos] = useState<YouTubeVideo[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const fetchTrendingVideos = useCallback(async () => {
//     setLoading(true);
//     setError(null);

//     try {
//       const trendingVideos = await youtubeAPI.getTrendingEducationalVideos();
//       setVideos(trendingVideos);
//     } catch (err) {
//       setError(
//         err instanceof Error ? err.message : "Failed to fetch trending videos"
//       );
//       console.error("Error fetching trending YouTube videos:", err);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchTrendingVideos();
//   }, [fetchTrendingVideos]);

//   return {
//     videos,
//     loading,
//     error,
//     refreshVideos: fetchTrendingVideos,
//   };
// }
