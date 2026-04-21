"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import { formatCount } from "@/lib/utils";

function SearchResults() {
  const params = useSearchParams();
  const q = params.get("q") ?? "";
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((d) => { setResults(d); setLoading(false); });
  }, [q]);

  if (!q) return <p className="text-white/40 text-center py-12">Enter a search query</p>;
  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-2 border-brand-pink border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!results) return null;

  return (
    <div className="space-y-8">
      {results.users?.length > 0 && (
        <section>
          <h2 className="font-semibold text-white/60 text-sm mb-3">Creators</h2>
          <div className="space-y-2">
            {results.users.map((u: any) => (
              <Link key={u.id} href={`/profile/${u.username}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                <div className="w-12 h-12 rounded-full bg-brand-pink/20 overflow-hidden flex-shrink-0">
                  {u.image && <Image src={u.image} alt={u.name} width={48} height={48} className="object-cover" />}
                </div>
                <div>
                  <p className="font-semibold">@{u.username}</p>
                  <p className="text-white/40 text-sm">{u.name} · {formatCount(u.followerCount)} followers</p>
                  {u.bio && <p className="text-white/30 text-xs mt-0.5 line-clamp-1">{u.bio}</p>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {results.hashtags?.length > 0 && (
        <section>
          <h2 className="font-semibold text-white/60 text-sm mb-3">Hashtags</h2>
          <div className="flex flex-wrap gap-2">
            {results.hashtags.map((h: any) => (
              <Link key={h.id} href={`/hashtag/${h.name}`} className="bg-white/10 hover:bg-white/20 rounded-full px-4 py-2 text-sm font-medium transition-colors">
                #{h.name} <span className="text-white/40">({formatCount(h.videoCount)})</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {results.videos?.length > 0 && (
        <section>
          <h2 className="font-semibold text-white/60 text-sm mb-3">Videos</h2>
          <div className="grid grid-cols-3 gap-1">
            {results.videos.map((v: any) => (
              <Link key={v.id} href={`/video/${v.id}`} className="relative aspect-[9/16] bg-white/5 rounded-lg overflow-hidden group">
                {v.thumbnailUrl
                  ? <Image src={v.thumbnailUrl} alt={v.title} fill className="object-cover" />
                  : <div className="absolute inset-0 bg-gradient-to-br from-brand-pink/20 to-brand-cyan/20 flex items-center justify-center text-2xl">🎬</div>
                }
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80">
                  <p className="text-white text-xs line-clamp-2">{v.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {results.videos?.length === 0 && results.users?.length === 0 && results.hashtags?.length === 0 && (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-white/40">No results for &quot;{q}&quot;</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Search size={20} className="text-white/40 flex-shrink-0" />
        <h1 className="text-2xl font-bold">Search</h1>
      </div>
      <Suspense fallback={<div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-brand-pink border-t-transparent rounded-full animate-spin" /></div>}>
        <SearchResults />
      </Suspense>
    </div>
  );
}
