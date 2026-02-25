"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Shield, ArrowRight } from "lucide-react";

export default function HomePage() {
  const { data: session, status } = useSession();
  const isLoggedIn = !!session?.user;

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/30" />
      </div>

      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#19a7e8]">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Auth
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {status === "loading" ? (
              <div className="h-10 w-24 animate-pulse rounded-lg bg-slate-200" />
            ) : isLoggedIn ? (
              <Button
                asChild
                size="lg"
                className="rounded-xl bg-[#19a7e8] px-6 hover:bg-[#1590d4]"
              >
                <Link href="/profile">
                  <span>Profile</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button
                  asChild
                  variant="ghost"
                  size="lg"
                  className="rounded-xl font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                >
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  className="rounded-xl bg-[#19a7e8] px-6 hover:bg-[#1590d4]"
                >
                  <Link href="/register">Create Account</Link>
                </Button>
              </>
            )}
          </div>
        </nav>
      </header>

      <main className="relative px-4 pt-20 pb-28 sm:px-6 sm:pt-28 sm:pb-36 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            <span className="block">Authentication</span>
            <span className="mt-2 block bg-gradient-to-r from-[#19a7e8] to-[#0ea5e9] bg-clip-text text-transparent">
              Made Simple
            </span>
          </h1>
          <p className="mx-auto mt-6 text-lg text-slate-600">
            Sign in, register, or manage your profile. Password reset and Google sign-in supported.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {isLoggedIn ? (
              <Button
                asChild
                size="lg"
                className="h-14 rounded-xl bg-[#19a7e8] px-8 text-base font-semibold hover:bg-[#1590d4]"
              >
                <Link href="/profile">
                  View Profile
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            ) : (
              <>
                <Button
                  asChild
                  size="lg"
                  className="h-14 rounded-xl bg-[#19a7e8] px-8 text-base font-semibold shadow-lg shadow-[#19a7e8]/25 hover:bg-[#1590d4]"
                >
                  <Link href="/register">Create Account</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-14 rounded-xl border-2 border-slate-300 px-8 text-base font-semibold hover:border-slate-400 hover:bg-slate-50"
                >
                  <Link href="/login">Sign In</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-slate-50/50 py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} Auth. Sign in, register, reset password.
        </div>
      </footer>
    </div>
  );
}
