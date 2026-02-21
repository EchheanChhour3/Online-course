"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CategorySection } from "./category-section";
import { getIconComponent, getColorClass, mapCourseToCard } from "@/lib/category-utils";
import type { CategoryItem } from "@/services/category.service";

interface CategoryListProps {
  categories: CategoryItem[];
  isAdmin: boolean;
  onEdit: (category: CategoryItem) => void;
  onDelete: (category: CategoryItem) => void;
  onAddClick: () => void;
}

export function CategoryList({
  categories,
  isAdmin,
  onEdit,
  onDelete,
  onAddClick,
}: CategoryListProps) {
  return (
    <>
      <div className="space-y-12">
        {categories.map((category) => {
          const Icon = getIconComponent("Code2");
          const colorClass = getColorClass("pink");
          const courses = Array.isArray(category.courses)
            ? category.courses.map(mapCourseToCard)
            : [];

          return (
            <CategorySection
              key={category.category_id}
              name={category.name}
              icon={<Icon className={`w-6 h-6 ${colorClass}`} />}
              courses={courses}
              onEdit={isAdmin ? () => onEdit(category) : undefined}
              onDelete={isAdmin ? () => onDelete(category) : undefined}
            />
          );
        })}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg font-medium">
            {isAdmin ? "No categories yet." : "No categories available."}
          </p>
          <p className="text-sm mt-2">
            {isAdmin
              ? 'Click "Add Category" to create your first category.'
              : "Categories will appear here once they are created."}
          </p>
          {isAdmin && (
            <Button onClick={onAddClick} className="mt-4 bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          )}
        </div>
      )}
    </>
  );
}
