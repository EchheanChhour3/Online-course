export interface Teacher {
  id: string;
  name: string;
  role: string;
  email?: string;
  imageSrc?: string;
}

const DEFAULT_TEACHERS: Teacher[] = [
  { id: "1", name: "Ronald Richards", role: "UI/UX Designer", email: "ronald@example.com" },
  { id: "2", name: "Sarah Chen", role: "Frontend Developer", email: "sarah@example.com" },
  { id: "3", name: "Emily Davis", role: "Data Science Instructor", email: "emily@example.com" },
  { id: "4", name: "Mike Johnson", role: "Node.js Expert", email: "mike@example.com" },
  { id: "5", name: "Alex Kumar", role: "DevOps Engineer", email: "alex@example.com" },
  { id: "6", name: "John Smith", role: "TypeScript Specialist", email: "john@example.com" },
  { id: "7", name: "Lisa Wong", role: "GraphQL Developer", email: "lisa@example.com" },
  { id: "8", name: "David Lee", role: "Machine Learning", email: "david@example.com" },
  { id: "9", name: "James Wilson", role: "Full Stack Developer", email: "james@example.com" },
  { id: "10", name: "Maria Garcia", role: "Python Instructor", email: "maria@example.com" },
  { id: "11", name: "Chris Brown", role: "AWS Solutions Architect", email: "chris@example.com" },
  { id: "12", name: "Anna Kowalski", role: "React Specialist", email: "anna@example.com" },
  { id: "13", name: "Kevin Nguyen", role: "Mobile Developer", email: "kevin@example.com" },
  { id: "14", name: "Rachel Green", role: "Database Administrator", email: "rachel@example.com" },
  { id: "15", name: "Tom Anderson", role: "Security Analyst", email: "tom@example.com" },
  { id: "16", name: "Nina Patel", role: "Product Designer", email: "nina@example.com" },
];

const STORAGE_KEY = "online-course-teachers";

export function getStoredTeachers(): Teacher[] {
  if (typeof window === "undefined") return DEFAULT_TEACHERS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as Teacher[];
    }
  } catch {
    // ignore
  }
  return DEFAULT_TEACHERS;
}

export function setStoredTeachers(teachers: Teacher[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(teachers));
}
