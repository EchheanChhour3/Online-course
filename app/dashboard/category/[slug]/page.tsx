"use client";

import { useParams, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useCategories } from "@/contexts/category-context";
import { CategoryCourseCard } from "@/components/category";
import { Code2, Globe, Palette, BookOpen, Cpu, Database } from "lucide-react";

const ICON_MAP = {
  Code2,
  Globe,
  Palette,
  BookOpen,
  Cpu,
  Database,
};

function getIconComponent(name: string) {
  return ICON_MAP[name as keyof typeof ICON_MAP] || Code2;
}

function getColorClass(color: string): string {
  const COLOR_MAP: Record<string, string> = {
    pink: "text-pink-500",
    blue: "text-blue-500",
    amber: "text-amber-500",
    green: "text-green-500",
    purple: "text-purple-500",
    red: "text-red-500",
  };
  return COLOR_MAP[color] ?? "text-gray-500";
}

export default function CategorySlugPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { categories } = useCategories();

  const category = categories.find((c) => c.slug === slug);

  if (!category) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <p className="text-gray-500">Category not found.</p>
        <button
          onClick={() => router.push("/dashboard/category")}
          className="mt-4 text-blue-600 hover:underline"
        >
          Back to Category
        </button>
      </div>
    );
  }

  const Icon = getIconComponent(category.iconName);
  const colorClass = getColorClass(category.iconColor);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="flex items-center gap-3 mb-8">
        <button
          onClick={() => router.push("/dashboard/category")}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-gray-100">
          <Icon className={`w-6 h-6 ${colorClass}`} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {category.courses.map((course, index) => (
          <CategoryCourseCard
            key={`${course.title}-${index}`}
            title={course.title}
            instructor={course.instructor}
            imageSrc={course.imageSrc}
          />
        ))}
      </div>

      {category.courses.length === 0 && (
        <p className="text-gray-500 py-8">No courses in this category yet.</p>
      )}
    </div>
  );
}
