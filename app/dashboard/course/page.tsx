"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  PageHeader,
  RecommendedCourseBanner,
  CoursesSectionHeader,
  CourseGrid,
  type CourseCardProps,
} from "@/components/course";
import { useRole } from "@/contexts/role-context";
import { getCourses, type CourseItem } from "@/services/course.service";
import {
  getEnrollmentsByUserId,
  createEnrollment,
  type EnrollmentItem,
} from "@/services/enrollment.service";
import { toast } from "sonner";

export default function CoursePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { role } = useRole();
  const userName = session?.user?.name?.split(" ")[0] || "Andrew";
  const userId = session?.user?.id ? Number(session.user.id) : null;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allCourses, setAllCourses] = useState<CourseItem[]>([]);
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
        getCourses(token, { page: 1, size: 100 }),
        userId ? getEnrollmentsByUserId(token, userId) : Promise.resolve([]),
      ]);
      setAllCourses(coursesRes.payload?.items ?? []);
      setEnrollments(Array.isArray(enrollmentsList) ? enrollmentsList : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load courses"
      );
      setAllCourses([]);
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, status, userId]);

  useEffect(() => {
    if (status === "loading") return;
    fetchData();
  }, [fetchData, status]);

  const handleSearch = (value: string) => {
    // Client-side filter is handled via search state if needed
    console.log("Search:", value);
  };

  const handleStartLearning = () => {
    const firstEnrolled = enrollments[0];
    if (firstEnrolled?.course_id) {
      router.push(`/dashboard/course/${firstEnrolled.course_id}`);
    } else {
      router.push("/dashboard/course/basic-ux");
    }
  };

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
  const courseById = new Map(allCourses.map((c) => [c.course_id, c]));

  const inProgressCourses: CourseCardProps[] = enrollments.map((e) => {
    const course = courseById.get(e.course_id);
    const author = course?.instructor_name ?? "—";
    return {
      variant: "progress",
      title: e.course_name ?? course?.course_name ?? "Untitled",
      author,
      progress: 0, // API could provide progress later
      courseId: e.course_id,
      onViewCourse: handleViewCourse,
      onContinue: () => handleContinue(e.course_id),
    };
  });

  const availableCourses: CourseCardProps[] = allCourses
    .filter((c) => !enrolledCourseIds.has(c.course_id))
    .map((c) => ({
      variant: "enrollment" as const,
      title: c.course_name ?? "Untitled",
      author: c.instructor_name ?? "—",
      rating: 4.5,
      duration: undefined,
      courseId: c.course_id,
      onViewCourse: handleViewCourse,
      onEnroll: () => handleEnroll(c.course_id),
      hideActions: false,
    }));

  const catalogCourses: CourseCardProps[] = allCourses.map((c) => ({
    variant: "enrollment" as const,
    title: c.course_name ?? "Untitled",
    author: c.instructor_name ?? "—",
    rating: 4.5,
    duration: undefined,
    courseId: c.course_id,
    onViewCourse: handleViewCourse,
    onEnroll: () => handleEnroll(c.course_id),
    hideActions: role === "admin",
  }));

  const isStudent = role === "student";
  const isTeacher = role === "teacher";

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="min-h-screen bg-white p-8 sm:p-10 lg:p-12"
    >
      <PageHeader
        userName={userName}
        greeting="Welcome back"
        subtitle={
          isStudent
            ? "Ready to continue your learning journey?"
            : isTeacher
              ? "Manage your courses and track student progress."
              : "Manage courses, categories, and enrollments."
        }
        searchPlaceholder={
          isStudent ? "Search for course, skills..." : "Search courses..."
        }
        onSearch={handleSearch}
      />

      {isStudent && (
        <RecommendedCourseBanner onStartLearning={handleStartLearning} />
      )}

      {isStudent ? (
        <>
          <section className="mb-12">
            <CoursesSectionHeader
              title="My courses"
              seeAllHref="/dashboard/course"
            />
            <CourseGrid courses={inProgressCourses} />
          </section>
          <section>
            <CoursesSectionHeader
              title="All courses"
              seeAllHref="/dashboard/course"
            />
            <CourseGrid courses={availableCourses} hideActions={false} />
          </section>
        </>
      ) : (
        <section>
          <CoursesSectionHeader title="Course catalog" />
          <CourseGrid courses={catalogCourses} hideActions={role === "admin"} />
        </section>
      )}
    </motion.div>
  );
}
