# ViralClip — TikTok-Like App

A full-stack short-video & live-streaming social media platform built with Next.js 14, Vercel Postgres, Vercel Blob, NextAuth.js, Firebase Analytics, and Tailwind CSS.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Database | Vercel Postgres (via Prisma ORM) |
| Storage | Vercel Blob (videos & images) |
| Auth | NextAuth.js + Google OAuth |
| Analytics | Firebase Analytics |
| Styling | Tailwind CSS |
| Monetization | Google AdSense, Meta Pixel, TikTok Pixel |
| Deploy | Vercel |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/login/          # Login page
│   ├── (main)/
│   │   ├── page.tsx           # For-You feed
│   │   ├── explore/           # Search & discovery
│   │   ├── upload/            # Video upload
│   │   ├── live/              # Live streams
│   │   ├── notifications/     # Inbox
│   │   ├── search/            # Search results
│   │   ├── profile/[username] # User profile
│   │   ├── video/[id]         # Video detail
│   │   └── hashtag/[name]     # Hashtag page
│   └── api/
│       ├── auth/[...nextauth] # NextAuth handler
│       ├── videos/            # Feed + CRUD
│       ├── videos/view/       # Track views
│       ├── upload/            # Vercel Blob upload
│       ├── likes/             # Like/unlike
│       ├── comments/          # CRUD comments
│       ├── follow/            # Follow/unfollow
│       ├── notifications/     # Inbox
│       ├── users/             # Profile + search
│       └── search/            # Global search
├── components/
│   ├── layout/Sidebar.tsx     # Desktop sidebar
│   ├── layout/BottomNav.tsx   # Mobile tab bar
│   ├── video/VideoCard.tsx    # Full-screen video player
│   ├── video/VideoFeed.tsx    # Infinite scroll feed
│   ├── ui/FollowButton.tsx    # Follow/unfollow button
│   └── ui/AdBanner.tsx        # Google AdSense banner
├── lib/
│   ├── prisma.ts              # Prisma client singleton
│   ├── auth.ts                # NextAuth config
│   ├── firebase.ts            # Firebase analytics
│   └── utils.ts               # Helpers
├── hooks/
│   ├── useVideoFeed.ts        # Infinite feed hook
│   └── useNotifications.ts    # Notification polling
└── types/index.ts             # TypeScript types
```

---

## ⚡ Quick Start

### 1. Clone & Install

```bash
git clone <your-repo>
cd tiktok-clone
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in the values (see **Environment Variables** below).

### 3. Push Database Schema

```bash
npx prisma db push
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔑 Environment Variables

| Variable | Where to get it |
|---|---|
| `POSTGRES_PRISMA_URL` | Vercel Dashboard → Storage → Postgres |
| `POSTGRES_URL_NON_POOLING` | Same as above |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your app URL (http://localhost:3000 dev) |
| `GOOGLE_CLIENT_ID` | [Google Cloud Console](https://console.cloud.google.com) |
| `GOOGLE_CLIENT_SECRET` | Same as above |
| `BLOB_READ_WRITE_TOKEN` | Vercel Dashboard → Storage → Blob |
| `NEXT_PUBLIC_FIREBASE_*` | [Firebase Console](https://console.firebase.google.com) |
| `NEXT_PUBLIC_GOOGLE_ADSENSE_PUB_ID` | [Google AdSense](https://adsense.google.com) |

---

## 🌐 Deploying to Vercel

1. Push your code to GitHub
2. Import project in [Vercel Dashboard](https://vercel.com/new)
3. Add all environment variables in **Settings → Environment Variables**
4. The build command runs automatically:
   ```
   prisma generate && prisma db push && next build
   ```

### Google OAuth Setup

In [Google Cloud Console](https://console.cloud.google.com):
- Authorized JavaScript origins: `https://your-app.vercel.app`
- Authorized redirect URIs: `https://your-app.vercel.app/api/auth/callback/google`

---

## ✨ Features

- **For-You Feed** — Infinite scroll TikTok-style vertical video feed
- **Following Feed** — Videos from creators you follow
- **Trending Feed** — Top videos by views in the last 7 days
- **Video Upload** — Drag & drop with progress bar, Vercel Blob storage
- **Like / Comment** — Real-time optimistic UI updates
- **Follow System** — Follow/unfollow with notification
- **Notifications Inbox** — Like, comment, follow, live alerts
- **User Profiles** — Stats, video grid, follow button
- **Live Streams** — Browse live streams page (RTMP integration ready)
- **Search & Explore** — Search videos, users, hashtags
- **Hashtag Pages** — Discover videos by hashtag
- **Google OAuth** — One-click sign in
- **Firebase Analytics** — Page view & event tracking
- **AdSense Integration** — `<AdBanner>` component
- **Meta Pixel / TikTok Pixel** — Ready for config
- **Mobile-first** — Bottom tab nav, snap scroll feed
- **Dark Mode** — Full dark UI out of the box

---

## 🛠️ Common Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build (+ prisma generate + db push)
npm run studio       # Open Prisma Studio (database UI)
npx prisma db push   # Sync schema to database
npx prisma generate  # Regenerate Prisma client
openssl rand -base64 32  # Generate NEXTAUTH_SECRET
```

---

## 📜 License

MIT
