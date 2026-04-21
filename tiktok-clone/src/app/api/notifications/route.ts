import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const limit = parseInt(searchParams.get("limit") ?? "20");

    const notifications = await prisma.notification.findMany({
      where: { recipientId: session.user.id },
      include: {
        sender: { select: { id: true, name: true, username: true, image: true } },
        video: { select: { id: true, thumbnailUrl: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = notifications.length > limit;
    const items = hasMore ? notifications.slice(0, -1) : notifications;

    // Mark fetched notifications as read
    await prisma.notification.updateMany({
      where: { recipientId: session.user.id, isRead: false, id: { in: items.map((n) => n.id) } },
      data: { isRead: true },
    });

    return NextResponse.json({ items, nextCursor: hasMore ? items[items.length - 1].id : undefined, hasMore });
  } catch (error) {
    console.error("[NOTIFICATIONS_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await prisma.notification.deleteMany({ where: { recipientId: session.user.id } });
    return NextResponse.json({ message: "All notifications cleared" });
  } catch (error) {
    console.error("[NOTIFICATIONS_DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
