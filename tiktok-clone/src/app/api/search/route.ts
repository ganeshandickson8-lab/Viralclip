import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();
    const type = searchParams.get("type") ?? "all"; // all | videos | users | hashtags

    if (!q || q.length < 1) return NextResponse.json({ error: "Query too short" }, { status: 400 });

    const [videos, users, hashtags] = await Promise.all([
      type === "users" || type === "hashtags"
        ? []
        : prisma.video.findMany({
            where: {
              isPublished: true,
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
              ],
            },
            include: {
              author: { select: { id: true, name: true, username: true, image: true, isVerified: true } },
              _count: { select: { likes: true, views: true } },
            },
            orderBy: { viewCount: "desc" },
            take: 20,
          }),
      type === "videos" || type === "hashtags"
        ? []
        : prisma.user.findMany({
            where: {
              OR: [
                { username: { contains: q, mode: "insensitive" } },
                { name: { contains: q, mode: "insensitive" } },
              ],
            },
            select: { id: true, name: true, username: true, image: true, isVerified: true, followerCount: true, bio: true },
            orderBy: { followerCount: "desc" },
            take: 10,
          }),
      type === "videos" || type === "users"
        ? []
        : prisma.hashtag.findMany({
            where: { name: { contains: q.replace(/^#/, ""), mode: "insensitive" } },
            orderBy: { videoCount: "desc" },
            take: 10,
          }),
    ]);

    return NextResponse.json({ videos, users, hashtags, query: q });
  } catch (error) {
    console.error("[SEARCH_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
