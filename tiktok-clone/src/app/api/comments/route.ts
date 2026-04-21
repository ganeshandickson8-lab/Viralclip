import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get("videoId");
    const cursor = searchParams.get("cursor");
    const limit = parseInt(searchParams.get("limit") ?? "20");

    if (!videoId) return NextResponse.json({ error: "videoId required" }, { status: 400 });

    const comments = await prisma.comment.findMany({
      where: { videoId, parentId: null },
      include: {
        user: { select: { id: true, name: true, username: true, image: true, isVerified: true } },
        _count: { select: { replies: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = comments.length > limit;
    const items = hasMore ? comments.slice(0, -1) : comments;

    return NextResponse.json({ items, nextCursor: hasMore ? items[items.length - 1].id : undefined, hasMore });
  } catch (error) {
    console.error("[COMMENTS_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { videoId, text, parentId } = await req.json();
    if (!videoId || !text?.trim()) {
      return NextResponse.json({ error: "videoId and text required" }, { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: { text: text.trim(), videoId, userId: session.user.id, parentId },
      include: {
        user: { select: { id: true, name: true, username: true, image: true, isVerified: true } },
      },
    });

    await prisma.video.update({ where: { id: videoId }, data: { commentCount: { increment: 1 } } });

    // Notification
    const video = await prisma.video.findUnique({ where: { id: videoId }, select: { authorId: true } });
    if (video && video.authorId !== session.user.id) {
      await prisma.notification.create({
        data: { type: "COMMENT", recipientId: video.authorId, senderId: session.user.id, videoId },
      });
    }

    return NextResponse.json({ data: comment }, { status: 201 });
  } catch (error) {
    console.error("[COMMENTS_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
