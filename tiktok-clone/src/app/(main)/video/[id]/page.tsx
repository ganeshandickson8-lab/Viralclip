import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Eye, Heart, MessageCircle, Share2 } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCount, timeAgo } from "@/lib/utils";
import { FollowButton } from "@/components/ui/FollowButton";

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props) {
  const video = await prisma.video.findUnique({ where: { id: params.id }, include: { author: true } });
  if (!video) return { title: "Video not found" };
  return {
    title: `${video.title} | ViralClip`,
    description: video.description ?? `Watch ${video.title} by @${video.author.username}`,
    openGraph: {
      title: video.title,
      description: video.description ?? "",
      images: video.thumbnailUrl ? [{ url: video.thumbnailUrl }] : [],
    },
  };
}

export default async function VideoPage({ params }: Props) {
  const session = await getServerSession(authOptions);

  const video = await prisma.video.findUnique({
    where: { id: params.id },
    include: {
      author: { select: { id: true, name: true, username: true, image: true, isVerified: true, bio: true, followerCount: true } },
      _count: { select: { likes: true, comments: true, views: true } },
      hashtags: { include: { hashtag: true } },
    },
  });

  if (!video || !video.isPublished) notFound();

  let isLiked = false;
  let isFollowing = false;

  if (session?.user?.id) {
    const [like, follow] = await Promise.all([
      prisma.like.findUnique({ where: { userId_videoId: { userId: session.user.id, videoId: video.id } } }),
      prisma.follow.findUnique({ where: { followerId_followingId: { followerId: session.user.id, followingId: video.authorId } } }),
    ]);
    isLiked = !!like;
    isFollowing = !!follow;
  }

  const relatedVideos = await prisma.video.findMany({
    where: { authorId: video.authorId, isPublished: true, id: { not: video.id } },
    take: 6,
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, thumbnailUrl: true, viewCount: true, likeCount: true },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="grid md:grid-cols-3 gap-8">
        {/* Video player */}
        <div className="md:col-span-2">
          <div className="relative aspect-video bg-black rounded-2xl overflow-hidden mb-4">
            <video
              src={video.videoUrl}
              poster={video.thumbnailUrl ?? undefined}
              controls
              autoPlay
              className="w-full h-full object-contain"
            />
          </div>

          {/* Title & meta */}
          <h1 className="text-xl font-bold mb-2">{video.title}</h1>
          {video.description && <p className="text-white/70 text-sm mb-3 leading-relaxed">{video.description}</p>}

          {/* Hashtags */}
          {video.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {video.hashtags.map(({ hashtag }) => (
                <Link key={hashtag.id} href={`/hashtag/${hashtag.name}`} className="text-brand-cyan text-sm hover:underline">
                  #{hashtag.name}
                </Link>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-white/50 text-sm mb-4">
            <span className="flex items-center gap-1.5"><Eye size={14} />{formatCount(video.viewCount)} views</span>
            <span className="flex items-center gap-1.5"><Heart size={14} />{formatCount(video._count.likes)}</span>
            <span className="flex items-center gap-1.5"><MessageCircle size={14} />{formatCount(video._count.comments)}</span>
            <span>{timeAgo(video.createdAt)}</span>
          </div>

          {/* Share */}
          <div className="flex gap-2 mb-6">
            <button className="flex items-center gap-2 bg-white/10 hover:bg-white/15 rounded-full px-4 py-2 text-sm transition-colors">
              <Heart size={14} className={isLiked ? "text-brand-pink fill-brand-pink" : ""} />
              {isLiked ? "Liked" : "Like"}
            </button>
            <button className="flex items-center gap-2 bg-white/10 hover:bg-white/15 rounded-full px-4 py-2 text-sm transition-colors">
              <Share2 size={14} />Share
            </button>
          </div>

          {/* Author card */}
          <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
            <Link href={`/profile/${video.author.username}`}>
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/10 flex-shrink-0">
                {video.author.image
                  ? <Image src={video.author.image} alt={video.author.name ?? ""} width={56} height={56} className="object-cover" />
                  : <div className="w-full h-full bg-brand-pink/20 flex items-center justify-center font-bold text-xl">{(video.author.name ?? "U")[0]}</div>
                }
              </div>
            </Link>
            <div className="flex-1 min-w-0">
              <Link href={`/profile/${video.author.username}`} className="flex items-center gap-1.5">
                <span className="font-bold hover:underline">@{video.author.username}</span>
                {video.author.isVerified && <CheckCircle2 size={15} className="text-brand-cyan" />}
              </Link>
              <p className="text-white/40 text-sm">{formatCount(video.author.followerCount)} followers</p>
              {video.author.bio && <p className="text-white/60 text-xs mt-1 line-clamp-2">{video.author.bio}</p>}
            </div>
            {session?.user?.id !== video.authorId && (
              <FollowButton targetUserId={video.authorId} initialFollowing={isFollowing} />
            )}
          </div>
        </div>

        {/* Sidebar: related videos */}
        <div>
          <h2 className="font-semibold text-white/60 text-sm mb-3">More from @{video.author.username}</h2>
          <div className="space-y-3">
            {relatedVideos.length === 0 && <p className="text-white/30 text-sm">No other videos yet</p>}
            {relatedVideos.map((v) => (
              <Link key={v.id} href={`/video/${v.id}`} className="flex gap-3 group">
                <div className="relative w-24 aspect-[9/16] flex-shrink-0 bg-white/5 rounded-xl overflow-hidden">
                  {v.thumbnailUrl
                    ? <Image src={v.thumbnailUrl} alt={v.title} fill className="object-cover group-hover:scale-105 transition-transform" />
                    : <div className="absolute inset-0 flex items-center justify-center text-xl">🎬</div>
                  }
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <p className="text-sm font-medium line-clamp-2 group-hover:text-brand-pink transition-colors">{v.title}</p>
                  <p className="text-white/40 text-xs mt-1">{formatCount(v.viewCount)} views</p>
                  <p className="text-white/30 text-xs">{formatCount(v.likeCount)} likes</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
