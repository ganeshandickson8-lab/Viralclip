import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Hash, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCount } from "@/lib/utils";

interface Props { params: { name: string } }

export async function generateMetadata({ params }: Props) {
  return { title: `#${params.name} | ViralClip` };
}

export default async function HashtagPage({ params }: Props) {
  const hashtag = await prisma.hashtag.findUnique({
    where: { name: params.name.toLowerCase() },
    include: {
      videos: {
        include: {
          video: {
            include: {
              author: { select: { id: true, name: true, username: true, image: true } },
              _count: { select: { likes: true, views: true } },
            },
          },
        },
        orderBy: { video: { viewCount: "desc" } },
        take: 30,
      },
    },
  });

  if (!hashtag) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-5xl mb-4">🏷️</p>
        <p className="text-xl font-bold mb-2">#{params.name}</p>
        <p className="text-white/40">No videos with this hashtag yet</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 p-5 bg-white/5 rounded-2xl border border-white/10">
        <div className="w-16 h-16 rounded-2xl bg-brand-pink/10 flex items-center justify-center">
          <Hash size={28} className="text-brand-pink" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">#{hashtag.name}</h1>
          <div className="flex items-center gap-4 mt-1 text-white/50 text-sm">
            <span className="flex items-center gap-1.5">
              <TrendingUp size={14} />{formatCount(hashtag.videoCount)} videos
            </span>
            <span>{formatCount(hashtag.viewCount)} total views</span>
          </div>
        </div>
      </div>

      {/* Videos grid */}
      <div className="grid grid-cols-3 gap-0.5">
        {hashtag.videos.map(({ video }) => (
          <Link key={video.id} href={`/video/${video.id}`} className="relative aspect-[9/16] bg-white/5 overflow-hidden group">
            {video.thumbnailUrl
              ? <Image src={video.thumbnailUrl} alt={video.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
              : <div className="absolute inset-0 bg-gradient-to-br from-brand-pink/20 to-brand-cyan/20 flex items-center justify-center text-3xl">🎬</div>
            }
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
            <div className="absolute bottom-1 left-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-white text-xs font-medium line-clamp-2">{video.title}</p>
              <p className="text-white/60 text-xs">{formatCount(video._count.views)} views</p>
            </div>
          </Link>
        ))}
      </div>

      {hashtag.videos.length === 0 && (
        <div className="text-center py-16">
          <p className="text-white/40">No videos yet</p>
        </div>
      )}
    </div>
  );
}
