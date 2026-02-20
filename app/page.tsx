"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  GraduationCap,
  Users,
  Sparkles,
  ArrowRight,
  ChevronRight,
  PlayCircle,
  BarChart3,
  Globe,
  Award,
  Shield,
} from "lucide-react";

export default function HomePage() {
  const { data: session, status } = useSession();
  const isLoggedIn = !!session?.user;

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Subtle background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/30" />
        <div className="absolute top-0 left-0 right-0 h-[600px] bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgb(25_167_232/0.15),transparent)]" />
      </div>

      {/* Navigation */}
      <header className="relative border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#19a7e8]">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              EduFlow
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
                <Link href="/dashboard/course">
                  <span>Go to Dashboard</span>
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

      <main>
        {/* Hero Section */}
        <section className="relative px-4 pt-20 pb-28 sm:px-6 sm:pt-28 sm:pb-36 lg:px-8">
          <div className="mx-auto max-w-7xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Learn from industry experts</span>
            </div>

            <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="block">Your future starts</span>
              <span className="mt-2 block bg-gradient-to-r from-[#19a7e8] to-[#0ea5e9] bg-clip-text text-transparent">
                here
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl">
              Master new skills with expert-led courses. Join thousands of
              learners building careers in programming, design, data science,
              and more.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              {isLoggedIn ? (
                <Button
                  asChild
                  size="lg"
                  className="h-14 rounded-xl bg-[#19a7e8] px-8 text-base font-semibold hover:bg-[#1590d4]"
                >
                  <Link href="/dashboard/course">
                    Continue Learning
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button
                    asChild
                    size="lg"
                    className="h-14 rounded-xl bg-[#19a7e8] px-8 text-base font-semibold shadow-lg shadow-[#19a7e8]/25 hover:bg-[#1590d4] hover:shadow-xl hover:shadow-[#19a7e8]/30"
                  >
                    <Link href="/register">
                      Get Started Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
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

            <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-slate-500">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-500" />
                <span>Free to start</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500" />
                <span>Certificates included</span>
              </div>
              <div className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5 text-blue-500" />
                <span>Learn at your pace</span>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="border-y border-slate-200 bg-slate-50/80 py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#19a7e8] sm:text-4xl">
                  50K+
                </div>
                <div className="mt-1 text-sm font-medium text-slate-600">
                  Active Learners
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900 sm:text-4xl">
                  500+
                </div>
                <div className="mt-1 text-sm font-medium text-slate-600">
                  Expert Courses
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900 sm:text-4xl">
                  98%
                </div>
                <div className="mt-1 text-sm font-medium text-slate-600">
                  Completion Rate
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900 sm:text-4xl">
                  24/7
                </div>
                <div className="mt-1 text-sm font-medium text-slate-600">
                  Access Anytime
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-base font-semibold uppercase tracking-wider text-[#19a7e8]">
                Why choose us
              </h2>
              <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Everything you need to level up
              </p>
              <p className="mt-4 text-lg text-slate-600">
                From beginner to advanced, we&apos;ve got courses designed for
                every step of your journey.
              </p>
            </div>

            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: BookOpen,
                  title: "Structured Learning",
                  description:
                    "Curated paths that take you from basics to mastery with clear milestones.",
                  color: "bg-blue-500/10 text-blue-600",
                },
                {
                  icon: Users,
                  title: "Expert Instructors",
                  description:
                    "Learn from professionals with years of real-world experience.",
                  color: "bg-emerald-500/10 text-emerald-600",
                },
                {
                  icon: BarChart3,
                  title: "Track Progress",
                  description:
                    "Visual dashboards and certificates to showcase your growth.",
                  color: "bg-amber-500/10 text-amber-600",
                },
                {
                  icon: Globe,
                  title: "Learn Anywhere",
                  description:
                    "Access courses on any device. Offline mode available soon.",
                  color: "bg-violet-500/10 text-violet-600",
                },
              ].map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
                  >
                    <div
                      className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.color}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 font-semibold text-slate-900">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#19a7e8] to-[#0ea5e9] px-8 py-16 sm:px-12 sm:py-20">
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Ready to transform your career?
                </h2>
                <p className="mt-4 text-lg text-blue-100">
                  Join our community and start learning today. No credit card
                  required.
                </p>
                {!isLoggedIn && (
                  <div className="mt-8">
                    <Button
                      asChild
                      size="lg"
                      className="h-14 rounded-xl bg-white px-8 text-base font-semibold text-[#19a7e8] hover:bg-blue-50"
                    >
                      <Link href="/register">
                        Create Free Account
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                  </div>
                )}
                {isLoggedIn && (
                  <div className="mt-8">
                    <Button
                      asChild
                      size="lg"
                      className="h-14 rounded-xl bg-white px-8 text-base font-semibold text-[#19a7e8] hover:bg-blue-50"
                    >
                      <Link href="/dashboard/course">
                        Open Dashboard
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50/50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-[#19a7e8]" />
              <span className="font-semibold text-slate-900">EduFlow</span>
            </div>
            <div className="flex gap-8 text-sm text-slate-600">
              <Link href="#" className="hover:text-slate-900">
                Courses
              </Link>
              <Link href="#" className="hover:text-slate-900">
                About
              </Link>
              <Link href="#" className="hover:text-slate-900">
                Contact
              </Link>
            </div>
          </div>
          <p className="mt-8 text-center text-sm text-slate-500">
            © {new Date().getFullYear()} EduFlow. Start learning, keep growing.
          </p>
        </div>
      </footer>
    </div>
  );
}
