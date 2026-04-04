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
  type EnrollmentItem,
} from "@/services/enrollment.service";
import { getGroupCourseIdsByUser } from "@/services/group.service";

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
  const [groupCourseIds, setGroupCourseIds] = useState<number[]>([]);

  const isStudent = role === "student";
  const isTeacher = role === "teacher";

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
      const [coursesRes, enrollmentsList, groupIds] = await Promise.all([
        getCourses(token, { page: 1, size: 100 }),
        userId ? getEnrollmentsByUserId(token, userId) : Promise.resolve([]),
        userId ? getGroupCourseIdsByUser(token, userId).catch(() => []) : Promise.resolve([]),
      ]);
      setAllCourses(coursesRes.payload?.items ?? []);
      setEnrollments(Array.isArray(enrollmentsList) ? enrollmentsList : []);
      setGroupCourseIds(Array.isArray(groupIds) ? groupIds : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load courses"
      );
      setAllCourses([]);
      setEnrollments([]);
      setGroupCourseIds([]);
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, status, userId]);

  useEffect(() => {
    if (status === "loading") return;
    fetchData();
  }, [fetchData, status]);

  const handleSearch = (value: string) => {
    console.log("Search:", value);
  };

  const handleStartLearning = () => {
    const firstEnrolled = enrollments[0];
    if (firstEnrolled?.course_id) {
      router.push(`/dashboard/course/${firstEnrolled.course_id}`);
    }
  };

  const handleContinue = (courseId: number) => {
    router.push(`/dashboard/course/${courseId}`);
  };

  const handleViewCourse = (courseId: number) => {
    router.push(`/dashboard/course/${courseId}`);
  };

  const enrolledCourseIds = new Set(enrollments.map((e) => e.course_id));
  const groupCourseIdSet = new Set(groupCourseIds);
  const courseById = new Map(allCourses.map((c) => [c.course_id, c]));

  // Courses the student has through direct enrollment
  const enrolledCourses: CourseCardProps[] = enrollments.map((e) => {
    const course = courseById.get(e.course_id);
    return {
      variant: "progress" as const,
      title: e.course_name ?? course?.course_name ?? "Untitled",
      author: course?.instructor_name ?? "—",
      progress: 0,
      courseId: e.course_id,
      onViewCourse: handleViewCourse,
      onContinue: () => handleContinue(e.course_id),
    };
  });

  // Courses the student has through group membership (not already enrolled directly)
  const groupOnlyCourses: CourseCardProps[] = allCourses
    .filter((c) => groupCourseIdSet.has(c.course_id) && !enrolledCourseIds.has(c.course_id))
    .map((c) => ({
      variant: "progress" as const,
      title: c.course_name ?? "Untitled",
      author: c.instructor_name ?? "—",
      progress: 0,
      courseId: c.course_id,
      onViewCourse: handleViewCourse,
      onContinue: () => handleContinue(c.course_id),
    }));

  const allStudentCourses = [...enrolledCourses, ...groupOnlyCourses];

  // Admin catalog (view-only, no enroll)
  const catalogCourses: CourseCardProps[] = allCourses.map((c) => ({
    variant: "enrollment" as const,
    title: c.course_name ?? "Untitled",
    author: c.instructor_name ?? "—",
    rating: 4.5,
    duration: undefined,
    courseId: c.course_id,
    onViewCourse: handleViewCourse,
    hideActions: true,
  }));

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

      {isStudent && allStudentCourses.length > 0 && (
        <RecommendedCourseBanner onStartLearning={handleStartLearning} />
      )}

      {isStudent ? (
        <section>
          <CoursesSectionHeader title="My Courses" />
          {allStudentCourses.length > 0 ? (
            <CourseGrid courses={allStudentCourses} />
          ) : (
            <div className="text-center py-12 text-gray-500">
              You are not enrolled in any courses yet. Please contact your administrator.
            </div>
          )}
        </section>
      ) : (
        <section>
          <CoursesSectionHeader title="Course catalog" />
          <CourseGrid courses={catalogCourses} hideActions={true} />
        </section>
      )}
    </motion.div>
  );
}
