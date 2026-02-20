"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  PageHeader,
  RecommendedCourseBanner,
  CoursesSectionHeader,
  CourseGrid,
  type CourseCardProps,
} from "@/components/course";

const inProgressCourses: CourseCardProps[] = [
  {
    variant: "progress",
    title: "Advanced React Patterns",
    author: "Lork Metorb",
    progress: 75,
    onContinue: () => {},
  },
  {
    variant: "progress",
    title: "Node.js Fundamentals",
    author: "Sarah Chen",
    progress: 45,
    onContinue: () => {},
  },
  {
    variant: "progress",
    title: "TypeScript Mastery",
    author: "Mike Johnson",
    progress: 60,
    onContinue: () => {},
  },
];

const enrollmentCourses: CourseCardProps[] = [
  {
    variant: "enrollment",
    title: "Advanced React Patterns",
    author: "Lork Metorb",
    rating: 4.9,
    duration: "12h 15m",
    onEnroll: () => {},
  },
  {
    variant: "enrollment",
    title: "Python for Data Science",
    author: "Emily Davis",
    rating: 4.8,
    duration: "15h 30m",
    onEnroll: () => {},
  },
  {
    variant: "enrollment",
    title: "Docker & Kubernetes",
    author: "Alex Kumar",
    rating: 4.7,
    duration: "10h 45m",
    onEnroll: () => {},
  },
];

export default function CoursePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const userName = session?.user?.name?.split(" ")[0] || "Andrew";

  const handleSearch = (value: string) => {
    // TODO: Implement search
    console.log("Search:", value);
  };

  const handleStartLearning = () => {
    router.push("/dashboard/course/basic-ux");
  };

  return (
    <div className="min-h-screen bg-white p-8 sm:p-10 lg:p-12">
      <PageHeader
        userName={userName}
        onSearch={handleSearch}
      />

      <RecommendedCourseBanner onStartLearning={handleStartLearning} />

      <section>
        <CoursesSectionHeader />
        <CourseGrid courses={[...inProgressCourses, ...enrollmentCourses]} />
      </section>
    </div>
  );
}
