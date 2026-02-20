"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

interface CategoryPageHeaderProps {
  title?: string;
}

export function CategoryPageHeader({ title = "Category" }: CategoryPageHeaderProps) {
  const router = useRouter();

  return (
    <header className="flex items-center gap-3 mb-8">
      <button
        onClick={() => router.back()}
        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
        aria-label="Go back"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
    </header>
  );
}
