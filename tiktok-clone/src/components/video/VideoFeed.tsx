"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { VideoCard } from "./VideoCard";
import type { VideoWithAuthor } from "@/types";

interface VideoFeedProps {
  initialVideos?: VideoWithAuthor[];
  feedType?: "for-you" | "following" | "trending";
}

export function VideoFeed({ initialVideos = [], feedType = "for-you" }: VideoFeedProps) {
  const [videos, setVideos] = useState<VideoWithAuthor[]>(initialVideos ?? []);
  const [activeIndex, setActiveIndex] = useState(0);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState((initialVideos ?? []).length === 0);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const fetchVideos = useCallback(
    async (cursor?: string) => {
      try {
        setLoading(true);
        const params = new URLSearchParams({ type: feedType, limit: "5" });
        if (cursor) params.set("cursor", cursor);
        const res = await fetch(`/api/videos?${params}`);
        const data = await res.json();
        setVideos((prev) => (cursor ? [...prev, ...(data.items ?? [])] : (data.items ?? [])));
        setNextCursor(data.nextCursor);
        setHasMore(data.hasMore);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [feedType]
  );

  useEffect(() => {
    if ((initialVideos ?? []).length === 0) fetchVideos();
  }, [fetchVideos, initialVideos]);

  // Intersection observer for each video slide
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const slides = container.querySelectorAll("[data-video-index]");
    observerRef.current?.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = parseInt((entry.target as HTMLElement).dataset.videoIndex ?? "0");
            setActiveIndex(idx);
            // Prefetch more when near end
            if (idx >= videos.length - 2 && hasMore && !loading) {
              fetchVideos(nextCursor);
            }
          }
        });
      },
      { threshold: 0.6 }
    );

    slides.forEach((s) => observerRef.current?.observe(s));
    return () => observerRef.current?.disconnect();
  }, [videos, hasMore, loading, nextCursor, fetchVideos]);

  if (loading && (videos ?? []).length === 0) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-brand-pink border-t-transparent rounded-full animate-spin" />
          <p className="text-white/40 text-sm">Loading videos…</p>
        </div>
      </div>
    );
  }

  if ((videos ?? []).length === 0) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">🎬</p>
          <p className="text-white/60 text-lg font-medium">No videos yet</p>
          <p className="text-white/30 text-sm mt-2">Be the first to upload!</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-screen overflow-y-scroll snap-mandatory no-scrollbar"
    >
      {videos.map((video, index) => (
        <div key={video.id} data-video-index={index} className="h-screen snap-start">
          <VideoCard video={video} isActive={activeIndex === index} />
        </div>
      ))}
      {loading && (
        <div className="h-20 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-brand-pink border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {!hasMore && videos.length > 0 && (
        <div className="h-20 flex items-center justify-center">
          <p className="text-white/30 text-sm">You&apos;ve seen it all!</p>
        </div>
      )}
    </div>
  );
}
