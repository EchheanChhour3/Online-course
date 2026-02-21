"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
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
import { useCategories } from "@/contexts/category-context";
import type { CourseLesson, CourseModule } from "@/lib/category-data";

export default function CourseContentManagePage() {
  const params = useParams();
  const router = useRouter();
  const categorySlug = params.categorySlug as string;
  const courseSlug = params.courseSlug as string;

  const {
    findCourse,
    addModuleToCourse,
    updateModuleInCourse,
    removeModuleFromCourse,
    addLessonToModule,
    updateLessonInModule,
    removeLessonFromModule,
  } = useCategories();

  const found = findCourse(categorySlug, courseSlug);
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set());
  const [addingModule, setAddingModule] = useState(false);
  const [editingModule, setEditingModule] = useState<{
    index: number;
    module: CourseModule;
  } | null>(null);
  const [deletingModule, setDeletingModule] = useState<number | null>(null);
  const [addingLessonTo, setAddingLessonTo] = useState<number | null>(null);
  const [editingLesson, setEditingLesson] = useState<{
    moduleIndex: number;
    lessonIndex: number;
    lesson: CourseLesson;
  } | null>(null);
  const [deletingLesson, setDeletingLesson] = useState<{
    moduleIndex: number;
    lessonIndex: number;
  } | null>(null);

  const [moduleFormData, setModuleFormData] = useState({ title: "" });
  const [lessonFormData, setLessonFormData] = useState({
    title: "",
    duration: "",
    videoUrl: "",
  });

  if (!found) {
    return (
      <div className="min-h-screen bg-white p-8 sm:p-10 lg:p-12">
        <p className="text-gray-500">Course not found.</p>
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

  const { category, course } = found;
  const modules = course.modules ?? [];

  const toggleModule = (index: number) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const handleAddModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleFormData.title.trim()) return;
    addModuleToCourse(categorySlug, courseSlug, {
      title: moduleFormData.title.trim(),
      lessons: [],
    });
    setModuleFormData({ title: "" });
    setAddingModule(false);
  };

  const handleUpdateModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModule || !moduleFormData.title.trim()) return;
    updateModuleInCourse(categorySlug, courseSlug, editingModule.index, {
      title: moduleFormData.title.trim(),
    });
    setModuleFormData({ title: "" });
    setEditingModule(null);
  };

  const handleDeleteModule = () => {
    if (deletingModule === null) return;
    removeModuleFromCourse(categorySlug, courseSlug, deletingModule);
    setDeletingModule(null);
  };

  const handleAddLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (addingLessonTo === null || !lessonFormData.title.trim()) return;
    addLessonToModule(categorySlug, courseSlug, addingLessonTo, {
      title: lessonFormData.title.trim(),
      duration: lessonFormData.duration.trim() || "0min",
      videoUrl: lessonFormData.videoUrl.trim() || undefined,
    });
    setLessonFormData({ title: "", duration: "", videoUrl: "" });
    setAddingLessonTo(null);
  };

  const handleUpdateLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLesson) return;
    if (!lessonFormData.title.trim()) return;
    updateLessonInModule(
      categorySlug,
      courseSlug,
      editingLesson.moduleIndex,
      editingLesson.lessonIndex,
      {
        title: lessonFormData.title.trim(),
        duration: lessonFormData.duration.trim() || "0min",
        videoUrl: lessonFormData.videoUrl.trim() || undefined,
      }
    );
    setLessonFormData({ title: "", duration: "", videoUrl: "" });
    setEditingLesson(null);
  };

  const handleDeleteLesson = () => {
    if (!deletingLesson) return;
    removeLessonFromModule(
      categorySlug,
      courseSlug,
      deletingLesson.moduleIndex,
      deletingLesson.lessonIndex
    );
    setDeletingLesson(null);
  };

  return (
    <div className="min-h-screen bg-white p-8 sm:p-10 lg:p-12">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <button
          onClick={() => router.push("/dashboard/course/manage")}
          className="p-1 rounded hover:bg-gray-100"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span
          onClick={() => router.push("/dashboard/course/manage")}
          className="hover:text-gray-900 cursor-pointer"
        >
          Manage Courses
        </span>
        <ChevronRight className="w-4 h-4" />
        <span className="hover:text-gray-900 cursor-pointer" onClick={() => router.push("/dashboard/course/manage")}>
          {course.title}
        </span>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">Content</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {course.title}
          </h1>
          <p className="text-gray-500 mt-1">
            {category.name} · {modules.length} module{modules.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          onClick={() => {
            setModuleFormData({ title: "" });
            setAddingModule(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 shrink-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Module
        </Button>
      </div>

      <div className="space-y-4 max-w-3xl">
        {modules.map((module, moduleIndex) => {
          const isExpanded = expandedModules.has(moduleIndex);
          return (
            <div
              key={module.id}
              className="border border-gray-200 rounded-xl overflow-hidden"
            >
              <div className="flex items-center justify-between bg-gray-50 px-4 py-3">
                <button
                  onClick={() => toggleModule(moduleIndex)}
                  className="flex items-center gap-3 flex-1 text-left"
                >
                  <GripVertical className="w-4 h-4 text-gray-400 shrink-0" />
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-500 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                  )}
                  <span className="font-semibold text-gray-900">
                    {module.title}
                  </span>
                  <span className="text-sm text-gray-500">
                    {module.lessons.length} lesson
                    {module.lessons.length !== 1 ? "s" : ""}
                  </span>
                </button>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setAddingLessonTo(moduleIndex);
                      setLessonFormData({ title: "", duration: "", videoUrl: "" });
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Lesson
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingModule({ index: moduleIndex, module });
                      setModuleFormData({ title: module.title });
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => setDeletingModule(moduleIndex)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-200 bg-white">
                  {module.lessons.length === 0 ? (
                    <div className="px-4 py-6 text-center text-gray-500 text-sm">
                      No lessons yet. Click &quot;Lesson&quot; to add one.
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {module.lessons.map((lesson, lessonIndex) => (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between px-4 py-3 hover:bg-gray-50/50"
                        >
                          <div className="flex items-center gap-3">
                            <Play className="w-4 h-4 text-gray-400 shrink-0" />
                            <div>
                              <p className="font-medium text-gray-900">
                                {lesson.title}
                              </p>
                              <p className="text-sm text-gray-500">
                                {lesson.duration}
                                {lesson.videoUrl && " · Video"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingLesson({
                                  moduleIndex,
                                  lessonIndex,
                                  lesson,
                                });
                                setLessonFormData({
                                  title: lesson.title,
                                  duration: lesson.duration,
                                  videoUrl: lesson.videoUrl ?? "",
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
                                setDeletingLesson({ moduleIndex, lessonIndex })
                              }
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
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
              No modules yet. Add modules to structure your course content.
            </p>
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
              <Button type="submit">Add Module</Button>
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
            <DialogDescription>
              Update the module title.
            </DialogDescription>
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
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Module Dialog */}
      <Dialog
        open={deletingModule !== null}
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
            <Button variant="destructive" onClick={handleDeleteModule}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Lesson Dialog */}
      <Dialog open={addingLessonTo !== null} onOpenChange={(o) => !o && setAddingLessonTo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Lesson</DialogTitle>
            <DialogDescription>
              Add a new lesson to this module.
            </DialogDescription>
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
              <Label htmlFor="lesson-video">Video URL (optional)</Label>
              <Input
                id="lesson-video"
                value={lessonFormData.videoUrl}
                onChange={(e) =>
                  setLessonFormData((p) => ({ ...p, videoUrl: e.target.value }))
                }
                placeholder="https://..."
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
              <Button type="submit">Add Lesson</Button>
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
            <DialogDescription>
              Update the lesson details.
            </DialogDescription>
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
              <Label htmlFor="edit-lesson-video">Video URL (optional)</Label>
              <Input
                id="edit-lesson-video"
                value={lessonFormData.videoUrl}
                onChange={(e) =>
                  setLessonFormData((p) => ({ ...p, videoUrl: e.target.value }))
                }
                placeholder="https://..."
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
              <Button type="submit">Save</Button>
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
            <Button variant="destructive" onClick={handleDeleteLesson}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
