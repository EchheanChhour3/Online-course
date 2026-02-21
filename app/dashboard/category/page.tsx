"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useRole } from "@/contexts/role-context";
import {
  CategoryList,
  CategoryFormDialog,
  CategoryDeleteDialog,
} from "@/components/category";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type CategoryItem,
} from "@/services/category.service";

export default function CategoryPage() {
  const { role } = useRole();
  const { data: session, status } = useSession();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<CategoryItem | null>(
    null,
  );
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(
    null,
  );
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isAdmin = role === "admin";

  const fetchCategories = useCallback(async () => {
    if (status === "unauthenticated") {
      setLoading(false);
      setError("Please sign in to view categories.");
      return;
    }
    const token = session?.accessToken;
    if (!token) {
      if (status === "authenticated") {
        setLoading(false);
        setError("Session expired. Please sign in again.");
      }
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await getCategories(token, { page: 1, size: 50 });
      setCategories(res.payload.items ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load categories",
      );
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, status]);

  useEffect(() => {
    if (status === "loading") return;
    fetchCategories();
  }, [fetchCategories, status]);

  const resetForm = () => {
    setCategoryName("");
    setEditingCategory(null);
    setSubmitError(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const handleEdit = (category: CategoryItem) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setSubmitError(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;
    const token = session?.accessToken;
    if (!token) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await createCategory(token, categoryName.trim());
      toast.success("Category created successfully");
      resetForm();
      setIsCreateOpen(false);
      await fetchCategories();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create category";
      setSubmitError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !categoryName.trim()) return;
    const token = session?.accessToken;
    if (!token) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await updateCategory(
        token,
        editingCategory.category_id,
        categoryName.trim(),
      );
      toast.success("Category updated successfully");
      resetForm();
      await fetchCategories();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update category";
      setSubmitError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (category: CategoryItem) => {
    setDeletingCategory(category);
    setSubmitError(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;
    const token = session?.accessToken;
    if (!token) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await deleteCategory(token, deletingCategory.category_id);
      toast.success("Category deleted successfully");
      setDeletingCategory(null);
      await fetchCategories();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete category";
      setSubmitError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 m-8">
        <div className="flex items-center justify-center min-h-[200px]">
          <p className="text-gray-500">Loading categories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 m-8">
        <div className="flex flex-col items-center justify-center min-h-[200px] gap-2">
          <p className="text-red-500">{error}</p>
          <Button variant="outline" onClick={fetchCategories}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 m-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Category</h1>
          <p className="text-gray-500 text-sm mt-1">
            {isAdmin
              ? "Organize courses by category. Create, edit, or remove categories."
              : "Browse categories and courses."}
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={openCreateDialog}
            className="bg-blue-600 hover:bg-blue-700 shrink-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        )}
      </div>

      <CategoryList
        categories={categories}
        isAdmin={isAdmin}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onAddClick={openCreateDialog}
      />

      <CategoryFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        mode="create"
        name={categoryName}
        onNameChange={setCategoryName}
        onSubmit={handleCreate}
        submitting={submitting}
        error={submitError}
        onErrorClear={() => setSubmitError(null)}
      />

      <CategoryFormDialog
        open={!!editingCategory}
        onOpenChange={(open) => !open && resetForm()}
        mode="edit"
        name={categoryName}
        onNameChange={setCategoryName}
        onSubmit={handleUpdate}
        submitting={submitting}
        error={submitError}
        onErrorClear={() => setSubmitError(null)}
      />

      <CategoryDeleteDialog
        category={deletingCategory}
        open={!!deletingCategory}
        onOpenChange={(open) => !open && setDeletingCategory(null)}
        onConfirm={handleDeleteConfirm}
        submitting={submitting}
        error={submitError}
        onErrorClear={() => setSubmitError(null)}
      />
    </div>
  );
}
