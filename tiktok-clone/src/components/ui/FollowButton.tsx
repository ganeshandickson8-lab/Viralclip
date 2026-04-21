"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { UserPlus, UserCheck } from "lucide-react";

interface FollowButtonProps {
  targetUserId: string;
  initialFollowing: boolean;
  compact?: boolean;
}

export function FollowButton({ targetUserId, initialFollowing, compact = false }: FollowButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!session?.user) { router.push("/login"); return; }
    setLoading(true);
    const prev = following;
    setFollowing(!prev);
    try {
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId }),
      });
      const data = await res.json();
      setFollowing(data.following ?? !prev);
    } catch {
      setFollowing(prev);
    } finally {
      setLoading(false);
    }
  };

  if (compact) {
    return (
      <button
        onClick={handleClick}
        disabled={loading}
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center transition-all",
          following
            ? "bg-white/10 hover:bg-white/20"
            : "bg-brand-pink hover:bg-red-500"
        )}
      >
        {following
          ? <UserCheck size={14} className="text-white" />
          : <UserPlus size={14} className="text-white" />}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={cn(
        "font-semibold text-sm px-5 py-1.5 rounded-full transition-all active:scale-95 disabled:opacity-60 flex items-center gap-1.5",
        following
          ? "border border-white/30 hover:border-white/60 text-white bg-transparent"
          : "bg-brand-pink hover:bg-red-500 text-white"
      )}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : following ? (
        <><UserCheck size={14} />Following</>
      ) : (
        <><UserPlus size={14} />Follow</>
      )}
    </button>
  );
}
