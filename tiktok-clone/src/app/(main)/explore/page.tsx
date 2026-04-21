"use client";

import { useState } from "react";
import { Search, TrendingUp, Hash, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatCount } from "@/lib/utils";

const TRENDING_HASHTAGS = [
  { name: "fyp", videoCount: 4200000 },
  { name: "viral", videoCount: 3800000 },
  { name: "trending", videoCount: 2100000 },
  { name: "dance", videoCount: 1900000 },
  { name: "music", videoCount: 1700000 },
  { name: "funny", videoCount: 1500000 },
  { name: "food", videoCount: 1300000 },
  { name: "travel", videoCount: 1100000 },
];

export default function ExplorePage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"all" | "videos" | "users" | "hashtags">("all");

  const handleSearch = async (q: string) => {
    setQuery(q);
    if (!q.trim() || q.length < 1) { setResults(null); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&type=${tab}`);
      setResults(await res.json());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-5">Explore</h1>

      {/* Search input */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
        <input
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search videos, users, hashtags…"
          className="input pl-10 py-3 text-base"
        />
      </div>

      {/* Tabs (when searching) */}
      {query && (
        <div className="flex gap-2 mb-5 overflow-x-auto no-scrollbar">
          {(["all", "videos", "users", "hashtags"] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); handleSearch(query); }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${tab === t ? "bg-brand-pink text-white" : "bg-white/10 text-white/60 hover:text-white"}`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Search results */}
      {query && (
        <div className="space-y-4">
          {loading && <p className="text-white/40 text-sm">Searching…</p>}

          {/* Users */}
          {results?.users?.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-white/60 mb-3 flex items-center gap-1.5">
                <Users size={14} /> Creators
              </h2>
              <div className="space-y-3">
                {results.users.map((u: any) => (
                  <Link key={u.id} href={`/profile/${u.username}`} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-brand-pink/20 overflow-hidden flex-shrink-0">
                      {u.image && <Image src={u.image} alt={u.name} width={40} height={40} className="object-cover" />}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">@{u.username}</p>
                      <p className="text-white/40 text-xs">{formatCount(u.followerCount)} followers</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Videos */}
          {results?.videos?.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-white/60 mb-3">Videos</h2>
              <div className="grid grid-cols-2 gap-2">
                {results.videos.map((v: any) => (
                  <Link key={v.id} href={`/video/${v.id}`} className="relative aspect-[9/16] bg-white/5 rounded-xl overflow-hidden group">
                    {v.thumbnailUrl ? (
                      <Image src={v.thumbnailUrl} alt={v.title} fill className="object-cover" />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-brand-pink/20 to-brand-cyan/20 flex items-center justify-center">
                        <span className="text-3xl">🎬</span>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80">
                      <p className="text-white text-xs font-medium line-clamp-2">{v.title}</p>
                      <p className="text-white/50 text-xs">{formatCount(v._count?.views ?? 0)} views</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Hashtags */}
          {results?.hashtags?.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-white/60 mb-3 flex items-center gap-1.5">
                <Hash size={14} /> Hashtags
              </h2>
              <div className="flex flex-wrap gap-2">
                {results.hashtags.map((h: any) => (
                  <Link key={h.id} href={`/hashtag/${h.name}`} className="bg-white/10 hover:bg-white/20 rounded-full px-4 py-1.5 text-sm font-medium transition-colors">
                    #{h.name} <span className="text-white/40 text-xs">({formatCount(h.videoCount)})</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {!loading && results && results.videos?.length === 0 && results.users?.length === 0 && results.hashtags?.length === 0 && (
            <p className="text-white/40 text-center py-8">No results for &quot;{query}&quot;</p>
          )}
        </div>
      )}

      {/* Default: trending hashtags */}
      {!query && (
        <>
          <section>
            <h2 className="font-semibold text-white/60 text-sm mb-3 flex items-center gap-1.5">
              <TrendingUp size={14} /> Trending hashtags
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {TRENDING_HASHTAGS.map((h) => (
                <Link
                  key={h.name}
                  href={`/hashtag/${h.name}`}
                  className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-brand-pink/10 flex items-center justify-center text-brand-pink font-bold text-lg">#</div>
                  <div>
                    <p className="font-semibold text-sm">#{h.name}</p>
                    <p className="text-white/40 text-xs">{formatCount(h.videoCount)} videos</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
