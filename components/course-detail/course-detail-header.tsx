"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface CourseDetailHeaderProps {
  title?: string;
  breadcrumbs: BreadcrumbItem[];
}

export function CourseDetailHeader({
  title = "Course Page",
  breadcrumbs,
}: CourseDetailHeaderProps) {
  const router = useRouter();

  return (
    <header className="mb-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <button
          onClick={() => router.back()}
          className="p-1 rounded hover:bg-gray-100"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {breadcrumbs.map((item, index) => (
          <span key={item.label} className="flex items-center gap-2">
            {index > 0 && <ChevronRight className="w-4 h-4" />}
            {item.href ? (
              <button
                onClick={() => item.href && router.push(item.href)}
                className="hover:text-gray-900 transition-colors"
              >
                {item.label}
              </button>
            ) : (
              <span className="text-gray-900 font-medium">{item.label}</span>
            )}
          </span>
        ))}
      </nav>
    </header>
  );
}
