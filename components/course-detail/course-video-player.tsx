"use client";

import { useState } from "react";
import { Play } from "lucide-react";

interface CourseVideoPlayerProps {
  thumbnailSrc?: string;
  videoUrl?: string;
  title?: string;
}

export function CourseVideoPlayer({
  thumbnailSrc,
  title = "Course Introduction",
}: CourseVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden shadow-lg relative">
      {thumbnailSrc ? (
        <img
          src={thumbnailSrc}
          alt={title}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <div className="w-24 h-24 rounded-full bg-gray-600/50 flex items-center justify-center mx-auto mb-2">
              <Play className="w-12 h-12 text-white fill-white ml-1" />
            </div>
            <p className="text-sm">Course Introduction Video</p>
          </div>
        </div>
      )}
      <button
        onClick={() => setIsPlaying(true)}
        className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors group"
      >
        <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Play className="w-10 h-10 text-blue-600 fill-blue-600 ml-1" />
        </div>
      </button>
    </div>
  );
}
