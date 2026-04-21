import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { videoId } = await req.json();
    if (!videoId) return NextResponse.json({ error: "videoId required" }, { status: 400 });

    const existing = await prisma.like.findUnique({
      where: { userId_videoId: { userId: session.user.id, videoId } },
    });

    if (existing) {
      // Unlike
      await prisma.like.delete({ where: { id: existing.id } });
      await prisma.video.update({ where: { id: videoId }, data: { likeCount: { decrement: 1 } } });
      return NextResponse.json({ liked: false });
    } else {
      // Like
      await prisma.like.create({ data: { userId: session.user.id, videoId } });
      await prisma.video.update({ where: { id: videoId }, data: { likeCount: { increment: 1 } } });

      // Create notification
      const video = await prisma.video.findUnique({ where: { id: videoId }, select: { authorId: true } });
      if (video && video.authorId !== session.user.id) {
        await prisma.notification.create({
          data: {
            type: "LIKE",
            recipientId: video.authorId,
            senderId: session.user.id,
            videoId,
          },
        });
      }
      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error("[LIKE_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
