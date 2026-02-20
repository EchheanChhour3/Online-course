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
  getStoredEnrollments,
  setStoredEnrollments,
  getCourseId,
  getInitials,
  type Enrollment,
} from "@/lib/enrollment-data";

interface EnrollmentFormData {
  studentName: string;
  email: string;
  phoneNumber: string;
  gender: string;
  course: string;
  enrollmentDate: string;
  additionalNote: string;
}

interface EnrollmentContextValue {
  enrollments: Enrollment[];
  addEnrollment: (data: EnrollmentFormData) => Enrollment;
  updateEnrollment: (id: string, data: EnrollmentFormData) => void;
  deleteEnrollment: (id: string) => void;
  getEnrollment: (id: string) => Enrollment | undefined;
  refresh: () => void;
}

const EnrollmentContext = createContext<EnrollmentContextValue | null>(null);

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function EnrollmentProvider({ children }: { children: ReactNode }) {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

  const refresh = useCallback(() => {
    setEnrollments(getStoredEnrollments());
  }, []);

  useEffect(() => refresh(), [refresh]);
  useEffect(() => {
    if (enrollments.length >= 0) setStoredEnrollments(enrollments);
  }, [enrollments]);

  const addEnrollment = useCallback((data: EnrollmentFormData): Enrollment => {
    const id = generateId();
    const courseId = getCourseId(data.course);
    const enrollment: Enrollment = {
      id,
      ...data,
      courseId,
      avatar: getInitials(data.studentName),
    };
    setEnrollments((prev) => [...prev, enrollment]);
    return enrollment;
  }, []);

  const updateEnrollment = useCallback((id: string, data: EnrollmentFormData) => {
    const courseId = getCourseId(data.course);
    setEnrollments((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              ...data,
              courseId,
              avatar: getInitials(data.studentName),
            }
          : e
      )
    );
  }, []);

  const deleteEnrollment = useCallback((id: string) => {
    setEnrollments((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const getEnrollment = useCallback(
    (id: string) => enrollments.find((e) => e.id === id),
    [enrollments]
  );

  return (
    <EnrollmentContext.Provider
      value={{
        enrollments,
        addEnrollment,
        updateEnrollment,
        deleteEnrollment,
        getEnrollment,
        refresh,
      }}
    >
      {children}
    </EnrollmentContext.Provider>
  );
}

export function useEnrollments() {
  const ctx = useContext(EnrollmentContext);
  if (!ctx) {
    throw new Error("useEnrollments must be used within EnrollmentProvider");
  }
  return ctx;
}
