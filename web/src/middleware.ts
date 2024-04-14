"use server";
import { getToken } from "next-auth/jwt";
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const publicRoutes = ["/"];
const guestRoutes = ["/login", "/register"];
const privateRoutes = ["/dashboard"];

export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  async function middleware(req) {
    // NOTE - this is executed AFTER the withAuth
    const { pathname } = req.nextUrl;
    const token = await getToken({ req });
    const isAuthenticated = !!token;

    // console.log("middleware");
    // console.log(token, isAuthenticated);

    if (publicRoutes.includes(pathname)) return NextResponse.next();
    if (guestRoutes.includes(pathname) && isAuthenticated) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    const isPrivateRoute = privateRoutes.some((route) =>
      pathname.startsWith(route),
    );

    if (isPrivateRoute && !isAuthenticated) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  },
  {
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
      authorized: ({ token, req }) => {
        return true;
        // NOTE: this method feels limited, so I am just used the normal middleware
      },
    },
  },
);

export const config = {
  matcher: "/((?!api|_next/static|_next/image|favicon.ico).*)",
};
