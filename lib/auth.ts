// lib/auth.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { login } from "@/services/auth.service";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string[];
      status?: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string;
    role?: string[];
    status?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role?: string[];
    status?: string;
    accessToken?: string;
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

        try {
          const email = credentials.email as string;
          const password = credentials.password as string;

          // Call the real API
          const response = await login({ email, password });

          if (response.status === "OK" && response.payload.user) {
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

          return null;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
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
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.status = user.status;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token && session.user) {
        session.user = {
          ...session.user,
          id: token.id as string,
          role: token.role,
          status: token.status,
        };
      }
      return session;
    },
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth(config);
export const authOptions = config;
