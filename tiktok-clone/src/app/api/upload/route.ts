import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { put } from "@vercel/blob";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const form = await req.formData();
    const file = form.get("file") as File | null;
    const type = (form.get("type") as string) ?? "video"; // "video" | "thumbnail" | "avatar"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedVideo = ["video/mp4", "video/webm", "video/mov", "video/quicktime"];
    const allowedImage = ["image/jpeg", "image/png", "image/webp", "image/gif"];

    if (type === "video" && !allowedVideo.includes(file.type)) {
      return NextResponse.json({ error: "Invalid video format. Use MP4, WebM, or MOV." }, { status: 400 });
    }
    if ((type === "thumbnail" || type === "avatar") && !allowedImage.includes(file.type)) {
      return NextResponse.json({ error: "Invalid image format. Use JPEG, PNG, or WebP." }, { status: 400 });
    }

    // Max sizes: 500MB for video, 10MB for images
    const maxSize = type === "video" ? 500 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: `File too large. Max size: ${type === "video" ? "500MB" : "10MB"}` }, { status: 400 });
    }

    const ext = file.name.split(".").pop();
    const filename = `${type}s/${session.user.id}/${Date.now()}.${ext}`;

    const blob = await put(filename, file, {
      access: "public",
      contentType: file.type,
    });

    return NextResponse.json({ url: blob.url, pathname: blob.pathname });
  } catch (error) {
    console.error("[UPLOAD_POST]", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
