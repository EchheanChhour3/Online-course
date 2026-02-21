"use client";

import { Button } from "@/components/ui/button";
import { Play, Star } from "lucide-react";

export interface CourseCardBaseProps {
  imageSrc?: string;
  title: string;
  author: string;
  courseId?: number;
  onViewCourse?: (courseId: number) => void;
}

export interface CourseCardProgressProps extends CourseCardBaseProps {
  variant: "progress";
  progress: number;
  onContinue?: () => void;
  hideActions?: boolean;
}

export interface CourseCardEnrollmentProps extends CourseCardBaseProps {
  variant: "enrollment";
  rating?: number;
  duration?: string;
  onEnroll?: () => void;
  hideActions?: boolean;
}

export type CourseCardProps = CourseCardProgressProps | CourseCardEnrollmentProps;

const placeholderImages = [
  "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=200&fit=crop",
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=200&fit=crop",
  "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=200&fit=crop",
];

export function CourseCard(props: CourseCardProps) {
  const { title, author, imageSrc, variant, courseId, onViewCourse } = props;
  const hideActions = "hideActions" in props && props.hideActions;
  const isClickable = courseId != null && onViewCourse != null;
  const imgSrc =
    imageSrc ||
    placeholderImages[Math.floor(Math.random() * placeholderImages.length)];

  return (
    <article className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-gray-300 transition-colors shadow-sm">
      {/* Image - clickable to view course */}
      <div
        className={`relative h-40 overflow-hidden ${isClickable ? "cursor-pointer" : ""}`}
        onClick={() => isClickable && onViewCourse!(courseId!)}
        onKeyDown={(e) => {
          if (isClickable && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            onViewCourse!(courseId!);
          }
        }}
        role={isClickable ? "button" : undefined}
        tabIndex={isClickable ? 0 : undefined}
      >
        <img
          src={imgSrc}
          alt={title}
          className="w-full h-full object-cover"
        />
        {variant === "enrollment" && props.rating != null && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-white text-sm font-medium">
              {props.rating}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3
          className={`font-bold text-gray-900 text-lg mb-1 line-clamp-1 ${isClickable ? "cursor-pointer hover:text-blue-600 hover:underline" : ""}`}
          onClick={() => isClickable && onViewCourse!(courseId!)}
          onKeyDown={(e) => {
            if (isClickable && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              onViewCourse!(courseId!);
            }
          }}
          role={isClickable ? "button" : undefined}
          tabIndex={isClickable ? 0 : undefined}
        >
          {title}
        </h3>
        <p className="text-gray-500 text-sm mb-4">By {author}</p>

        {variant === "progress" && (
          <>
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span>Progress</span>
              <span>{props.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${props.progress}%` }}
              />
            </div>
            {!hideActions && (
              <Button
                onClick={props.onContinue}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-2"
              >
                <Play className="w-4 h-4 mr-2 fill-current" />
                Continue
              </Button>
            )}
          </>
        )}

        {variant === "enrollment" && (
          <>
            {props.duration && (
              <p className="text-gray-500 text-sm mb-4">{props.duration}</p>
            )}
            {!hideActions && (
              <Button
                onClick={props.onEnroll}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-2"
              >
                Enroll
              </Button>
            )}
          </>
        )}
      </div>
    </article>
  );
}
