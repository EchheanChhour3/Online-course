"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
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
import { useRole } from "@/contexts/role-context";
import {
  getCategories,
  type CategoryItem,
} from "@/services/category.service";
import {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  type CourseItem,
} from "@/services/course.service";
import { getTeachers, type TeacherItem } from "@/services/teacher.service";
import { toast } from "sonner";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

type CourseWithCategory = {
  course: CourseItem;
  categoryId: number;
  categoryName: string;
  courseIndex: number;
};

export default function CourseManagePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { role } = useRole();

  const canManageCourses = role === "admin" || role === "teacher";

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [coursesById, setCoursesById] = useState<Map<number, CourseItem>>(
    new Map()
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseWithCategory | null>(
    null
  );
  const [deletingCourse, setDeletingCourse] =
    useState<CourseWithCategory | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [formData, setFormData] = useState({
    categoryId: "",
    instructorId: "",
    title: "",
    description: "",
  });

  const fetchCategories = useCallback(async () => {
    if (status === "unauthenticated") {
      setLoading(false);
      setError("Please sign in to view courses.");
      return;
    }
    const token = session?.accessToken;
    if (!token && status === "authenticated") {
      setLoading(false);
      setError("Session expired. Please sign in again.");
      return;
    }
    if (!token) return;

    setLoading(true);
    setError(null);
    try {
      const [catRes, coursesRes, teachersList] = await Promise.all([
        getCategories(token, { page: 1, size: 100 }),
        getCourses(token, { page: 1, size: 500 }),
        getTeachers(token),
      ]);
      const catItems = catRes.payload?.items ?? [];
      setCategories(catItems);
      setTeachers(Array.isArray(teachersList) ? teachersList : []);
      const items = coursesRes.payload?.items ?? [];
      setCoursesById(new Map(items.map((c) => [c.course_id, c])));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load categories"
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

  // Use courses from getCourses (have course_id) merged with category names from categories
  const categoryById = new Map(
    categories.map((c) => [c.category_id, c])
  );
  const allCoursesWithCategory: CourseWithCategory[] = Array.from(
    coursesById.values()
  ).map((course, idx) => {
    const cat = course.category_id
      ? categoryById.get(course.category_id)
      : null;
    return {
      course,
      categoryId: course.category_id ?? 0,
      categoryName: cat?.name ?? "Uncategorized",
      courseIndex: idx,
    };
  });

  const filteredCourses = allCoursesWithCategory.filter((cwc) => {
    const courseName = cwc.course.course_name ?? "";
    const instructor = cwc.course.instructor_name ?? "";
    const matchesSearch =
      String(courseName).toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(instructor).toLowerCase().includes(searchTerm.toLowerCase()) ||
      cwc.categoryName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" ||
      String(cwc.categoryId) === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const resetForm = () => {
    setFormData({
      categoryId: String(categories[0]?.category_id ?? ""),
      instructorId: role === "admin" && teachers[0] ? String(teachers[0].user_id) : String(session?.user?.id ?? ""),
      title: "",
      description: "",
    });
    setEditingCourse(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.categoryId) return;
    const instructorId = formData.instructorId ? Number(formData.instructorId) : 0;
    if (!instructorId || Number.isNaN(instructorId)) {
      toast.error("Please select an instructor.");
      return;
    }
    const token = session?.accessToken;
    if (!token) {
      toast.error("Please sign in to create courses.");
      return;
    }

    setSubmitting(true);
    try {
      await createCourse(token, {
        category_id: Number(formData.categoryId),
        instructor_id: instructorId,
        course_name: formData.title.trim(),
        description: formData.description.trim(),
      });
      toast.success("Course created successfully");
      resetForm();
      setIsCreateOpen(false);
      await fetchCategories();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create course";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse || !formData.title.trim()) return;
    const token = session?.accessToken;
    if (!token) return;

    const courseId = getCourseId(editingCourse.course);
    if (!courseId) {
      toast.error("Course ID missing. Cannot update.");
      return;
    }

    const categoryId = Number(formData.categoryId);
    if (!categoryId || Number.isNaN(categoryId)) {
      toast.error("Please select a valid category.");
      return;
    }

    const desc = formData.description.trim() || "No description";
    const status = (editingCourse.course.course_status as "NEW" | "POPULAR" | "RECOMMENDED") ?? "NEW";

    setSubmitting(true);
    try {
      await updateCourse(token, Number(courseId), {
        category_id: categoryId,
        instructor_id: formData.instructorId ? Number(formData.instructorId) : undefined,
        course_name: formData.title.trim(),
        description: desc,
        is_active: editingCourse.course.is_active ?? true,
        course_status: status,
      });
      toast.success("Course updated successfully");
      resetForm();
      setEditingCourse(null);
      await fetchCategories();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update course";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCourse) return;
    const token = session?.accessToken;
    if (!token) return;

    setSubmitting(true);
    try {
      const delCourseId = getCourseId(deletingCourse.course);
      if (!delCourseId) {
        toast.error("Course ID missing. Cannot delete.");
        return;
      }
      await deleteCourse(token, Number(delCourseId));
      toast.success("Course deleted successfully");
      setDeletingCourse(null);
      await fetchCategories();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete course";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (cwc: CourseWithCategory) => {
    setEditingCourse(cwc);
    const instructorId = cwc.course.instructor_id;
    setFormData({
      categoryId: String(cwc.categoryId),
      instructorId: instructorId ? String(instructorId) : "",
      title: cwc.course.course_name ?? "",
      description: cwc.course.description ?? "",
    });
  };

  const handleManageContent = (cwc: CourseWithCategory) => {
    const cid = getCourseId(cwc.course);
    if (cid) router.push(`/dashboard/course/manage/${cid}`);
  };

  const getCourseTitle = (c: CourseItem) =>
    c.course_name ?? "Untitled";

  const getCourseInstructor = (c: CourseItem) =>
    c.instructor_name ?? "—";

  const getCourseId = (c: CourseItem): number =>
    c.course_id ?? 0;

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 m-8">
        <div className="flex items-center justify-center min-h-[200px]">
          <p className="text-gray-500">Loading courses...</p>
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
          <h1 className="text-2xl font-bold text-gray-900">
            {role === "teacher" ? "My Course Content" : "Manage Courses"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {canManageCourses
              ? "Manage courses. Create, edit, or remove courses. Only admins and teachers can manage."
              : "View course catalog."}
          </p>
        </div>
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
                <SelectItem key={cat.category_id} value={String(cat.category_id)}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {canManageCourses && (
            <Button
              onClick={() => {
                resetForm();
                setFormData((p) => ({
                  ...p,
                  categoryId: String(categories[0]?.category_id ?? ""),
                  instructorId: role === "admin" && teachers[0] ? String(teachers[0].user_id) : String(session?.user?.id ?? ""),
                }));
                setIsCreateOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Course
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {filteredCourses.map((cwc) => (
          <div
            key={`${cwc.categoryId}-${getCourseId(cwc.course)}-${cwc.courseIndex}`}
            className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                <BookOpen className="w-6 h-6 text-gray-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {getCourseTitle(cwc.course)}
                </h3>
                <p className="text-sm text-gray-500">
                  {getCourseInstructor(cwc.course)} · {cwc.categoryName}
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
              {canManageCourses && (
                <>
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
                    disabled={submitting}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}

        {filteredCourses.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {searchTerm || categoryFilter !== "all"
              ? "No courses match your filters."
              : canManageCourses
                ? 'No courses yet. Click "Add Course" to create one.'
                : "No courses available."}
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Course</DialogTitle>
            <DialogDescription>
              Create a new course. Assign a teacher as instructor. Admins can
              assign any teacher; teachers are auto-assigned to themselves.
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
                    <SelectItem key={cat.category_id} value={String(cat.category_id)}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-instructor">Instructor *</Label>
              <Select
                value={formData.instructorId}
                onValueChange={(v) =>
                  setFormData((p) => ({ ...p, instructorId: v }))
                }
                required
              >
                <SelectTrigger id="create-instructor">
                  <SelectValue placeholder="Select instructor" />
                </SelectTrigger>
                <SelectContent>
                  {(role === "admin"
                    ? teachers
                    : (() => {
                        const filtered = teachers.filter(
                          (t) => String(t.user_id) === String(session?.user?.id)
                        );
                        if (filtered.length === 0 && session?.user?.id) {
                          return [
                            {
                              user_id: Number(session.user.id),
                              full_name: session.user.name ?? session.user.email ?? "Me",
                              email: session.user.email,
                            } as TeacherItem,
                          ];
                        }
                        return filtered;
                      })()
                  ).map((t) => (
                    <SelectItem key={t.user_id} value={String(t.user_id)}>
                      {t.full_name}
                      {t.email && ` (${t.email})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {role === "teacher" && (
                <p className="text-xs text-gray-500">
                  You will be assigned as the course instructor.
                </p>
              )}
              {role === "admin" && teachers.length === 0 && (
                <p className="text-sm text-amber-600">
                  No teachers available. Add teachers first in Manage Teachers.
                </p>
              )}
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
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating..." : "Create Course"}
              </Button>
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
              Update the course details. Admins can reassign the instructor.
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
                    <SelectItem key={cat.category_id} value={String(cat.category_id)}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {role === "admin" && teachers.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="edit-instructor">Instructor</Label>
                <Select
                  value={formData.instructorId}
                  onValueChange={(v) =>
                    setFormData((p) => ({ ...p, instructorId: v }))
                  }
                >
                  <SelectTrigger id="edit-instructor">
                    <SelectValue placeholder="Select instructor" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((t) => (
                      <SelectItem key={t.user_id} value={String(t.user_id)}>
                        {t.full_name}
                        {t.email && ` (${t.email})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
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
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save Changes"}
              </Button>
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
              Are you sure you want to delete &quot;
              {deletingCourse ? getCourseTitle(deletingCourse.course) : ""}
              &quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingCourse(null)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={submitting}
            >
              {submitting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
