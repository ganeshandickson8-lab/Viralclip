"use client";

import { useState, useCallback } from "react";
import type { VideoWithAuthor, FeedType } from "@/types";

export function useVideoFeed(feedType: FeedType = "for-you") {
  const [videos, setVideos] = useState<VideoWithAuthor[]>([]);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ type: feedType, limit: "5" });
      if (nextCursor) params.set("cursor", nextCursor);
      const res = await fetch(`/api/videos?${params}`);
      if (!res.ok) throw new Error("Failed to fetch videos");
      const data = await res.json();
      setVideos((prev) => [...prev, ...data.items]);
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, nextCursor, feedType]);

  const reset = useCallback(() => {
    setVideos([]);
    setNextCursor(undefined);
    setHasMore(true);
    setError(null);
  }, []);

  return { videos, hasMore, loading, error, fetchMore, reset };
}
