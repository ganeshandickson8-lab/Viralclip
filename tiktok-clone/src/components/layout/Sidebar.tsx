"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Home, Compass, Users, Bell, MessageCircle,
  Upload, User, LogOut, Tv, Hash, TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

const navItems = [
  { href: "/",            icon: Home,         label: "For You" },
  { href: "/following",   icon: Users,         label: "Following" },
  { href: "/explore",     icon: Compass,       label: "Explore" },
  { href: "/trending",    icon: TrendingUp,    label: "Trending" },
  { href: "/live",        icon: Tv,            label: "LIVE" },
  { href: "/hashtags",    icon: Hash,          label: "Hashtags" },
  { href: "/notifications", icon: Bell,        label: "Inbox" },
  { href: "/messages",    icon: MessageCircle, label: "Messages" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-60 bg-brand-dark border-r border-white/5 z-40 py-4 px-3">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 px-3 py-4 mb-4">
        <div className="w-8 h-8 rounded-lg bg-brand-pink flex items-center justify-center font-black text-lg">V</div>
        <span className="font-black text-xl tracking-tight">
          Viral<span className="text-brand-pink">Clip</span>
        </span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                active
                  ? "bg-brand-pink/10 text-brand-pink"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              <span>{label}</span>
              {label === "LIVE" && (
                <span className="ml-auto w-2 h-2 rounded-full bg-brand-pink live-dot" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Upload Button */}
      <Link href="/upload" className="btn-primary flex items-center justify-center gap-2 my-4 text-sm">
        <Upload size={16} />
        Upload
      </Link>

      {/* User */}
      {session?.user ? (
        <div className="mt-auto pt-4 border-t border-white/5">
          <Link
            href={`/profile/${(session.user as any).username ?? session.user.name}`}
            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors"
          >
            {session.user.image ? (
              <Image src={session.user.image} alt="avatar" width={32} height={32} className="rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-brand-pink/20 flex items-center justify-center">
                <User size={16} className="text-brand-pink" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{session.user.name}</p>
              <p className="text-xs text-white/40 truncate">@{(session.user as any).username}</p>
            </div>
          </Link>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-3 px-3 py-2 rounded-xl w-full text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-colors text-sm mt-1"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      ) : (
        <div className="mt-auto pt-4 border-t border-white/5">
          <Link href="/login" className="btn-outline flex items-center justify-center gap-2 text-sm w-full">
            Sign in
          </Link>
        </div>
      )}
    </aside>
  );
}
