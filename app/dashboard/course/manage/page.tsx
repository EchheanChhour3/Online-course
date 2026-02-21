"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories } from "@/contexts/category-context";
import { useTeachers } from "@/contexts/teacher-context";
import type { CategoryCourse } from "@/lib/category-data";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

type CourseWithCategory = {
  course: CategoryCourse;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  courseIndex: number;
};

export default function CourseManagePage() {
  const router = useRouter();
  const {
    categories,
    addCourseToCategory,
    updateCourseInCategory,
    removeCourseFromCategory,
  } = useCategories();
  const { teachers } = useTeachers();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseWithCategory | null>(
    null
  );
  const [deletingCourse, setDeletingCourse] =
    useState<CourseWithCategory | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [formData, setFormData] = useState({
    categoryId: "",
    title: "",
    instructor: "",
    description: "",
  });

  const allCoursesWithCategory: CourseWithCategory[] = categories.flatMap(
    (cat) =>
      cat.courses.map((course, idx) => ({
        course,
        categoryId: cat.id,
        categoryName: cat.name,
        categorySlug: cat.slug,
        courseIndex: idx,
      }))
  );

  const filteredCourses = allCoursesWithCategory.filter((cwc) => {
    const matchesSearch =
      cwc.course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cwc.course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cwc.categoryName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || cwc.categoryId === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const resetForm = () => {
    setFormData({
      categoryId: categories[0]?.id ?? "",
      title: "",
      instructor: teachers[0]?.name ?? "",
      description: "",
    });
    setEditingCourse(null);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.categoryId) return;
    const selectedTeacher = teachers.find((t) => t.name === formData.instructor);
    addCourseToCategory(formData.categoryId, {
      title: formData.title.trim(),
      instructor: selectedTeacher?.name ?? (formData.instructor.trim() || "Instructor"),
      description: formData.description.trim() || undefined,
      slug: slugify(formData.title.trim()),
      modules: [],
    });
    resetForm();
    setIsCreateOpen(false);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse || !formData.title.trim()) return;
    const updates = {
      title: formData.title.trim(),
      instructor: formData.instructor.trim() || "Instructor",
      description: formData.description.trim() || undefined,
      slug: slugify(formData.title.trim()),
    };
    if (formData.categoryId !== editingCourse.categoryId) {
      removeCourseFromCategory(editingCourse.categoryId, editingCourse.courseIndex);
      addCourseToCategory(formData.categoryId, {
        ...editingCourse.course,
        ...updates,
      });
    } else {
      updateCourseInCategory(editingCourse.categoryId, editingCourse.courseIndex, updates);
    }
    resetForm();
    setEditingCourse(null);
  };

  const handleDelete = () => {
    if (!deletingCourse) return;
    removeCourseFromCategory(deletingCourse.categoryId, deletingCourse.courseIndex);
    setDeletingCourse(null);
  };

  const openEdit = (cwc: CourseWithCategory) => {
    setEditingCourse(cwc);
    setFormData({
      categoryId: cwc.categoryId,
      title: cwc.course.title,
      instructor: cwc.course.instructor,
      description: cwc.course.description ?? "",
    });
  };

  const handleManageContent = (cwc: CourseWithCategory) => {
    const courseSlug = cwc.course.slug || slugify(cwc.course.title);
    router.push(`/dashboard/course/manage/${cwc.categorySlug}/${courseSlug}`);
  };

  return (
    <div className="min-h-screen bg-white p-8 sm:p-10 lg:p-12">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <button
          onClick={() => router.push("/dashboard/course")}
          className="p-1 rounded hover:bg-gray-100"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span
          onClick={() => router.push("/dashboard/course")}
          className="hover:text-gray-900 cursor-pointer"
        >
          Course
        </span>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">Manage</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Manage Courses</h1>
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs h-10"
          />
          <Select
            value={categoryFilter}
            onValueChange={setCategoryFilter}
          >
            <SelectTrigger className="w-[180px] h-10">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={() => {
              resetForm();
              setFormData((p) => ({
                ...p,
                categoryId: categories[0]?.id ?? "",
                instructor: teachers[0]?.name ?? "",
              }));
              setIsCreateOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Course
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredCourses.map((cwc) => (
          <div
            key={`${cwc.categoryId}-${cwc.courseIndex}`}
            className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                <BookOpen className="w-6 h-6 text-gray-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {cwc.course.title}
                </h3>
                <p className="text-sm text-gray-500">
                  {cwc.course.instructor} · {cwc.categoryName}
                </p>
                <p className="text-sm text-gray-500 mt-0.5">
                  {(cwc.course.modules?.length ?? 0)} module
                  {(cwc.course.modules?.length ?? 0) !== 1 ? "s" : ""}
                  {", "}
                  {(cwc.course.modules ?? []).reduce(
                    (acc, m) => acc + m.lessons.length,
                    0
                  )}{" "}
                  lesson
                  {(cwc.course.modules ?? []).reduce(
                    (acc, m) => acc + m.lessons.length,
                    0
                  ) !== 1
                    ? "s"
                    : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleManageContent(cwc)}
              >
                <FolderOpen className="w-4 h-4 mr-1" />
                Content
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openEdit(cwc)}
              >
                <Pencil className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                onClick={() => setDeletingCourse(cwc)}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        ))}

        {filteredCourses.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {searchTerm || categoryFilter !== "all"
              ? "No courses match your filters."
              : 'No courses yet. Click "Add Course" to create one.'}
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Course</DialogTitle>
            <DialogDescription>
              Create a new course. You can add modules and lessons in the Content
              editor after creating.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-category">Category</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(v) =>
                  setFormData((p) => ({ ...p, categoryId: v }))
                }
                required
              >
                <SelectTrigger id="create-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-title">Title</Label>
              <Input
                id="create-title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="e.g. Introduction to React"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-instructor">Instructor</Label>
              <Select
                value={formData.instructor || undefined}
                onValueChange={(v) =>
                  setFormData((p) => ({ ...p, instructor: v }))
                }
              >
                <SelectTrigger id="create-instructor">
                  <SelectValue placeholder="Select instructor" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.length === 0 ? (
                    <SelectItem value="_none" disabled>
                      No teachers. Add in Manage Teachers.
                    </SelectItem>
                  ) : (
                    teachers.map((t) => (
                      <SelectItem key={t.id} value={t.name}>
                        {t.name} {t.role && `(${t.role})`}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-description">Description (optional)</Label>
              <Textarea
                id="create-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Brief course description..."
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create Course</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingCourse}
        onOpenChange={(open) => !open && setEditingCourse(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>
              Update the course details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(v) =>
                  setFormData((p) => ({ ...p, categoryId: v }))
                }
                required
              >
                <SelectTrigger id="edit-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="e.g. Introduction to React"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-instructor">Instructor</Label>
              <Select
                value={formData.instructor || undefined}
                onValueChange={(v) =>
                  setFormData((p) => ({ ...p, instructor: v }))
                }
              >
                <SelectTrigger id="edit-instructor">
                  <SelectValue placeholder="Select instructor" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.length === 0 ? (
                    <SelectItem value="_none" disabled>
                      No teachers. Add in Manage Teachers.
                    </SelectItem>
                  ) : (
                    teachers.map((t) => (
                      <SelectItem key={t.id} value={t.name}>
                        {t.name} {t.role && `(${t.role})`}
                      </SelectItem>
                    ))
                  )}
                  {formData.instructor &&
                    !teachers.some((t) => t.name === formData.instructor) && (
                      <SelectItem value={formData.instructor}>
                        {formData.instructor} (legacy)
                      </SelectItem>
                    )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description (optional)</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Brief course description..."
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingCourse(null)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={!!deletingCourse}
        onOpenChange={(open) => !open && setDeletingCourse(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deletingCourse?.course.title}
              &quot;? This will remove all modules and lessons. This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingCourse(null)}>
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
