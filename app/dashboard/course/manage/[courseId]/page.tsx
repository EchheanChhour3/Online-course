"use client";

import { useState, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  Play,
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
import {
  getCourseById,
  type CourseItem,
} from "@/services/course.service";
import {
  getModulesByCourseId,
  createModule,
  updateModule,
  deleteModule,
  type ModuleItem,
  type LessonItem,
} from "@/services/module.service";
import {
  createLesson,
  updateLesson,
  deleteLesson,
} from "@/services/lesson.service";
import { useRole } from "@/contexts/role-context";
import { toast } from "sonner";

export default function CourseContentManagePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { role } = useRole();
  const courseId = params.courseId ? Number(params.courseId) : null;

  const [course, setCourse] = useState<CourseItem | null>(null);
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set());
  const [addingModule, setAddingModule] = useState(false);
  const [editingModule, setEditingModule] = useState<{
    module: ModuleItem;
  } | null>(null);
  const [deletingModule, setDeletingModule] = useState<ModuleItem | null>(null);
  const [addingLessonTo, setAddingLessonTo] = useState<ModuleItem | null>(null);
  const [editingLesson, setEditingLesson] = useState<{
    module: ModuleItem;
    lesson: LessonItem;
  } | null>(null);
  const [deletingLesson, setDeletingLesson] = useState<{
    module: ModuleItem;
    lesson: LessonItem;
  } | null>(null);

  const [moduleFormData, setModuleFormData] = useState({ title: "" });
  const [lessonFormData, setLessonFormData] = useState({
    title: "",
    duration: "",
    videoUrl: "",
    contentText: "",
  });

  const fetchData = useCallback(async () => {
    if (!courseId || !session?.accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const [courseRes, modulesList] = await Promise.all([
        getCourseById(session.accessToken, courseId),
        getModulesByCourseId(session.accessToken, courseId),
      ]);
      setCourse(courseRes.payload);
      setModules(modulesList ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load course content"
      );
      setCourse(null);
      setModules([]);
    } finally {
      setLoading(false);
    }
  }, [courseId, session?.accessToken]);

  useEffect(() => {
    if (status === "loading") return;
    if (!courseId || status === "unauthenticated") {
      setLoading(false);
      setError("Please sign in.");
      return;
    }
    if (!session?.accessToken) return;
    fetchData();
  }, [courseId, status, session?.accessToken, fetchData]);

  const toggleModule = (idx: number) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleFormData.title.trim() || !courseId || !session?.accessToken)
      return;
    setSubmitting(true);
    try {
      await createModule(
        session.accessToken,
        courseId,
        moduleFormData.title.trim(),
        modules.length
      );
      toast.success("Module created");
      setModuleFormData({ title: "" });
      setAddingModule(false);
      await fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create module");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModule || !moduleFormData.title.trim() || !session?.accessToken)
      return;
    setSubmitting(true);
    try {
      await updateModule(
        session.accessToken,
        editingModule.module.module_id,
        editingModule.module.course_id,
        moduleFormData.title.trim(),
        editingModule.module.position ?? 0
      );
      toast.success("Module updated");
      setModuleFormData({ title: "" });
      setEditingModule(null);
      await fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update module");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteModule = async () => {
    if (!deletingModule || !session?.accessToken) return;
    setSubmitting(true);
    try {
      await deleteModule(session.accessToken, deletingModule.module_id);
      toast.success("Module deleted");
      setDeletingModule(null);
      await fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete module");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addingLessonTo || !lessonFormData.title.trim() || !lessonFormData.videoUrl?.trim() || !session?.accessToken)
      return;
    setSubmitting(true);
    try {
      await createLesson(
        session.accessToken,
        addingLessonTo.module_id,
        lessonFormData.title.trim(),
        lessonFormData.duration.trim() || "0min",
        lessonFormData.videoUrl.trim(),
        lessonFormData.contentText.trim() || undefined,
        addingLessonTo.lessons?.length ?? 0
      );
      toast.success("Lesson added");
      setLessonFormData({ title: "", duration: "", videoUrl: "", contentText: "" });
      setAddingLessonTo(null);
      await fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add lesson");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLesson || !lessonFormData.title.trim() || !lessonFormData.videoUrl?.trim() || !session?.accessToken)
      return;
    setSubmitting(true);
    try {
      await updateLesson(
        session.accessToken,
        editingLesson.lesson.lesson_id,
        editingLesson.module.module_id,
        lessonFormData.title.trim(),
        lessonFormData.duration.trim() || "0min",
        lessonFormData.videoUrl.trim(),
        lessonFormData.contentText.trim() || undefined,
        editingLesson.lesson.position ?? 0
      );
      toast.success("Lesson updated");
      setLessonFormData({ title: "", duration: "", videoUrl: "", contentText: "" });
      setEditingLesson(null);
      await fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update lesson");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLesson = async () => {
    if (!deletingLesson || !session?.accessToken) return;
    setSubmitting(true);
    try {
      await deleteLesson(session.accessToken, deletingLesson.lesson.lesson_id);
      toast.success("Lesson deleted");
      setDeletingLesson(null);
      await fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete lesson");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDuration = (d?: number) => {
    if (d == null) return "—";
    if (d >= 60) return `${Math.floor(d / 60)}h ${Math.round(d % 60)}min`;
    return `${Math.round(d)}min`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 m-8">
        <div className="flex items-center justify-center min-h-[200px]">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 m-8">
        <p className="text-red-500">{error ?? "Course not found."}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/dashboard/course/manage")}
        >
          Back to Manage Courses
        </Button>
      </div>
    );
  }

  const courseName = course.course_name ?? "Untitled Course";
  const isCourseInstructor =
    course?.instructor_id != null &&
    String(session?.user?.id) === String(course.instructor_id);
  const canEditModules = role === "admin" || isCourseInstructor;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 m-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{courseName}</h1>
          <p className="text-gray-500 mt-1">
            {modules.length} module{modules.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/course/manage")}
          >
            Back
          </Button>
          {canEditModules && (
            <Button
              onClick={() => {
                setModuleFormData({ title: "" });
                setAddingModule(true);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Module
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {modules.map((module, idx) => {
          const lessons = module.lessons ?? [];
          const isExpanded = expandedModules.has(idx);
          return (
            <div
              key={module.module_id}
              className="border border-gray-200 rounded-xl overflow-hidden"
            >
              <div className="flex items-center justify-between bg-gray-50 px-4 py-3">
                <button
                  onClick={() => toggleModule(idx)}
                  className="flex items-center gap-3 flex-1 text-left"
                >
                  <GripVertical className="w-4 h-4 text-gray-400 shrink-0" />
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-500 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                  )}
                  <span className="font-semibold text-gray-900">
                    {module.module_title}
                  </span>
                  <span className="text-sm text-gray-500">
                    {lessons.length} lesson{lessons.length !== 1 ? "s" : ""}
                  </span>
                </button>
                <div className="flex items-center gap-2">
                  {canEditModules && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setAddingLessonTo(module);
                          setLessonFormData({ title: "", duration: "", videoUrl: "", contentText: "" });
                        }}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Lesson
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingModule({ module });
                          setModuleFormData({ title: module.module_title });
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setDeletingModule(module)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-200 bg-white">
                  {lessons.length === 0 ? (
                    <div className="px-4 py-6 text-center text-gray-500 text-sm">
                      No lessons yet. Click &quot;Lesson&quot; to add one.
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {lessons.map((lesson) => (
                        <div
                          key={lesson.lesson_id}
                          className="flex items-center justify-between px-4 py-3 hover:bg-gray-50/50"
                        >
                          <div className="flex items-center gap-3">
                            <Play className="w-4 h-4 text-gray-400 shrink-0" />
                            <div>
                              <p className="font-medium text-gray-900">
                                {lesson.title}
                              </p>
                              <p className="text-sm text-gray-500">
                                {formatDuration(lesson.duration)}
                                {lesson.video_url && " · Video"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {canEditModules && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditingLesson({ module, lesson });
                                    setLessonFormData({
                                      title: lesson.title,
                                      duration:
                                        lesson.duration != null
                                          ? `${lesson.duration}min`
                                          : "",
                                      videoUrl: lesson.video_url ?? "",
                                      contentText: lesson.content_text ?? "",
                                    });
                                  }}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() =>
                                    setDeletingLesson({ module, lesson })
                                  }
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {modules.length === 0 && (
          <div className="text-center py-12 border border-dashed border-gray-300 rounded-xl">
            <p className="text-gray-500 mb-4">
              No modules yet.
              {canEditModules
                ? " Add modules to structure your course content."
                : ""}
            </p>
            {canEditModules && (
              <Button
                onClick={() => {
                  setModuleFormData({ title: "" });
                  setAddingModule(true);
                }}
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Module
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Add Module Dialog */}
      <Dialog open={addingModule} onOpenChange={setAddingModule}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Module</DialogTitle>
            <DialogDescription>
              A module groups related lessons together.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddModule} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="module-title">Module Title</Label>
              <Input
                id="module-title"
                value={moduleFormData.title}
                onChange={(e) =>
                  setModuleFormData((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="e.g. Introduction to React"
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddingModule(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Adding..." : "Add Module"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Module Dialog */}
      <Dialog
        open={!!editingModule}
        onOpenChange={(open) => !open && setEditingModule(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Module</DialogTitle>
            <DialogDescription>Update the module title.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateModule} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-module-title">Module Title</Label>
              <Input
                id="edit-module-title"
                value={moduleFormData.title}
                onChange={(e) =>
                  setModuleFormData((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="e.g. Introduction to React"
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingModule(null)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Module Dialog */}
      <Dialog
        open={!!deletingModule}
        onOpenChange={(open) => !open && setDeletingModule(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Module</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this module and all its lessons?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingModule(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteModule}
              disabled={submitting}
            >
              {submitting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Lesson Dialog */}
      <Dialog
        open={!!addingLessonTo}
        onOpenChange={(o) => !o && setAddingLessonTo(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Lesson</DialogTitle>
            <DialogDescription>Add a new lesson to this module.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddLesson} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lesson-title">Lesson Title</Label>
              <Input
                id="lesson-title"
                value={lessonFormData.title}
                onChange={(e) =>
                  setLessonFormData((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="e.g. What is React?"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lesson-duration">Duration</Label>
              <Input
                id="lesson-duration"
                value={lessonFormData.duration}
                onChange={(e) =>
                  setLessonFormData((p) => ({ ...p, duration: e.target.value }))
                }
                placeholder="e.g. 5min"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lesson-video">Video URL *</Label>
              <Input
                id="lesson-video"
                type="url"
                value={lessonFormData.videoUrl}
                onChange={(e) =>
                  setLessonFormData((p) => ({ ...p, videoUrl: e.target.value }))
                }
                placeholder="https://..."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lesson-content">Content (optional)</Label>
              <Input
                id="lesson-content"
                value={lessonFormData.contentText}
                onChange={(e) =>
                  setLessonFormData((p) => ({ ...p, contentText: e.target.value }))
                }
                placeholder="Lesson content or description..."
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddingLessonTo(null)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Adding..." : "Add Lesson"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Lesson Dialog */}
      <Dialog
        open={!!editingLesson}
        onOpenChange={(open) => !open && setEditingLesson(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Lesson</DialogTitle>
            <DialogDescription>Update the lesson details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateLesson} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-lesson-title">Lesson Title</Label>
              <Input
                id="edit-lesson-title"
                value={lessonFormData.title}
                onChange={(e) =>
                  setLessonFormData((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="e.g. What is React?"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-lesson-duration">Duration</Label>
              <Input
                id="edit-lesson-duration"
                value={lessonFormData.duration}
                onChange={(e) =>
                  setLessonFormData((p) => ({ ...p, duration: e.target.value }))
                }
                placeholder="e.g. 5min"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-lesson-video">Video URL *</Label>
              <Input
                id="edit-lesson-video"
                type="url"
                value={lessonFormData.videoUrl}
                onChange={(e) =>
                  setLessonFormData((p) => ({ ...p, videoUrl: e.target.value }))
                }
                placeholder="https://..."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-lesson-content">Content (optional)</Label>
              <Input
                id="edit-lesson-content"
                value={lessonFormData.contentText}
                onChange={(e) =>
                  setLessonFormData((p) => ({ ...p, contentText: e.target.value }))
                }
                placeholder="Lesson content or description..."
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingLesson(null)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Lesson Dialog */}
      <Dialog
        open={!!deletingLesson}
        onOpenChange={(open) => !open && setDeletingLesson(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Lesson</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this lesson? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingLesson(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteLesson}
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
