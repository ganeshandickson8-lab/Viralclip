import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const limit = parseInt(searchParams.get("limit") ?? "10");
    const type = searchParams.get("type") ?? "for-you"; // for-you | following | trending
    const session = await getServerSession(authOptions);

    let videos;

    if (type === "following" && session?.user?.id) {
      // Videos from followed users
      const following = await prisma.follow.findMany({
        where: { followerId: session.user.id },
        select: { followingId: true },
      });
      const followingIds = following.map((f) => f.followingId);

      videos = await prisma.video.findMany({
        where: { authorId: { in: followingIds }, isPublished: true },
        include: {
          author: { select: { id: true, name: true, username: true, image: true, isVerified: true } },
          _count: { select: { likes: true, comments: true, views: true } },
        },
        orderBy: { createdAt: "desc" },
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      });
    } else if (type === "trending") {
      // Trending: most views in last 7 days
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      videos = await prisma.video.findMany({
        where: { isPublished: true, createdAt: { gte: weekAgo } },
        include: {
          author: { select: { id: true, name: true, username: true, image: true, isVerified: true } },
          _count: { select: { likes: true, comments: true, views: true } },
        },
        orderBy: { viewCount: "desc" },
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      });
    } else {
      // For-you feed: latest published
      videos = await prisma.video.findMany({
        where: { isPublished: true },
        include: {
          author: { select: { id: true, name: true, username: true, image: true, isVerified: true } },
          _count: { select: { likes: true, comments: true, views: true } },
        },
        orderBy: { createdAt: "desc" },
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      });
    }

    const hasMore = videos.length > limit;
    const items = hasMore ? videos.slice(0, -1) : videos;
    const nextCursor = hasMore ? items[items.length - 1].id : undefined;

    // Add isLiked flag
    let likedVideoIds: Set<string> = new Set();
    if (session?.user?.id) {
      const likes = await prisma.like.findMany({
        where: { userId: session.user.id, videoId: { in: items.map((v) => v.id) } },
        select: { videoId: true },
      });
      likedVideoIds = new Set(likes.map((l) => l.videoId));
    }

    const enriched = items.map((v) => ({ ...v, isLiked: likedVideoIds.has(v.id) }));

    return NextResponse.json({ items: enriched, nextCursor, hasMore });
  } catch (error) {
    console.error("[VIDEOS_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { title, description, videoUrl, thumbnailUrl, duration, width, height, hashtags } = body;

    if (!title || !videoUrl) {
      return NextResponse.json({ error: "Title and videoUrl are required" }, { status: 400 });
    }

    const video = await prisma.video.create({
      data: {
        title,
        description,
        videoUrl,
        thumbnailUrl,
        duration,
        width,
        height,
        isPublished: true,
        authorId: session.user.id,
      },
    });

    // Handle hashtags
    if (hashtags?.length) {
      for (const tag of hashtags as string[]) {
        const hashtag = await prisma.hashtag.upsert({
          where: { name: tag.toLowerCase() },
          update: { videoCount: { increment: 1 } },
          create: { name: tag.toLowerCase(), videoCount: 1 },
        });
        await prisma.videoHashtag.create({
          data: { videoId: video.id, hashtagId: hashtag.id },
        });
      }
    }

    return NextResponse.json({ data: video }, { status: 201 });
  } catch (error) {
    console.error("[VIDEOS_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
