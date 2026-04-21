"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export function useNotificationCount() {
  const { data: session } = useSession();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!session?.user) return;

    const check = async () => {
      try {
        const res = await fetch("/api/notifications?limit=1");
        const data = await res.json();
        const unread = data.items?.filter((n: any) => !n.isRead).length ?? 0;
        setCount(unread);
      } catch {}
    };

    check();
    const interval = setInterval(check, 30_000); // poll every 30s
    return () => clearInterval(interval);
  }, [session]);

  return count;
}
