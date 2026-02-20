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
  getStoredTeachers,
  setStoredTeachers,
  type Teacher,
} from "@/lib/teacher-data";

export interface TeacherFormData {
  name: string;
  role: string;
  email?: string;
  imageSrc?: string;
}

interface TeacherContextValue {
  teachers: Teacher[];
  addTeacher: (data: TeacherFormData) => Teacher;
  updateTeacher: (id: string, data: TeacherFormData) => void;
  deleteTeacher: (id: string) => void;
  getTeacher: (id: string) => Teacher | undefined;
  refresh: () => void;
}

const TeacherContext = createContext<TeacherContextValue | null>(null);

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function TeacherProvider({ children }: { children: ReactNode }) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  const refresh = useCallback(() => {
    setTeachers(getStoredTeachers());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (teachers.length >= 0) {
      setStoredTeachers(teachers);
    }
  }, [teachers]);

  const addTeacher = useCallback((data: TeacherFormData): Teacher => {
    const id = generateId();
    const teacher: Teacher = {
      id,
      name: data.name,
      role: data.role,
      email: data.email,
      imageSrc: data.imageSrc,
    };
    setTeachers((prev) => [...prev, teacher]);
    return teacher;
  }, []);

  const updateTeacher = useCallback(
    (id: string, data: TeacherFormData) => {
      setTeachers((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                name: data.name,
                role: data.role,
                email: data.email,
                imageSrc: data.imageSrc,
              }
            : t
        )
      );
    },
    []
  );

  const deleteTeacher = useCallback((id: string) => {
    setTeachers((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const getTeacher = useCallback(
    (id: string) => teachers.find((t) => t.id === id),
    [teachers]
  );

  return (
    <TeacherContext.Provider
      value={{
        teachers,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        getTeacher,
        refresh,
      }}
    >
      {children}
    </TeacherContext.Provider>
  );
}

export function useTeachers() {
  const ctx = useContext(TeacherContext);
  if (!ctx) {
    throw new Error("useTeachers must be used within TeacherProvider");
  }
  return ctx;
}
