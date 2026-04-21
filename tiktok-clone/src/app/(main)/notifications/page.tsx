"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { Bell, Heart, MessageCircle, UserPlus, Tv, Trash2 } from "lucide-react";
import { timeAgo } from "@/lib/utils";

const TYPE_ICONS: Record<string, React.ReactNode> = {
  LIKE: <Heart size={16} className="text-brand-pink fill-brand-pink" />,
  COMMENT: <MessageCircle size={16} className="text-brand-cyan" />,
  FOLLOW: <UserPlus size={16} className="text-green-400" />,
  LIVE_START: <Tv size={16} className="text-red-400" />,
  MENTION: <Bell size={16} className="text-yellow-400" />,
  VIDEO_UPLOAD: <Bell size={16} className="text-purple-400" />,
  SYSTEM: <Bell size={16} className="text-white/60" />,
};

const TYPE_LABELS: Record<string, string> = {
  LIKE: "liked your video",
  COMMENT: "commented on your video",
  FOLLOW: "started following you",
  LIVE_START: "went live",
  MENTION: "mentioned you",
  VIDEO_UPLOAD: "uploaded a new video",
  SYSTEM: "system notification",
};

export default function NotificationsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) return;
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => { setNotifications(d.items ?? []); setLoading(false); });
  }, [session]);

  const clearAll = async () => {
    await fetch("/api/notifications", { method: "DELETE" });
    setNotifications([]);
  };

  if (!session?.user) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <Bell size={48} className="text-white/20 mx-auto mb-4" />
          <p className="text-white/40">Sign in to see notifications</p>
          <Link href="/login" className="btn-primary mt-4 inline-flex">Sign in</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {notifications.length > 0 && (
          <button onClick={clearAll} className="flex items-center gap-1.5 text-white/40 hover:text-red-400 text-sm transition-colors">
            <Trash2 size={14} />Clear all
          </button>
        )}
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-brand-pink border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && notifications.length === 0 && (
        <div className="text-center py-20">
          <Bell size={64} className="text-white/10 mx-auto mb-4" />
          <p className="text-white/40 font-medium">No notifications yet</p>
          <p className="text-white/20 text-sm mt-1">When someone likes or follows you, you&apos;ll see it here</p>
        </div>
      )}

      <div className="space-y-1">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${n.isRead ? "hover:bg-white/5" : "bg-brand-pink/5 hover:bg-brand-pink/10"}`}
          >
            {/* Sender avatar */}
            <Link href={n.sender ? `/profile/${n.sender.username}` : "#"} className="flex-shrink-0 relative">
              <div className="w-12 h-12 rounded-full bg-white/10 overflow-hidden">
                {n.sender?.image ? (
                  <Image src={n.sender.image} alt={n.sender.name ?? ""} width={48} height={48} className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lg font-bold">
                    {(n.sender?.name ?? "S")[0]}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-brand-dark-2 flex items-center justify-center">
                {TYPE_ICONS[n.type] ?? <Bell size={12} />}
              </div>
            </Link>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm">
                {n.sender && (
                  <Link href={`/profile/${n.sender.username}`} className="font-semibold hover:underline">
                    @{n.sender.username ?? n.sender.name}
                  </Link>
                )}{" "}
                <span className="text-white/70">{TYPE_LABELS[n.type] ?? n.message}</span>
              </p>
              <p className="text-white/30 text-xs mt-0.5">{timeAgo(n.createdAt)}</p>
            </div>

            {/* Video thumbnail */}
            {n.video?.thumbnailUrl && (
              <Link href={`/video/${n.video.id}`} className="flex-shrink-0">
                <div className="w-10 h-14 rounded overflow-hidden bg-white/10">
                  <Image src={n.video.thumbnailUrl} alt="" width={40} height={56} className="object-cover" />
                </div>
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
