"use client";

import { Button } from "@/components/ui/button";
import { Monitor, Layout } from "lucide-react";

interface RecommendedCourseBannerProps {
  title?: string;
  description?: string;
  enrolledCount?: string;
  tag?: string;
  onStartLearning?: () => void;
}

export function RecommendedCourseBanner({
  title = "Mastering UI/UX Design : From Zero to Hero",
  description = "Based on your recent interest in design, we think you'll love this course on creating stunning prototype",
  enrolledCount = "+1.2k enrolled",
  tag = "Recommended for You",
  onStartLearning,
}: RecommendedCourseBannerProps) {
  return (
    <div className="rounded-2xl bg-blue-600 p-6 sm:p-8 overflow-hidden relative mb-8">
      {/* Tag */}
      <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-sm font-medium mb-4">
        {tag}
      </span>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
        {/* Left - Course info */}
        <div className="flex-1 max-w-xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-3">
            {title}
          </h2>
          <p className="text-blue-100 text-base mb-6">{description}</p>

          <Button
            onClick={onStartLearning}
            className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-6 py-3 rounded-lg"
          >
            Start Learning
          </Button>

          <div className="flex items-center gap-2 mt-4">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-white/30 border-2 border-blue-600 flex items-center justify-center text-white text-xs font-medium">
                A
              </div>
              <div className="w-8 h-8 rounded-full bg-white/30 border-2 border-blue-600 flex items-center justify-center text-white text-xs font-medium">
                B
              </div>
            </div>
            <span className="text-blue-100 text-sm">{enrolledCount}</span>
          </div>
        </div>

        {/* Right - Illustration */}
        <div className="hidden lg:flex lg:w-80 lg:flex-shrink-0 items-center justify-center">
          <div className="relative w-64 h-48 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 to-purple-500/30 rounded-2xl blur-xl" />
            <div className="relative flex flex-col items-center gap-2">
              <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center">
                <Monitor className="w-10 h-10 text-white" />
              </div>
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/20" />
                <div className="w-8 h-8 rounded-lg bg-white/20" />
                <div className="w-8 h-8 rounded-lg bg-white/20" />
              </div>
              <Layout className="w-12 h-12 text-white/60" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
