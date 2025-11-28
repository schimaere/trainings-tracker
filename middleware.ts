import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    try {
      const isAuthPage = req.nextUrl.pathname.startsWith("/auth");
      const token = req.nextauth?.token;

      // If logged in and trying to access auth page, redirect to dashboard
      if (token && isAuthPage) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      return NextResponse.next();
    } catch (error) {
      console.error("Middleware error:", error);
      // On error, allow the request to proceed
      return NextResponse.next();
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        try {
          const isAuthPage = req.nextUrl.pathname.startsWith("/auth");
          // Allow access to auth pages without token, require token for other pages
          return !!token || isAuthPage;
        } catch (error) {
          console.error("Authorized callback error:", error);
          // On error, allow access to auth pages only
          return req.nextUrl.pathname.startsWith("/auth");
        }
      },
    },
  }
);

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|sw.js.map|icon-.*\\.png).*)",
  ],
};
