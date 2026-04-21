"use client";

import { useState, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Upload, X, Film, CheckCircle, AlertCircle, Hash } from "lucide-react";
import { cn, extractHashtags } from "@/lib/utils";

type Step = "select" | "details" | "uploading" | "done" | "error";

export default function UploadPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("select");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [allowComments, setAllowComments] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith("video/")) { setError("Please select a video file."); return; }
    if (f.size > 500 * 1024 * 1024) { setError("Video must be under 500MB."); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setTitle(f.name.replace(/\.[^.]+$/, ""));
    setStep("details");
    setError("");
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleSubmit = async () => {
    if (!file || !title.trim() || !session?.user) return;
    setStep("uploading");
    setProgress(0);

    try {
      // 1. Upload video
      const form = new FormData();
      form.append("file", file);
      form.append("type", "video");

      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 80));
      };

      const videoUrl = await new Promise<string>((resolve, reject) => {
        xhr.open("POST", "/api/upload");
        xhr.onload = () => {
          const data = JSON.parse(xhr.responseText);
          if (xhr.status === 200) resolve(data.url);
          else reject(new Error(data.error));
        };
        xhr.onerror = () => reject(new Error("Upload failed"));
        xhr.send(form);
      });

      setProgress(85);

      // 2. Create video record
      const hashtags = extractHashtags(description);
      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, videoUrl, allowComments, hashtags }),
      });

      if (!res.ok) throw new Error("Failed to save video");
      setProgress(100);
      setStep("done");

      setTimeout(() => router.push("/"), 2000);
    } catch (err: any) {
      setError(err.message ?? "Upload failed");
      setStep("error");
    }
  };

  if (!session?.user) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60 mb-4">Sign in to upload videos</p>
          <a href="/login" className="btn-primary">Sign in</a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Upload Video</h1>
      <p className="text-white/40 text-sm mb-8">Share your video with the world</p>

      {step === "select" && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-white/20 hover:border-brand-pink/60 rounded-2xl p-16 flex flex-col items-center justify-center cursor-pointer transition-colors group"
        >
          <div className="w-16 h-16 rounded-2xl bg-brand-pink/10 group-hover:bg-brand-pink/20 flex items-center justify-center mb-4 transition-colors">
            <Upload size={28} className="text-brand-pink" />
          </div>
          <p className="font-semibold text-white mb-1">Select or drag video</p>
          <p className="text-white/40 text-sm">MP4, WebM, MOV up to 500MB</p>
          {error && <p className="text-red-400 text-sm mt-3 flex items-center gap-1"><AlertCircle size={14} />{error}</p>}
          <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        </div>
      )}

      {step === "details" && file && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Preview */}
          <div className="aspect-[9/16] bg-black rounded-2xl overflow-hidden relative max-h-80 md:max-h-none">
            {preview && (
              <video src={preview} className="w-full h-full object-cover" controls muted />
            )}
            <button
              onClick={() => { setFile(null); setPreview(null); setStep("select"); }}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Title *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={150}
                placeholder="Add a title…"
                className="input"
              />
              <p className="text-white/30 text-xs mt-1 text-right">{title.length}/150</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">
                Description <span className="text-white/30">(use #hashtags)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={2200}
                rows={4}
                placeholder="Describe your video, add #hashtags…"
                className="input resize-none"
              />
              {extractHashtags(description).length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {extractHashtags(description).map((h) => (
                    <span key={h} className="text-brand-cyan text-xs flex items-center gap-0.5">
                      <Hash size={10} />#{h}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between py-3 border-t border-white/10">
              <div>
                <p className="text-sm font-medium">Allow comments</p>
                <p className="text-xs text-white/40">Let viewers comment on your video</p>
              </div>
              <button
                onClick={() => setAllowComments((v) => !v)}
                className={cn("w-12 h-6 rounded-full transition-colors relative", allowComments ? "bg-brand-pink" : "bg-white/20")}
              >
                <span className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-all", allowComments ? "left-7" : "left-1")} />
              </button>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep("select")} className="btn-outline flex-1">Cancel</button>
              <button onClick={handleSubmit} disabled={!title.trim()} className="btn-primary flex-1 flex items-center justify-center gap-2">
                <Film size={16} />
                Post video
              </button>
            </div>
          </div>
        </div>
      )}

      {step === "uploading" && (
        <div className="flex flex-col items-center justify-center py-20 gap-6">
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
              <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
              <circle cx="48" cy="48" r="40" fill="none" stroke="#FE2C55" strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress / 100)}`}
                strokeLinecap="round" className="transition-all duration-300" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center font-bold text-lg">{progress}%</span>
          </div>
          <div className="text-center">
            <p className="font-semibold text-lg">{progress < 85 ? "Uploading…" : "Processing…"}</p>
            <p className="text-white/40 text-sm mt-1">Please don&apos;t close this tab</p>
          </div>
        </div>
      )}

      {step === "done" && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <CheckCircle size={64} className="text-green-400" />
          <p className="font-bold text-xl">Video posted!</p>
          <p className="text-white/40 text-sm">Redirecting to feed…</p>
        </div>
      )}

      {step === "error" && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <AlertCircle size={64} className="text-red-400" />
          <p className="font-bold text-xl">Upload failed</p>
          <p className="text-red-300 text-sm">{error}</p>
          <button onClick={() => setStep("details")} className="btn-primary">Try again</button>
        </div>
      )}
    </div>
  );
}
