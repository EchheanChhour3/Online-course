"use client";
import Link from "next/link";
import { Button } from "../components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center max-w-2xl mx-auto p-8">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Online Course Platform
        </h1>
        <p className="text-xl text-gray-600 mb-12">
          Start your learning journey today with our comprehensive online
          courses
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="bg-foreground/10 rounded-[calc(var(--radius-xl)+0.125rem)] border p-0.5">
            <Button
              asChild
              size="lg"
              className="rounded-xl px-8 text-base bg-blue-600 hover:bg-blue-700"
            >
              <Link href="/login">
                <span className="text-nowrap">Sign In</span>
              </Link>
            </Button>
          </div>

          <Button
            asChild
            size="lg"
            variant="ghost"
            className="h-10.5 rounded-xl px-8 border hover:bg-gray-100"
          >
            <Link href="/register">
              <span className="text-nowrap">Create Account</span>
            </Link>
          </Button>
        </div>

        <div className="mt-16 text-sm text-gray-500">
          <p>
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
          <p className="mt-2">
            New here?{" "}
            <Link href="/register" className="text-blue-600 hover:underline">
              Register now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
