import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");
    const q = searchParams.get("q");
    const session = await getServerSession(authOptions);

    if (username) {
      const user = await prisma.user.findUnique({
        where: { username },
        include: {
          _count: { select: { videos: true, followers: true, following: true } },
        },
      });
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

      let isFollowing = false;
      if (session?.user?.id) {
        const follow = await prisma.follow.findUnique({
          where: { followerId_followingId: { followerId: session.user.id, followingId: user.id } },
        });
        isFollowing = !!follow;
      }
      return NextResponse.json({ data: { ...user, isFollowing } });
    }

    if (q) {
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { username: { contains: q, mode: "insensitive" } },
            { name: { contains: q, mode: "insensitive" } },
          ],
        },
        select: { id: true, name: true, username: true, image: true, isVerified: true, followerCount: true },
        take: 20,
      });
      return NextResponse.json({ items: users });
    }

    return NextResponse.json({ error: "Provide username or q param" }, { status: 400 });
  } catch (error) {
    console.error("[USERS_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, bio, website, username, image } = await req.json();

    if (username) {
      const conflict = await prisma.user.findFirst({
        where: { username, id: { not: session.user.id } },
      });
      if (conflict) return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: { name, bio, website, username, image },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("[USERS_PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
