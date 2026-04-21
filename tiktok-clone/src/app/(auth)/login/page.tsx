"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Chrome } from "lucide-react";

export default function LoginPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);
  const error = params.get("error");

  useEffect(() => {
    if (session?.user) router.replace("/");
  }, [session, router]);

  const handleGoogle = async () => {
    setLoading(true);
    await signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen bg-brand-dark flex">
      {/* Left hero (desktop) */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-brand-pink/20 via-brand-dark to-brand-cyan/10 items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 rounded-3xl bg-brand-pink mx-auto mb-6 flex items-center justify-center font-black text-4xl">V</div>
          <h1 className="text-5xl font-black mb-4 leading-tight">
            Viral<span className="text-brand-pink">Clip</span>
          </h1>
          <p className="text-white/60 text-lg leading-relaxed">
            Watch millions of short videos.<br />Share your own story with the world.
          </p>
          <div className="mt-8 flex justify-center gap-3 flex-wrap">
            {["🎵 Music", "🎮 Gaming", "😂 Comedy", "🍕 Food", "💪 Fitness", "✈️ Travel"].map((t) => (
              <span key={t} className="bg-white/10 rounded-full px-3 py-1 text-sm">{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Right login panel */}
      <div className="flex-1 lg:max-w-md flex flex-col items-center justify-center p-8">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-10">
          <div className="w-10 h-10 rounded-xl bg-brand-pink flex items-center justify-center font-black text-xl">V</div>
          <span className="font-black text-3xl">Viral<span className="text-brand-pink">Clip</span></span>
        </div>

        <div className="w-full max-w-sm">
          <h2 className="text-3xl font-bold mb-2">Sign in</h2>
          <p className="text-white/50 mb-8">Join millions of creators and viewers</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-6 text-red-300 text-sm">
              {error === "OAuthAccountNotLinked"
                ? "This email is already linked to another account."
                : "Sign in failed. Please try again."}
            </div>
          )}

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 font-semibold py-3.5 px-6 rounded-2xl hover:bg-gray-100 transition-all active:scale-95 disabled:opacity-70 mb-4 text-sm"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            Continue with Google
          </button>

          <div className="relative flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-xs">More options coming soon</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <div className="space-y-2 opacity-40 pointer-events-none">
            <button className="w-full flex items-center justify-center gap-3 border border-white/20 font-medium py-3 px-6 rounded-2xl text-sm">
              📱 Continue with Phone (soon)
            </button>
            <button className="w-full flex items-center justify-center gap-3 border border-white/20 font-medium py-3 px-6 rounded-2xl text-sm">
              ✉️ Continue with Email (soon)
            </button>
          </div>

          <p className="text-white/20 text-xs text-center mt-8 leading-relaxed">
            By signing in, you agree to our{" "}
            <a href="/terms" className="underline hover:text-white/40">Terms</a> and{" "}
            <a href="/privacy" className="underline hover:text-white/40">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
