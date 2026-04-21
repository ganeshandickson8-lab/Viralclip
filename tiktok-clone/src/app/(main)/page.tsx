import { VideoFeed } from "@/components/video/VideoFeed";

export const metadata = { title: "For You | ViralClip" };

export default function HomePage() {
  return (
    <div className="relative">
      {/* Feed type tabs (desktop) */}
      <div className="hidden md:flex absolute top-0 left-0 right-0 z-30 justify-center pt-4 gap-6 pointer-events-none">
        <div className="flex items-center gap-6 bg-black/30 backdrop-blur-md rounded-full px-6 py-2 pointer-events-auto border border-white/10">
          <a href="/?type=for-you" className="text-white font-semibold text-sm border-b-2 border-white pb-0.5">For You</a>
          <a href="/?type=following" className="text-white/50 hover:text-white font-medium text-sm pb-0.5 transition-colors">Following</a>
          <a href="/?type=trending" className="text-white/50 hover:text-white font-medium text-sm pb-0.5 transition-colors">Trending</a>
        </div>
      </div>
      <VideoFeed feedType="for-you" />
    </div>
  );
}
