import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ req, token }) {
        const { pathname } = req.nextUrl;
        // Protect upload route
        if (pathname.startsWith("/upload")) return !!token;
        // All other routes are public
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/upload", "/settings/:path*"],
};
