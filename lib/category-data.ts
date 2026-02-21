export interface CourseLesson {
  id: string;
  title: string;
  duration: string;
  videoUrl?: string;
}

export interface CourseModule {
  id: string;
  title: string;
  lessons: CourseLesson[];
}

export interface CategoryCourse {
  id?: string;
  title: string;
  instructor: string;
  imageSrc?: string;
  slug?: string;
  description?: string;
  modules?: CourseModule[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  iconColor: string;
  courses: CategoryCourse[];
}

const DEFAULT_CATEGORIES: Category[] = [
  {
    id: "programming",
    name: "Programming",
    slug: "programming",
    iconName: "Code2",
    iconColor: "pink",
    courses: [
      { title: "Basic Java", instructor: "David", slug: "basic-java" },
      { title: "Advance Python", instructor: "John", slug: "advance-python" },
      { title: "OOP Concept", instructor: "David", slug: "oop-concept" },
      { title: "Web Development", instructor: "David", slug: "web-development" },
      { title: "API 101", instructor: "Heng", slug: "api-101" },
      {
        title: "Basic Core Banking",
        instructor: "Seth",
        slug: "basic-core-banking",
      },
      { title: "Introduction to C++", instructor: "Mike", slug: "intro-cpp" },
      { title: "JavaScript Fundamentals", instructor: "Sarah", slug: "js-fundamentals" },
      { title: "React & Redux", instructor: "Emily", slug: "react-redux" },
    ],
  },
  {
    id: "networking",
    name: "Networking",
    slug: "networking",
    iconName: "Globe",
    iconColor: "blue",
    courses: [
      { title: "Basic Linux", instructor: "Davic", slug: "basic-linux" },
      { title: "Basic Linux II", instructor: "David", slug: "basic-linux-ii" },
      {
        title: "Basic Linux III",
        instructor: "David",
        slug: "basic-linux-iii",
      },
      {
        title: "Router Configure",
        instructor: "James",
        slug: "router-configure",
      },
      { title: "Hardware 101", instructor: "John", slug: "hardware-101" },
      { title: "Window Server", instructor: "John", slug: "window-server" },
      { title: "CCNA Essentials", instructor: "James", slug: "ccna-essentials" },
      { title: "Firewall & Security", instructor: "Alex", slug: "firewall-security" },
    ],
  },
  {
    id: "design",
    name: "Design",
    slug: "design",
    iconName: "Palette",
    iconColor: "amber",
    courses: [
      {
        title: "Basic Photoshop",
        instructor: "Sophea",
        slug: "basic-photoshop",
      },
      {
        title: "Basic Illustrator",
        instructor: "Buntheoun",
        slug: "basic-illustrator",
      },
      {
        title: "Basic Premiere Pro",
        instructor: "Buntheoun",
        slug: "basic-premiere-pro",
      },
      { title: "Color Theory", instructor: "Seng", slug: "color-theory" },
      { title: "Design Laws", instructor: "Seng", slug: "design-laws" },
      { title: "Ratio", instructor: "Seng", slug: "ratio" },
      { title: "UI/UX Fundamentals", instructor: "Lisa", slug: "ui-ux-fundamentals" },
      { title: "Figma for Designers", instructor: "Lisa", slug: "figma-for-designers" },
    ],
  },
  {
    id: "data-science",
    name: "Data Science",
    slug: "data-science",
    iconName: "Database",
    iconColor: "green",
    courses: [
      { title: "Python for Data Analysis", instructor: "Emily", slug: "python-data-analysis" },
      { title: "Machine Learning Basics", instructor: "David", slug: "ml-basics" },
      { title: "SQL & Databases", instructor: "Heng", slug: "sql-databases" },
      { title: "Data Visualization", instructor: "Sarah", slug: "data-visualization" },
      { title: "Statistics for DS", instructor: "Emily", slug: "stats-for-ds" },
      { title: "Deep Learning Intro", instructor: "David", slug: "deep-learning-intro" },
    ],
  },
  {
    id: "cloud-devops",
    name: "Cloud & DevOps",
    slug: "cloud-devops",
    iconName: "Cpu",
    iconColor: "purple",
    courses: [
      { title: "AWS Fundamentals", instructor: "Alex", slug: "aws-fundamentals" },
      { title: "Docker & Containers", instructor: "Mike", slug: "docker-containers" },
      { title: "Kubernetes Basics", instructor: "Alex", slug: "kubernetes-basics" },
      { title: "CI/CD Pipelines", instructor: "James", slug: "cicd-pipelines" },
      { title: "Terraform for IaC", instructor: "Alex", slug: "terraform-iac" },
    ],
  },
  {
    id: "business",
    name: "Business",
    slug: "business",
    iconName: "BookOpen",
    iconColor: "red",
    courses: [
      { title: "Project Management", instructor: "John", slug: "project-management" },
      { title: "Agile & Scrum", instructor: "Sarah", slug: "agile-scrum" },
      { title: "Digital Marketing", instructor: "Lisa", slug: "digital-marketing" },
      { title: "Business Analytics", instructor: "Emily", slug: "business-analytics" },
      { title: "Leadership Skills", instructor: "David", slug: "leadership-skills" },
    ],
  },
];

const STORAGE_KEY = "online-course-categories";

export function getStoredCategories(): Category[] {
  if (typeof window === "undefined") return DEFAULT_CATEGORIES;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as Category[];
    }
  } catch {
    // ignore
  }
  return DEFAULT_CATEGORIES;
}

export function setStoredCategories(categories: Category[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
}

export const ICON_OPTIONS = [
  { value: "Code2", label: "Code" },
  { value: "Globe", label: "Globe" },
  { value: "Palette", label: "Palette" },
  { value: "BookOpen", label: "Book" },
  { value: "Cpu", label: "CPU" },
  { value: "Database", label: "Database" },
] as const;

export const COLOR_OPTIONS = [
  { value: "pink", label: "Pink", class: "text-pink-500" },
  { value: "blue", label: "Blue", class: "text-blue-500" },
  { value: "amber", label: "Amber", class: "text-amber-500" },
  { value: "green", label: "Green", class: "text-green-500" },
  { value: "purple", label: "Purple", class: "text-purple-500" },
  { value: "red", label: "Red", class: "text-red-500" },
] as const;
