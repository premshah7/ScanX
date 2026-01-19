import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function proxy(req) {
        const { pathname } = req.nextUrl;
        const { token } = req.nextauth;

        // Public routes are handled by `matcher` exclusion, but we double-check here
        if (pathname === "/" || pathname.startsWith("/auth") || pathname.startsWith("/api")) {
            return NextResponse.next();
        }

        if (!token) {
            return NextResponse.redirect(new URL("/auth/login", req.url));
        }

        const role = token.role;

        // 1. Admin Route Protection
        if (pathname.startsWith("/admin")) {
            if (role !== "ADMIN") {
                return NextResponse.redirect(new URL("/unauthorized", req.url));
            }
        }

        // 2. Faculty Route Protection
        if (pathname.startsWith("/faculty")) {
            if (role !== "FACULTY") {
                return NextResponse.redirect(new URL("/unauthorized", req.url));
            }
        }

        // 3. Student Route Protection
        if (pathname.startsWith("/student")) {
            if (role !== "STUDENT") {
                return NextResponse.redirect(new URL("/unauthorized", req.url));
            }
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - auth (authentication routes)
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, etc)
         */
        "/((?!auth|api|_next/static|_next/image|favicon.ico|logo.png|.*\\.png$).*)",
    ],
};
