"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, PlusSquare, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

const navItems = [
  { href: "/",              icon: Home,      label: "Home" },
  { href: "/explore",       icon: Compass,   label: "Explore" },
  { href: "/upload",        icon: PlusSquare, label: "Upload", special: true },
  { href: "/notifications", icon: Bell,      label: "Inbox" },
  { href: "/me",            icon: User,      label: "Me" },
];

export function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-brand-dark border-t border-white/10 z-50 pb-safe">
      <div className="flex items-center justify-around px-2 py-1">
        {navItems.map(({ href, icon: Icon, label, special }) => {
          const resolvedHref =
            href === "/me"
              ? session?.user
                ? `/profile/${(session.user as any).username ?? "me"}`
                : "/login"
              : href;
          const active = pathname === resolvedHref || pathname === href;

          if (special) {
            return (
              <Link key={href} href={href} className="flex flex-col items-center px-4 py-2">
                <div className="relative w-10 h-7 flex items-center justify-center">
                  <div className="absolute inset-0 bg-brand-cyan rounded-lg translate-x-1" />
                  <div className="absolute inset-0 bg-brand-pink rounded-lg -translate-x-1" />
                  <div className="relative bg-white rounded-md w-8 h-6 flex items-center justify-center">
                    <span className="text-brand-dark font-black text-lg leading-none">+</span>
                  </div>
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={href}
              href={resolvedHref}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-2 min-w-0",
                active ? "text-white" : "text-white/40"
              )}
            >
              <Icon size={24} strokeWidth={active ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium truncate">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
