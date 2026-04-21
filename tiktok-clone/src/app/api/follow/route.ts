import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { targetUserId } = await req.json();
    if (!targetUserId) return NextResponse.json({ error: "targetUserId required" }, { status: 400 });
    if (targetUserId === session.user.id) return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });

    const existing = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: session.user.id, followingId: targetUserId } },
    });

    if (existing) {
      await prisma.follow.delete({ where: { id: existing.id } });
      await prisma.user.update({ where: { id: session.user.id }, data: { followingCount: { decrement: 1 } } });
      await prisma.user.update({ where: { id: targetUserId }, data: { followerCount: { decrement: 1 } } });
      return NextResponse.json({ following: false });
    } else {
      await prisma.follow.create({ data: { followerId: session.user.id, followingId: targetUserId } });
      await prisma.user.update({ where: { id: session.user.id }, data: { followingCount: { increment: 1 } } });
      await prisma.user.update({ where: { id: targetUserId }, data: { followerCount: { increment: 1 } } });
      await prisma.notification.create({
        data: { type: "FOLLOW", recipientId: targetUserId, senderId: session.user.id },
      });
      return NextResponse.json({ following: true });
    }
  } catch (error) {
    console.error("[FOLLOW_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
