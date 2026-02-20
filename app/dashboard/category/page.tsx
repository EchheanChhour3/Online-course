"use client";

import { useRouter } from "next/navigation";
import { Code2, Globe, Palette, BookOpen, Cpu, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  CategoryPageHeader,
  CategorySection,
} from "@/components/category";
import { useCategories } from "@/contexts/category-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import type { Category } from "@/lib/category-data";

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

export default function CategoryPage() {
  const router = useRouter();
  const { categories, deleteCategory } = useCategories();
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  const handleEdit = (category: Category) => {
    router.push(`/dashboard/category/manage?edit=${category.id}`);
  };

  const handleDeleteClick = (category: Category) => {
    setDeletingCategory(category);
  };

  const handleDeleteConfirm = () => {
    if (deletingCategory) {
      deleteCategory(deletingCategory.id);
      setDeletingCategory(null);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <CategoryPageHeader title="Category" />
        <Button
          onClick={() => router.push("/dashboard/category/manage")}
          className="bg-gray-900 hover:bg-gray-800 shrink-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      <div className="space-y-12">
        {categories.map((category) => {
          const Icon = getIconComponent(category.iconName);
          const colorClass = getColorClass(category.iconColor);

          return (
            <CategorySection
              key={category.id}
              name={category.name}
              icon={<Icon className={`w-6 h-6 ${colorClass}`} />}
              viewMoreHref={`/dashboard/category/${category.slug}`}
              courses={category.courses.map((c) => ({
                title: c.title,
                instructor: c.instructor,
                imageSrc: c.imageSrc,
              }))}
              onEdit={() => handleEdit(category)}
              onDelete={() => handleDeleteClick(category)}
            />
          );
        })}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg font-medium">No categories yet.</p>
          <p className="text-sm mt-2">
            Click &quot;Add Category&quot; to create your first category.
          </p>
          <Button
            onClick={() => router.push("/dashboard/category/manage")}
            className="mt-4 bg-gray-900 hover:bg-gray-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deletingCategory}
        onOpenChange={(open) => !open && setDeletingCategory(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deletingCategory?.name}
              &quot;? This will remove {deletingCategory?.courses.length ?? 0}{" "}
              course(s). This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingCategory(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
