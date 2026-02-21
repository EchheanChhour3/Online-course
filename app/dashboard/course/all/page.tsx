"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  PageHeader,
  CourseGrid,
  type CourseCardProps,
} from "@/components/course";
import { getCourses, type CourseItem } from "@/services/course.service";
import {
  getEnrollmentsByUserId,
  createEnrollment,
  type EnrollmentItem,
} from "@/services/enrollment.service";
import { toast } from "sonner";

export default function AllCoursesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const userId = session?.user?.id ? Number(session.user.id) : null;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentItem[]>([]);
  const [enrollingId, setEnrollingId] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    if (status === "unauthenticated") {
      setLoading(false);
      setError("Please sign in to view courses.");
      return;
    }
    const token = session?.accessToken;
    if (!token && status === "authenticated") {
      setLoading(false);
      setError("Session expired. Please sign in again.");
      return;
    }
    if (!token) return;

    setLoading(true);
    setError(null);
    try {
      const [coursesRes, enrollmentsList] = await Promise.all([
        getCourses(token, { page: 1, size: 500 }),
        userId ? getEnrollmentsByUserId(token, userId) : Promise.resolve([]),
      ]);
      setCourses(coursesRes.payload?.items ?? []);
      setEnrollments(Array.isArray(enrollmentsList) ? enrollmentsList : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load courses"
      );
      setCourses([]);
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, status, userId]);

  useEffect(() => {
    if (status === "loading") return;
    fetchData();
  }, [fetchData, status]);

  const handleContinue = (courseId: number) => {
    router.push(`/dashboard/course/${courseId}`);
  };

  const handleViewCourse = (courseId: number) => {
    router.push(`/dashboard/course/${courseId}`);
  };

  const handleEnroll = async (courseId: number) => {
    if (!userId || !session?.accessToken) {
      toast.error("Please sign in to enroll.");
      return;
    }
    setEnrollingId(courseId);
    try {
      await createEnrollment(session.accessToken, userId, courseId);
      toast.success("Enrolled successfully!");
      await fetchData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to enroll";
      toast.error(msg);
    } finally {
      setEnrollingId(null);
    }
  };

  const enrolledCourseIds = new Set(enrollments.map((e) => e.course_id));

  const courseCards: CourseCardProps[] = courses.map((c) => {
    const isEnrolled = enrolledCourseIds.has(c.course_id);
    const base = {
      title: c.course_name ?? "Untitled",
      author: c.instructor_name ?? "—",
      courseId: c.course_id,
      onViewCourse: handleViewCourse,
      hideActions: false as const,
    };
    return isEnrolled
      ? { ...base, variant: "progress" as const, progress: 0, onContinue: () => handleContinue(c.course_id) }
      : { ...base, variant: "enrollment" as const, rating: 4.5, duration: undefined, onEnroll: () => handleEnroll(c.course_id) };
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-8 sm:p-10 lg:p-12">
        <div className="flex items-center justify-center min-h-[200px]">
          <p className="text-gray-500">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white p-8 sm:p-10 lg:p-12">
        <div className="flex flex-col items-center justify-center min-h-[200px] gap-2">
          <p className="text-red-500">{error}</p>
          <button
            type="button"
            onClick={fetchData}
            className="text-blue-600 hover:underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8 sm:p-10 lg:p-12">
      <PageHeader
        userName={session?.user?.name?.split(" ")[0] || "User"}
        greeting="All courses"
        subtitle="Browse the full catalog"
        searchPlaceholder="Search courses..."
      />
      <section className="mt-8">
        <CourseGrid courses={courseCards} hideActions={false} />
      </section>
    </div>
  );
}
