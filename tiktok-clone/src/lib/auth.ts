import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "database",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        // Fetch extra user fields
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { username: true, role: true, isVerified: true, isPremium: true, image: true },
        });
        if (dbUser) {
          (session.user as any).username = dbUser.username;
          (session.user as any).role = dbUser.role;
          (session.user as any).isVerified = dbUser.isVerified;
          (session.user as any).isPremium = dbUser.isPremium;
          session.user.image = dbUser.image ?? session.user.image;
        }
      }
      return session;
    },
    async signIn({ user, account }) {
      if (!user.email) return false;
      // Auto-generate username on first sign-in
      const existing = await prisma.user.findUnique({ where: { email: user.email } });
      if (!existing?.username) {
        const base = (user.name ?? user.email.split("@")[0])
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "")
          .slice(0, 20);
        const suffix = Math.floor(Math.random() * 9999);
        const username = `${base}${suffix}`;
        await prisma.user.update({
          where: { email: user.email },
          data: { username },
        }).catch(() => {});
      }
      return true;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
