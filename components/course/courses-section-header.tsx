"use client";

import Link from "next/link";

interface CoursesSectionHeaderProps {
  title?: string;
  seeAllHref?: string;
}

export function CoursesSectionHeader({
  title = "My courses",
  seeAllHref = "/dashboard/course/all",
}: CoursesSectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      <Link
        href={seeAllHref}
        className="text-blue-600 hover:text-blue-500 text-sm font-medium transition-colors"
      >
        See all
      </Link>
    </div>
  );
}
