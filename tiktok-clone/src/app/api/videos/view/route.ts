import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { videoId, watchTime, completionRate, source } = await req.json();

    if (!videoId) return NextResponse.json({ error: "videoId required" }, { status: 400 });

    await prisma.videoView.create({
      data: {
        videoId,
        userId: session?.user?.id ?? null,
        watchTime: watchTime ?? 0,
        completionRate: completionRate ?? 0,
        source: source ?? "fyp",
      },
    });

    await prisma.video.update({
      where: { id: videoId },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[VIEW_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
