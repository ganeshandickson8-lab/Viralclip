import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: { default: "ViralClip", template: "%s | ViralClip" },
  description: "Share short videos, go viral, discover creators",
  keywords: ["short video", "live streaming", "creators", "social media"],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "ViralClip",
    title: "ViralClip – Share Your World",
    description: "Share short videos, go viral, discover creators",
  },
  twitter: { card: "summary_large_image", title: "ViralClip", description: "Share short videos, go viral" },
  icons: { icon: "/icons/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans bg-brand-dark text-white antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
