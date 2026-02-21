// lib/auth.ts
import NextAuth from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { login, googleAuth } from "@/services/auth.service";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string[];
      status?: string;
      full_name?: string;
    };
    accessToken?: string;
  }

  interface User {
    id: string;
    email: string;
    name?: string;
    role?: string[];
    status?: string;
    full_name?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string[];
    status?: string;
    accessToken?: string;
    full_name?: string;
  }
}

export const config = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        const response = await login({ email, password });

        if (response.status === "OK" && response.payload?.user) {
          const user = response.payload.user;
          return {
            id: user.user_id.toString(),
            email: user.email,
            name: user.full_name,
            role: user.role,
            status: user.status,
            accessToken: response.payload.accessToken,
          };
        }
        throw new Error("Invalid credentials");
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          scope: "openid email profile",
          prompt: "select_account",
        },
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async jwt({
      token,
      user,
      account,
    }: {
      token: JWT;
      user?: {
        id?: string;
        role?: string[];
        status?: string;
        accessToken?: string;
        full_name?: string;
      };
      account?: { provider?: string; id_token?: string; idToken?: string };
    }) {
      if (account?.provider === "google") {
        const idToken = account.id_token ?? account.idToken;
        if (!idToken) {
          console.error("Google account missing id_token");
          return token;
        }
        try {
          const res = await googleAuth(idToken);
          if (res?.payload?.accessToken && res?.payload?.user) {
            const u = res.payload.user;
            token.id = String(u.user_id);
            token.role = u.role;
            token.status = u.status;
            token.accessToken = res.payload.accessToken;
            token.full_name = u.full_name;
            return token;
          }
        } catch (e) {
          console.error("Google auth backend failed:", e);
          throw e;
        }
      }
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.status = user.status;
        token.accessToken = user.accessToken;
        token.full_name = user.full_name;
      }
      return token;
    },
    async session({ session, token }): Promise<Session> {
      const s = session as Session;
      if (token && s.user) {
        Object.assign(s.user, {
          id: token.id ?? "",
          role: token.role,
          status: token.status,
          full_name: token.full_name,
        });
        s.accessToken = token.accessToken;
      }
      return s;
    },
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth(config);
export const authOptions = config;
