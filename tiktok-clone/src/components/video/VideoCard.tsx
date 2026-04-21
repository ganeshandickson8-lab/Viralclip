"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Heart, MessageCircle, Share2, Music2,
  Volume2, VolumeX, Pause, Play, CheckCircle2,
} from "lucide-react";
import { cn, formatCount, timeAgo } from "@/lib/utils";
import type { VideoWithAuthor } from "@/types";

interface VideoCardProps {
  video: VideoWithAuthor;
  isActive: boolean;
}

export function VideoCard({ video, isActive }: VideoCardProps) {
  const { data: session } = useSession();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [liked, setLiked] = useState(video.isLiked ?? false);
  const [likeCount, setLikeCount] = useState(video.likeCount);
  const [heartAnim, setHeartAnim] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [progress, setProgress] = useState(0);

  // Play/pause based on active state
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isActive) {
      v.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      v.pause();
      v.currentTime = 0;
      setPlaying(false);
    }
  }, [isActive]);

  // Track view after 3 seconds
  useEffect(() => {
    if (!isActive) return;
    const timer = setTimeout(() => {
      fetch("/api/videos/view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId: video.id }),
      }).catch(() => {});
    }, 3000);
    return () => clearTimeout(timer);
  }, [isActive, video.id]);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else { v.pause(); setPlaying(false); }
  }, []);

  const handleDoubleTap = useCallback(() => {
    if (!session?.user) return;
    setHeartAnim(true);
    setTimeout(() => setHeartAnim(false), 800);
    if (!liked) handleLike();
  }, [liked, session]);

  const handleLike = useCallback(async () => {
    if (!session?.user) return;
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((c) => c + (newLiked ? 1 : -1));
    try {
      await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId: video.id }),
      });
    } catch {
      setLiked(!newLiked);
      setLikeCount((c) => c + (newLiked ? -1 : 1));
    }
  }, [liked, session, video.id]);

  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}/video/${video.id}`;
    if (navigator.share) {
      await navigator.share({ title: video.title, url });
    } else {
      await navigator.clipboard.writeText(url);
    }
  }, [video.id, video.title]);

  return (
    <div className="relative h-screen w-full snap-start flex items-center justify-center bg-black overflow-hidden">
      {/* Video */}
      <video
        ref={videoRef}
        src={video.videoUrl}
        poster={video.thumbnailUrl ?? undefined}
        className="h-full w-full object-cover"
        loop
        muted={muted}
        playsInline
        onClick={togglePlay}
        onDoubleClick={handleDoubleTap}
        onTimeUpdate={(e) => {
          const v = e.currentTarget;
          if (v.duration) setProgress((v.currentTime / v.duration) * 100);
        }}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 video-gradient-bottom pointer-events-none" />

      {/* Double-tap heart */}
      {heartAnim && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Heart
            size={100}
            className="text-brand-pink fill-brand-pink animate-heart-burst drop-shadow-2xl"
          />
        </div>
      )}

      {/* Play/pause overlay */}
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-black/40 flex items-center justify-center backdrop-blur-sm">
            <Play size={32} className="text-white ml-1" fill="white" />
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20">
        <div className="h-full bg-brand-pink transition-all duration-100" style={{ width: `${progress}%` }} />
      </div>

      {/* Right action buttons */}
      <div className="absolute right-3 bottom-24 flex flex-col items-center gap-5">
        {/* Avatar */}
        <Link href={`/profile/${video.author.username}`} className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden">
            {video.author.image ? (
              <Image src={video.author.image} alt={video.author.name ?? "user"} width={48} height={48} className="object-cover" />
            ) : (
              <div className="w-full h-full bg-brand-pink/30 flex items-center justify-center text-lg font-bold">
                {(video.author.name ?? "U")[0]}
              </div>
            )}
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-brand-pink flex items-center justify-center text-white text-xs font-bold">+</div>
        </Link>

        {/* Like */}
        <button onClick={handleLike} className="flex flex-col items-center gap-1">
          <div className={cn("w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center transition-transform active:scale-90", liked && "animate-heart-burst")}>
            <Heart size={22} className={cn("transition-colors", liked ? "text-brand-pink fill-brand-pink" : "text-white")} />
          </div>
          <span className="text-white text-xs font-semibold drop-shadow">{formatCount(likeCount)}</span>
        </button>

        {/* Comment */}
        <button onClick={() => setShowComments(true)} className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
            <MessageCircle size={22} className="text-white" />
          </div>
          <span className="text-white text-xs font-semibold drop-shadow">{formatCount(video.commentCount)}</span>
        </button>

        {/* Share */}
        <button onClick={handleShare} className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
            <Share2 size={20} className="text-white" />
          </div>
          <span className="text-white text-xs font-semibold drop-shadow">{formatCount(video.shareCount)}</span>
        </button>

        {/* Mute toggle */}
        <button onClick={() => setMuted((m) => !m)} className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
          {muted ? <VolumeX size={20} className="text-white" /> : <Volume2 size={20} className="text-white" />}
        </button>
      </div>

      {/* Bottom meta */}
      <div className="absolute left-3 right-16 bottom-20 pointer-events-none">
        <Link href={`/profile/${video.author.username}`} className="flex items-center gap-1.5 mb-2 pointer-events-auto">
          <span className="font-bold text-white text-sm drop-shadow">@{video.author.username ?? video.author.name}</span>
          {video.author.isVerified && <CheckCircle2 size={14} className="text-brand-cyan" />}
        </Link>
        <p className="text-white text-sm leading-relaxed line-clamp-2 drop-shadow mb-2">{video.title}</p>
        {video.description && (
          <p className="text-white/80 text-xs line-clamp-1 mb-2">{video.description}</p>
        )}
        <div className="flex items-center gap-1.5">
          <Music2 size={12} className="text-white/70 animate-spin-slow" />
          <span className="text-white/70 text-xs">{video.author.name} • original sound</span>
        </div>
        <p className="text-white/40 text-xs mt-1">{timeAgo(video.createdAt)}</p>
      </div>

      {/* Comments Drawer */}
      {showComments && (
        <CommentsDrawer videoId={video.id} onClose={() => setShowComments(false)} />
      )}
    </div>
  );
}

// ─── Comments Drawer ──────────────────────────────────────────────────────────

function CommentsDrawer({ videoId, onClose }: { videoId: string; onClose: () => void }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/comments?videoId=${videoId}`)
      .then((r) => r.json())
      .then((d) => { setComments(d.items ?? []); setLoading(false); });
  }, [videoId]);

  const submit = async () => {
    if (!text.trim() || !session?.user) return;
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId, text }),
    });
    const data = await res.json();
    if (data.data) { setComments((c) => [data.data, ...c]); setText(""); }
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col" onClick={onClose}>
      <div className="flex-1" />
      <div
        className="bg-brand-dark-2 rounded-t-3xl h-[70vh] flex flex-col animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h3 className="font-semibold text-white">Comments</h3>
          <button onClick={onClose} className="text-white/50 hover:text-white text-sm">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
          {loading ? (
            <p className="text-white/40 text-sm text-center py-8">Loading…</p>
          ) : comments.length === 0 ? (
            <p className="text-white/40 text-sm text-center py-8">No comments yet. Be the first!</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-pink/20 flex-shrink-0 flex items-center justify-center text-xs font-bold">
                  {(c.user?.name ?? "U")[0]}
                </div>
                <div>
                  <p className="text-xs font-semibold text-white/80">@{c.user?.username ?? c.user?.name}</p>
                  <p className="text-sm text-white mt-0.5">{c.text}</p>
                  <p className="text-xs text-white/30 mt-1">{timeAgo(c.createdAt)}</p>
                </div>
              </div>
            ))
          )}
        </div>
        {session?.user ? (
          <div className="px-4 py-3 border-t border-white/10 flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="Add comment…"
              className="input flex-1 text-sm"
            />
            <button onClick={submit} disabled={!text.trim()} className="btn-primary text-sm px-4 py-2">Post</button>
          </div>
        ) : (
          <p className="text-center text-white/40 text-sm py-3">
            <Link href="/login" className="text-brand-pink">Sign in</Link> to comment
          </p>
        )}
      </div>
    </div>
  );
}
