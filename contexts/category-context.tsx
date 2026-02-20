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
} from "@/lib/category-data";

interface CategoryContextValue {
  categories: Category[];
  addCategory: (category: Omit<Category, "id">) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addCourseToCategory: (categoryId: string, course: CategoryCourse) => void;
  updateCourseInCategory: (
    categoryId: string,
    courseIndex: number,
    updates: Partial<CategoryCourse>
  ) => void;
  removeCourseFromCategory: (categoryId: string, courseIndex: number) => void;
  getCategory: (id: string) => Category | undefined;
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
    (categoryId: string, course: CategoryCourse) => {
      const slug =
        course.slug || slugify(course.title);
      setCategories((prev) =>
        prev.map((c) =>
          c.id === categoryId
            ? { ...c, courses: [...c.courses, { ...course, slug }] }
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
