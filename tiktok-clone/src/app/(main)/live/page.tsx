"use client";

import { useState } from "react";
import { Tv, Radio, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

const MOCK_LIVE_STREAMS = [
  { id: "1", username: "creator_one", title: "🎮 Gaming live – come hang!", viewers: 4821, avatar: null },
  { id: "2", username: "music_vibes", title: "🎵 Chill beats session", viewers: 2103, avatar: null },
  { id: "3", username: "chef_daily", title: "🍜 Cooking ramen from scratch!", viewers: 987, avatar: null },
  { id: "4", username: "travel_tok", title: "✈️ Live from Bali beach", viewers: 3412, avatar: null },
  { id: "5", username: "fitness_fam", title: "💪 Morning workout – join me!", viewers: 654, avatar: null },
  { id: "6", username: "art_studio", title: "🎨 Painting time-lapse LIVE", viewers: 1209, avatar: null },
];

function formatViewers(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

export default function LivePage() {
  const { data: session } = useSession();
  const [goLiveModal, setGoLiveModal] = useState(false);
  const [title, setTitle] = useState("");

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-brand-pink live-dot" />
          <h1 className="text-2xl font-bold">LIVE</h1>
        </div>
        {session?.user && (
          <button onClick={() => setGoLiveModal(true)} className="btn-primary flex items-center gap-2 text-sm py-2">
            <Radio size={14} />Go Live
          </button>
        )}
      </div>

      {/* Live grid */}
      <div className="grid grid-cols-2 gap-3">
        {MOCK_LIVE_STREAMS.map((stream) => (
          <Link
            key={stream.id}
            href={`/live/${stream.id}`}
            className="relative aspect-[9/14] bg-gradient-to-br from-brand-pink/20 to-brand-cyan/20 rounded-2xl overflow-hidden group"
          >
            {/* Placeholder gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-dark-2 to-black" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-2xl font-bold">
                {stream.username[0].toUpperCase()}
              </div>
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />

            {/* Live badge */}
            <div className="absolute top-2 left-2">
              <span className="badge-live">
                <span className="w-1.5 h-1.5 rounded-full bg-white live-dot" />
                LIVE
              </span>
            </div>

            {/* Viewers */}
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1">
              <Users size={10} className="text-white/70" />
              <span className="text-white text-xs font-semibold">{formatViewers(stream.viewers)}</span>
            </div>

            {/* Info */}
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="text-white text-xs font-bold">@{stream.username}</p>
              <p className="text-white/70 text-xs mt-0.5 line-clamp-2">{stream.title}</p>
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-brand-pink/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </div>

      {/* Go Live Modal */}
      {goLiveModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
          <div className="bg-brand-dark-2 rounded-3xl p-6 w-full max-w-md animate-slide-up border border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-brand-pink/10 flex items-center justify-center">
                <Tv size={20} className="text-brand-pink" />
              </div>
              <h2 className="text-xl font-bold">Start Live Stream</h2>
            </div>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Stream title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What are you streaming today?" className="input" />
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-yellow-300 text-xs">
                💡 Live streaming requires a streaming key. Configure yours in Settings → Live.
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setGoLiveModal(false)} className="btn-outline flex-1">Cancel</button>
              <button disabled={!title.trim()} className="btn-primary flex-1 flex items-center justify-center gap-2">
                <Radio size={14} />Go Live
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
