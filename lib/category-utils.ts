import { Code2, Globe, Palette, BookOpen, Cpu, Database } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Code2,
  Globe,
  Palette,
  BookOpen,
  Cpu,
  Database,
};

const COLOR_MAP: Record<string, string> = {
  pink: "text-pink-500",
  blue: "text-blue-500",
  amber: "text-amber-500",
  green: "text-green-500",
  purple: "text-purple-500",
  red: "text-red-500",
};

export function getIconComponent(name: string): LucideIcon {
  return ICON_MAP[name] ?? Code2;
}

export function getColorClass(color: string): string {
  return COLOR_MAP[color] ?? "text-gray-500";
}

type ApiCourse = {
  title?: string;
  name?: string;
  courseName?: string;
  course_name?: string;
  instructor?: string;
  instructorName?: string;
  instructor_name?: string;
  imageSrc?: string;
  thumbnail?: string;
};

export function mapCourseToCard(
  c: unknown
): { title: string; instructor: string; imageSrc?: string } {
  const course = c as ApiCourse;
  const title = course?.title ?? course?.name ?? course?.courseName ?? course?.course_name ?? "Untitled Course";
  const instructor = course?.instructor ?? course?.instructorName ?? course?.instructor_name ?? "Unknown";
  const imageSrc = course?.imageSrc ?? course?.thumbnail;
  return { title, instructor, imageSrc };
}
