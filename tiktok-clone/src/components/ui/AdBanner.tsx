"use client";

import { useEffect, useRef } from "react";

interface AdBannerProps {
  slot: string;
  format?: "auto" | "horizontal" | "rectangle";
  className?: string;
}

export function AdBanner({ slot, format = "auto", className }: AdBannerProps) {
  const adRef = useRef<HTMLModElement>(null);
  const pubId = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_PUB_ID;

  useEffect(() => {
    if (!pubId || pubId === "pub-0000000000000000") return;
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {}
  }, [pubId]);

  if (!pubId || pubId === "pub-0000000000000000") {
    // Placeholder in dev / unconfigured
    return (
      <div className={`flex items-center justify-center bg-white/5 border border-dashed border-white/10 rounded-xl text-white/20 text-xs ${className ?? "h-20"}`}>
        Ad placeholder · Configure NEXT_PUBLIC_GOOGLE_ADSENSE_PUB_ID
      </div>
    );
  }

  return (
    <div className={className}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={pubId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
