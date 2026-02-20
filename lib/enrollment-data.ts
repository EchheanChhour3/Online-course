export interface Enrollment {
  id: string;
  studentName: string;
  email: string;
  phoneNumber: string;
  gender: string;
  course: string;
  courseId: string;
  enrollmentDate: string;
  additionalNote: string;
  avatar: string;
}

const COURSE_IDS: Record<string, string> = {
  html: "CD-1001",
  css: "CD-1002",
  javascript: "CD-1003",
  react: "CD-1004",
  nodejs: "CD-1005",
};

export function getCourseId(value: string): string {
  return COURSE_IDS[value] ?? `CD-${value.toUpperCase().slice(0, 4)}`;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const STORAGE_KEY = "online-course-enrollments";
const DEFAULT_ENROLLMENTS: Enrollment[] = [];

export function getStoredEnrollments(): Enrollment[] {
  if (typeof window === "undefined") return DEFAULT_ENROLLMENTS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as Enrollment[];
  } catch {}
  return DEFAULT_ENROLLMENTS;
}

export function setStoredEnrollments(enrollments: Enrollment[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(enrollments));
}
