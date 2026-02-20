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

          console.log("NextAuth authorize called with:", {
            email,
            password: "***",
          });

          // Call the real API
          const response = await login({ email, password });
          console.log("NextAuth login response:", response);

          if (response.status === "OK" && response.payload.user) {
            const user = response.payload.user;
            console.log("NextAuth login successful for:", user.email);
            return {
              id: user.user_id.toString(),
              email: user.email,
              name: user.full_name,
              role: user.role,
              status: user.status,
              accessToken: response.payload.accessToken,
            };
          }

          console.log("NextAuth login failed - invalid response:", response);
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
        token.full_name = user.full_name;
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
          full_name: token.full_name,
        };
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth(config);
export const authOptions = config;
