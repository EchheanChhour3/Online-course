"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  Code2,
  Globe,
  Palette,
  BookOpen,
  Cpu,
  Database,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCategories } from "@/contexts/category-context";
import {
  ICON_OPTIONS,
  COLOR_OPTIONS,
  type Category,
} from "@/lib/category-data";

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
  return COLOR_OPTIONS.find((c) => c.value === color)?.class ?? "text-gray-500";
}

export default function CategoryManagePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const { categories, addCategory, updateCategory, deleteCategory, getCategory } =
    useCategories();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    iconName: "Code2",
    iconColor: "pink",
  });

  useEffect(() => {
    if (editId) {
      const cat = getCategory(editId);
      if (cat) {
        setEditingCategory(cat);
        setFormData({
          name: cat.name,
          iconName: cat.iconName,
          iconColor: cat.iconColor,
        });
      }
    }
  }, [editId, getCategory]);

  const resetForm = () => {
    setFormData({ name: "", iconName: "Code2", iconColor: "pink" });
    setEditingCategory(null);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    addCategory({
      name: formData.name.trim(),
      slug: formData.name.trim().toLowerCase().replace(/\s+/g, "-"),
      iconName: formData.iconName,
      iconColor: formData.iconColor,
      courses: [],
    });
    resetForm();
    setIsCreateOpen(false);
    router.push("/dashboard/category");
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !formData.name.trim()) return;
    updateCategory(editingCategory.id, {
      name: formData.name.trim(),
      iconName: formData.iconName,
      iconColor: formData.iconColor,
    });
    resetForm();
    setEditingCategory(null);
    router.push("/dashboard/category");
  };

  const handleDelete = () => {
    if (!deletingCategory) return;
    deleteCategory(deletingCategory.id);
    setDeletingCategory(null);
    router.push("/dashboard/category");
  };

  const openEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      iconName: category.iconName,
      iconColor: category.iconColor,
    });
  };

  return (
    <div className="min-h-screen bg-white p-8 sm:p-10 lg:p-12">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <button
          onClick={() => router.push("/dashboard/category")}
          className="p-1 rounded hover:bg-gray-100"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span
          onClick={() => router.push("/dashboard/category")}
          className="hover:text-gray-900 cursor-pointer"
        >
          Category
        </span>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">Manage</span>
      </nav>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Manage Categories</h1>
        <Button
          onClick={() => {
            resetForm();
            setIsCreateOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      <div className="space-y-4">
        {categories.map((category) => {
          const Icon = getIconComponent(category.iconName);
          const colorClass = getColorClass(category.iconColor);

          return (
            <div
              key={category.id}
              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center ${colorClass}`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{category.name}</h3>
                  <p className="text-sm text-gray-500">
                    {category.courses.length} course
                    {category.courses.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEdit(category)}
                >
                  <Pencil className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  onClick={() => setDeletingCategory(category)}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          );
        })}

        {categories.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No categories yet. Click &quot;Add Category&quot; to create one.
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
            <DialogDescription>
              Create a new category to organize your courses.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-name">Name</Label>
              <Input
                id="create-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="e.g. Programming"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Icon</Label>
              <select
                value={formData.iconName}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, iconName: e.target.value }))
                }
                className="w-full h-10 rounded-md border border-gray-300 px-3"
              >
                {ICON_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <select
                value={formData.iconColor}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, iconColor: e.target.value }))
                }
                className="w-full h-10 rounded-md border border-gray-300 px-3"
              >
                {COLOR_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingCategory}
        onOpenChange={(open) => !open && setEditingCategory(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update the category details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="e.g. Programming"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Icon</Label>
              <select
                value={formData.iconName}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, iconName: e.target.value }))
                }
                className="w-full h-10 rounded-md border border-gray-300 px-3"
              >
                {ICON_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <select
                value={formData.iconColor}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, iconColor: e.target.value }))
                }
                className="w-full h-10 rounded-md border border-gray-300 px-3"
              >
                {COLOR_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingCategory(null)}
              >
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
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
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
