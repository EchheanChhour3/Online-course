"use client";

import { useState } from "react";
import { Play } from "lucide-react";

interface CourseVideoPlayerProps {
  thumbnailSrc?: string;
  videoUrl?: string;
  title?: string;
  /** When true, show video playing immediately (e.g. when user clicked a lesson) */
  autoPlay?: boolean;
}

export function CourseVideoPlayer({
  thumbnailSrc,
  videoUrl,
  title = "Course Introduction",
  autoPlay = false,
}: CourseVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  const canPlay = Boolean(videoUrl?.trim());
  const showPlaying = canPlay && (isPlaying || autoPlay);

  if (canPlay && showPlaying) {
    const url = videoUrl!.trim();
    const isYoutube = /youtube\.com|youtu\.be/i.test(url);
    let embedSrc = url;
    if (isYoutube) {
      let vid = "";
      if (url.includes("youtu.be/")) vid = url.split("youtu.be/")[1]?.split("?")[0] ?? "";
      else if (url.includes("embed/")) embedSrc = url;
      else {
        const m = url.match(/[?&]v=([^&]+)/);
        vid = m?.[1] ?? "";
        if (vid) embedSrc = `https://www.youtube.com/embed/${vid}`;
      }
      if (vid && !url.includes("embed/")) embedSrc = `https://www.youtube.com/embed/${vid}`;
      embedSrc += embedSrc.includes("?") ? "&autoplay=1" : "?autoplay=1";
    }

    return (
      <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg">
        {isYoutube ? (
          <iframe
            src={embedSrc}
            title={title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            src={url}
            controls
            autoPlay
            className="w-full h-full"
          >
            Your browser does not support the video tag.
          </video>
        )}
      </div>
    );
  }

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
            <p className="text-sm">
              {canPlay ? "Click to play" : "No video available"}
            </p>
          </div>
        </div>
      )}
      {canPlay ? (
        <button
          onClick={() => setIsPlaying(true)}
          className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors group"
        >
          <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Play className="w-10 h-10 text-blue-600 fill-blue-600 ml-1" />
          </div>
        </button>
      ) : (
        <div className="absolute inset-0" />
      )}
    </div>
  );
}
