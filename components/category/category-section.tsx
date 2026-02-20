"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryCourseCard, type CategoryCourseCardProps } from "./category-course-card";

export interface CategorySectionProps {
  name: string;
  icon: ReactNode;
  viewMoreHref: string;
  courses: CategoryCourseCardProps[];
  onEdit?: () => void;
  onDelete?: () => void;
}

export function CategorySection({
  name,
  icon,
  viewMoreHref,
  courses,
  onEdit,
  onDelete,
}: CategorySectionProps) {
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-gray-100">
            {icon}
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-900">{name}</h2>
            {(onEdit || onDelete) && (
              <div className="flex gap-1">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    onClick={onEdit}
                    aria-label="Edit category"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={onDelete}
                    aria-label="Delete category"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
        <Link
          href={viewMoreHref}
          className="text-blue-600 hover:text-blue-500 text-sm font-medium flex items-center gap-1"
        >
          View More
          <span>&gt;</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {courses.map((course, index) => (
          <CategoryCourseCard key={`${course.title}-${index}`} {...course} />
        ))}
      </div>
    </section>
  );
}
