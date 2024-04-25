import axios from "axios";
import { SignJWT, jwtVerify } from "jose";
import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next";
import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";

// You'll need to import and pass this
// to `NextAuth` in `app/api/auth/[...nextauth]/route.ts`
export const config = {
  jwt: {
    encode: async ({ token, secret }) => {
      if (token && secret) {
        if (typeof secret !== "string")
          throw new Error("Only strings supported for jwt secret");
        return await new SignJWT(token)
          .setProtectedHeader({ alg: "HS256", typ: "JWT" })
          .sign(new TextEncoder().encode(secret));
      }
      return "";
    },
    decode: async ({ token, secret }) => {
      // NOTE: If you change here, also change middleware.ts
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
  },
  secret: process.env.NEXTAUTH_SECRET,
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        domain: process.env.NEXTAUTH_COOKIE_DOMAIN,
        path: "/",
        // REVIEW secure:true
      },
    },
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    // TODO: Study about this
    async session({ session, token }) {
      if (token.user) {
        session.user = token.user;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token = { ...token, ...user };
      }
      return token;
    },
  },
  providers: [
    Credentials({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: "Credentials",
      // `credentials` is used to generate a form on the sign in page.
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        username: {
          label: "Username",
          type: "text",
          placeholder: "Your username",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Your password",
        },
      },
      async authorize(credentials, req) {
        try {
          const data = await axios
            .post(process.env.NEXT_INTERNAL_API_URL + "/api/login", credentials)
            .then((res) => {
              return res.data;
            });

          return data;
        } catch (err: any) {
          switch (err?.response?.status) {
            case 404:
              throw new Error("The user does not exist.");
            case 400:
              throw new Error("Invalid username or password.");
            default:
              throw new Error("Try again later.");
          }
        }
      },
    }),
  ],
} satisfies NextAuthOptions;

// // Need to replace original method because I also replaced the way of decoding jwt
// export const getTokenCustom = async (req: NextRequestWithAuth) => {
//   const cookieName =
//     config?.cookies?.sessionToken?.name || "next-auth.session-token";
//   const cookieValue = req.cookies.get(cookieName)?.value;

//   if (!cookieValue) {
//     return null;
//   }

//   return await config.jwt.decode({
//     secret: process.env.NEXTAUTH_SECRET || "",
//     token: cookieValue,
//   });
// };

// Use it in server contexts
export function auth(
  ...args:
    | [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]]
    | [NextApiRequest, NextApiResponse]
    | []
) {
  return getServerSession(...args, config);
}
