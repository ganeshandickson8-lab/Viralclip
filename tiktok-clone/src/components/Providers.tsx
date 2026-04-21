"use client";

import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";
import { getFirebaseAnalytics } from "@/lib/firebase";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize Firebase Analytics on client only
    getFirebaseAnalytics().catch(console.error);
  }, []);

  return <SessionProvider>{children}</SessionProvider>;
}
