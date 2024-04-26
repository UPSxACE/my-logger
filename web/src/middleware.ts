"use server";
import { jwtVerify } from "jose";
import { getToken } from "next-auth/jwt";
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// const publicRoutes: string[] = ["/"];
const guestRoutes: string[] = [
  "/confirm",
  "/confirmation-sent",
  "/forgot-password",
  "/recover-account",
];
const privateRoutes: string[] = [
  "/machines",
  "/apps",
  "/logs",
  "/analytics",
  "/resources",
  "/api-keys",
  "/settings",
];

export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  async function middleware(req) {
    // NOTE - this is executed AFTER the withAuth
    const { pathname } = req.nextUrl;

    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
      cookieName: "next-auth.session-token",
      decode: async ({ token, secret }) => {
        // NOTE: If you change here, also change auth.ts
        if (!token) {
          return null;
        }

        try {
          if (typeof secret !== "string")
            throw new Error("Only strings supported for jwt secret");

          const { payload } = await jwtVerify(
            token,
            new TextEncoder().encode(secret),
          );

          return payload;
        } catch (err) {
          return null;
        }
      },
    });
    const isAuthenticated = !!token;

    // console.log("middleware");
    // console.log(token, isAuthenticated);

    // if (publicRoutes.includes(pathname)) return NextResponse.next();
    if (guestRoutes.includes(pathname) && isAuthenticated) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    const isPrivateRoute = privateRoutes.some((route) =>
      pathname.startsWith(route),
    );

    if (isPrivateRoute && !isAuthenticated) {
      return NextResponse.redirect(new URL("/", req.url));
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
