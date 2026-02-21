"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  getStoredCategories,
  setStoredCategories,
  type Category,
  type CategoryCourse,
  type CourseModule,
  type CourseLesson,
} from "@/lib/category-data";

interface CategoryContextValue {
  categories: Category[];
  addCategory: (category: Omit<Category, "id">) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addCourseToCategory: (categoryId: string, course: Omit<CategoryCourse, "id">) => void;
  updateCourseInCategory: (
    categoryId: string,
    courseIndex: number,
    updates: Partial<CategoryCourse>
  ) => void;
  removeCourseFromCategory: (categoryId: string, courseIndex: number) => void;
  getCategory: (id: string) => Category | undefined;
  findCourse: (categorySlug: string, courseSlug: string) => { category: Category; course: CategoryCourse; index: number } | null;
  updateCourseContent: (
    categorySlug: string,
    courseSlug: string,
    modules: CourseModule[]
  ) => void;
  addModuleToCourse: (categorySlug: string, courseSlug: string, module: Omit<CourseModule, "id">) => void;
  updateModuleInCourse: (
    categorySlug: string,
    courseSlug: string,
    moduleIndex: number,
    updates: Partial<CourseModule>
  ) => void;
  removeModuleFromCourse: (categorySlug: string, courseSlug: string, moduleIndex: number) => void;
  addLessonToModule: (
    categorySlug: string,
    courseSlug: string,
    moduleIndex: number,
    lesson: Omit<CourseLesson, "id">
  ) => void;
  updateLessonInModule: (
    categorySlug: string,
    courseSlug: string,
    moduleIndex: number,
    lessonIndex: number,
    updates: Partial<CourseLesson>
  ) => void;
  removeLessonFromModule: (
    categorySlug: string,
    courseSlug: string,
    moduleIndex: number,
    lessonIndex: number
  ) => void;
  refresh: () => void;
}

const CategoryContext = createContext<CategoryContextValue | null>(null);

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function CategoryProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);

  const refresh = useCallback(() => {
    setCategories(getStoredCategories());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (categories.length >= 0) {
      setStoredCategories(categories);
    }
  }, [categories]);

  const addCategory = useCallback((category: Omit<Category, "id">) => {
    const id = generateId();
    const slug = category.slug || slugify(category.name);
    setCategories((prev) => [
      ...prev,
      { ...category, id, slug: slug || id } as Category,
    ]);
  }, []);

  const updateCategory = useCallback(
    (id: string, updates: Partial<Category>) => {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                ...updates,
                ...(updates.name && {
                  slug: slugify(updates.name) || c.slug,
                }),
              }
            : c
        )
      );
    },
    []
  );

  const deleteCategory = useCallback((id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const addCourseToCategory = useCallback(
    (categoryId: string, course: Omit<CategoryCourse, "id">) => {
      const slug = course.slug || slugify(course.title);
      const id = generateId();
      setCategories((prev) =>
        prev.map((c) =>
          c.id === categoryId
            ? { ...c, courses: [...c.courses, { ...course, id, slug, modules: course.modules ?? [] }] }
            : c
        )
      );
    },
    []
  );

  const updateCourseInCategory = useCallback(
    (
      categoryId: string,
      courseIndex: number,
      updates: Partial<CategoryCourse>
    ) => {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === categoryId
            ? {
                ...c,
                courses: c.courses.map((course, i) =>
                  i === courseIndex ? { ...course, ...updates } : course
                ),
              }
            : c
        )
      );
    },
    []
  );

  const removeCourseFromCategory = useCallback(
    (categoryId: string, courseIndex: number) => {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === categoryId
            ? {
                ...c,
                courses: c.courses.filter((_, i) => i !== courseIndex),
              }
            : c
        )
      );
    },
    []
  );

  const getCategory = useCallback(
    (id: string) => categories.find((c) => c.id === id),
    [categories]
  );

  const findCourse = useCallback(
    (categorySlug: string, courseSlug: string) => {
      const category = categories.find((c) => c.slug === categorySlug);
      if (!category) return null;
      const index = category.courses.findIndex(
        (co) => (co.slug || slugify(co.title)) === courseSlug
      );
      if (index < 0) return null;
      return { category, course: category.courses[index], index };
    },
    [categories]
  );

  const updateCourseContent = useCallback(
    (categorySlug: string, courseSlug: string, modules: CourseModule[]) => {
      setCategories((prev) =>
        prev.map((c) =>
          c.slug === categorySlug
            ? {
                ...c,
                courses: c.courses.map((co, i) => {
                  const coSlug = co.slug || slugify(co.title);
                  if (coSlug !== courseSlug) return co;
                  return { ...co, modules };
                }),
              }
            : c
        )
      );
    },
    []
  );

  const addModuleToCourse = useCallback(
    (
      categorySlug: string,
      courseSlug: string,
      module: Omit<CourseModule, "id">
    ) => {
      const moduleId = generateId();
      setCategories((prev) =>
        prev.map((c) =>
          c.slug === categorySlug
            ? {
                ...c,
                courses: c.courses.map((co) => {
                  const coSlug = co.slug || slugify(co.title);
                  if (coSlug !== courseSlug) return co;
                  const modules = co.modules ?? [];
                  return {
                    ...co,
                    modules: [
                      ...modules,
                      { ...module, id: moduleId, lessons: module.lessons ?? [] },
                    ],
                  };
                }),
              }
            : c
        )
      );
    },
    []
  );

  const updateModuleInCourse = useCallback(
    (
      categorySlug: string,
      courseSlug: string,
      moduleIndex: number,
      updates: Partial<CourseModule>
    ) => {
      setCategories((prev) =>
        prev.map((c) =>
          c.slug === categorySlug
            ? {
                ...c,
                courses: c.courses.map((co) => {
                  const coSlug = co.slug || slugify(co.title);
                  if (coSlug !== courseSlug) return co;
                  const modules = (co.modules ?? []).map((m, i) =>
                    i === moduleIndex ? { ...m, ...updates } : m
                  );
                  return { ...co, modules };
                }),
              }
            : c
        )
      );
    },
    []
  );

  const removeModuleFromCourse = useCallback(
    (
      categorySlug: string,
      courseSlug: string,
      moduleIndex: number
    ) => {
      setCategories((prev) =>
        prev.map((c) =>
          c.slug === categorySlug
            ? {
                ...c,
                courses: c.courses.map((co) => {
                  const coSlug = co.slug || slugify(co.title);
                  if (coSlug !== courseSlug) return co;
                  const modules = (co.modules ?? []).filter(
                    (_, i) => i !== moduleIndex
                  );
                  return { ...co, modules };
                }),
              }
            : c
        )
      );
    },
    []
  );

  const addLessonToModule = useCallback(
    (
      categorySlug: string,
      courseSlug: string,
      moduleIndex: number,
      lesson: Omit<CourseLesson, "id">
    ) => {
      const lessonId = generateId();
      setCategories((prev) =>
        prev.map((c) =>
          c.slug === categorySlug
            ? {
                ...c,
                courses: c.courses.map((co) => {
                  const coSlug = co.slug || slugify(co.title);
                  if (coSlug !== courseSlug) return co;
                  const modules = (co.modules ?? []).map((m, i) =>
                    i === moduleIndex
                      ? {
                          ...m,
                          lessons: [
                            ...m.lessons,
                            { ...lesson, id: lessonId },
                          ],
                        }
                      : m
                  );
                  return { ...co, modules };
                }),
              }
            : c
        )
      );
    },
    []
  );

  const updateLessonInModule = useCallback(
    (
      categorySlug: string,
      courseSlug: string,
      moduleIndex: number,
      lessonIndex: number,
      updates: Partial<CourseLesson>
    ) => {
      setCategories((prev) =>
        prev.map((c) =>
          c.slug === categorySlug
            ? {
                ...c,
                courses: c.courses.map((co) => {
                  const coSlug = co.slug || slugify(co.title);
                  if (coSlug !== courseSlug) return co;
                  const modules = (co.modules ?? []).map((m, i) =>
                    i === moduleIndex
                      ? {
                          ...m,
                          lessons: m.lessons.map((l, li) =>
                            li === lessonIndex ? { ...l, ...updates } : l
                          ),
                        }
                      : m
                  );
                  return { ...co, modules };
                }),
              }
            : c
        )
      );
    },
    []
  );

  const removeLessonFromModule = useCallback(
    (
      categorySlug: string,
      courseSlug: string,
      moduleIndex: number,
      lessonIndex: number
    ) => {
      setCategories((prev) =>
        prev.map((c) =>
          c.slug === categorySlug
            ? {
                ...c,
                courses: c.courses.map((co) => {
                  const coSlug = co.slug || slugify(co.title);
                  if (coSlug !== courseSlug) return co;
                  const modules = (co.modules ?? []).map((m, i) =>
                    i === moduleIndex
                      ? {
                          ...m,
                          lessons: m.lessons.filter((_, li) => li !== lessonIndex),
                        }
                      : m
                  );
                  return { ...co, modules };
                }),
              }
            : c
        )
      );
    },
    []
  );

  return (
    <CategoryContext.Provider
      value={{
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        addCourseToCategory,
        updateCourseInCategory,
        removeCourseFromCategory,
        getCategory,
        findCourse,
        updateCourseContent,
        addModuleToCourse,
        updateModuleInCourse,
        removeModuleFromCourse,
        addLessonToModule,
        updateLessonInModule,
        removeLessonFromModule,
        refresh,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories() {
  const ctx = useContext(CategoryContext);
  if (!ctx) {
    throw new Error("useCategories must be used within CategoryProvider");
  }
  return ctx;
}
