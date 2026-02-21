"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useSession } from "next-auth/react";
import { getTeachers, type TeacherItem } from "@/services/teacher.service";
import type { Teacher } from "@/lib/teacher-data";

export interface TeacherFormData {
  name: string;
  role: string;
  email?: string;
  imageSrc?: string;
}

interface TeacherContextValue {
  teachers: Teacher[];
  loading: boolean;
  addTeacher: (data: TeacherFormData) => Teacher;
  updateTeacher: (id: string, data: TeacherFormData) => void;
  deleteTeacher: (id: string) => void;
  getTeacher: (id: string) => Teacher | undefined;
  refresh: () => void;
}

const TeacherContext = createContext<TeacherContextValue | null>(null);

function mapApiTeacher(item: TeacherItem): Teacher {
  const roleList = item.role;
  let roleStr = "Instructor";
  if (Array.isArray(roleList) && roleList.length > 0) {
    const r = String(roleList[0]);
    roleStr = r === "TEACHER" ? "Teacher" : r.charAt(0) + r.slice(1).toLowerCase();
  }
  const userInfo = item.user_info as Record<string, unknown> | undefined;
  const inner = (userInfo?.userInfo ?? userInfo) as Record<string, unknown> | undefined;
  const headline = (inner?.headline as string) || roleStr;
  return {
    id: String(item.user_id),
    name: item.full_name ?? "Unknown",
    role: headline || roleStr,
    email: item.email,
  };
}

export function TeacherProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = session?.accessToken;
    if (!token || status !== "authenticated") {
      setLoading(false);
      setTeachers([]);
      return;
    }
    setLoading(true);
    try {
      const list = await getTeachers(token);
      setTeachers(Array.isArray(list) ? list.map(mapApiTeacher) : []);
    } catch {
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, status]);

  useEffect(() => {
    if (status === "loading") return;
    refresh();
  }, [refresh, status]);

  const addTeacher = useCallback((data: TeacherFormData): Teacher => {
    const id = crypto.randomUUID?.() ?? Date.now().toString();
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
        loading,
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
