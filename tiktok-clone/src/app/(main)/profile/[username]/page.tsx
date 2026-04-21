import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Globe, Grid3X3, Heart } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCount } from "@/lib/utils";
import { FollowButton } from "@/components/ui/FollowButton";

interface Props { params: { username: string } }

export async function generateMetadata({ params }: Props) {
  const user = await prisma.user.findUnique({ where: { username: params.username } });
  if (!user) return { title: "User not found" };
  return { title: `@${user.username} | ViralClip`, description: user.bio ?? `Check out @${user.username} on ViralClip` };
}

export default async function ProfilePage({ params }: Props) {
  const session = await getServerSession(authOptions);

  const user = await prisma.user.findUnique({
    where: { username: params.username },
    include: { _count: { select: { videos: true, followers: true, following: true } } },
  });

  if (!user) notFound();

  const isOwnProfile = session?.user?.id === user.id;

  let isFollowing = false;
  if (session?.user?.id && !isOwnProfile) {
    const follow = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: session.user.id, followingId: user.id } },
    });
    isFollowing = !!follow;
  }

  const videos = await prisma.video.findMany({
    where: { authorId: user.id, isPublished: true },
    orderBy: { createdAt: "desc" },
    take: 30,
    select: { id: true, title: true, thumbnailUrl: true, viewCount: true, likeCount: true, createdAt: true },
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 mb-6">
        <div className="flex-shrink-0">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/10">
            {user.image ? (
              <Image src={user.image} alt={user.name ?? "user"} width={96} height={96} className="object-cover" />
            ) : (
              <div className="w-full h-full bg-brand-pink/20 flex items-center justify-center text-3xl font-bold">
                {(user.name ?? "U")[0]}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
            <h1 className="text-xl font-bold">@{user.username}</h1>
            {user.isVerified && <CheckCircle2 size={18} className="text-brand-cyan" />}
            {user.isPremium && <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-medium">PRO</span>}
          </div>
          <p className="text-white/60 text-sm mb-3">{user.name}</p>

          {/* Stats */}
          <div className="flex items-center justify-center sm:justify-start gap-6 mb-4">
            <div className="text-center">
              <p className="font-bold text-lg">{formatCount(user._count.following)}</p>
              <p className="text-white/40 text-xs">Following</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-lg">{formatCount(user._count.followers)}</p>
              <p className="text-white/40 text-xs">Followers</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-lg">{formatCount(user.totalLikes)}</p>
              <p className="text-white/40 text-xs">Likes</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center sm:justify-start gap-2">
            {isOwnProfile ? (
              <Link href="/settings/profile" className="btn-outline text-sm px-5 py-1.5">Edit profile</Link>
            ) : (
              <FollowButton targetUserId={user.id} initialFollowing={isFollowing} />
            )}
            {user.website && (
              <a href={user.website} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors">
                <Globe size={16} />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Bio */}
      {user.bio && <p className="text-white/80 text-sm mb-6 leading-relaxed">{user.bio}</p>}

      {/* Videos grid */}
      <div className="border-t border-white/10 pt-4">
        <div className="flex items-center gap-2 mb-4">
          <Grid3X3 size={18} className="text-brand-pink" />
          <span className="font-semibold text-sm">{user._count.videos} Videos</span>
        </div>

        {videos.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🎬</p>
            <p className="text-white/40">{isOwnProfile ? "You haven't uploaded any videos yet" : "No videos yet"}</p>
            {isOwnProfile && (
              <Link href="/upload" className="btn-primary mt-4 inline-flex">Upload now</Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-0.5">
            {videos.map((v) => (
              <Link key={v.id} href={`/video/${v.id}`} className="relative aspect-[9/16] bg-white/5 overflow-hidden group">
                {v.thumbnailUrl ? (
                  <Image src={v.thumbnailUrl} alt={v.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-pink/20 to-brand-cyan/20 flex items-center justify-center">
                    <span className="text-2xl">🎬</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                <div className="absolute bottom-1 left-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Heart size={12} className="text-white fill-white" />
                  <span className="text-white text-xs font-semibold">{formatCount(v.likeCount)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
