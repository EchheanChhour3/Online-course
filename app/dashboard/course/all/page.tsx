"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  PageHeader,
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

export default function AllCoursesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { role } = useRole();
  const userId = session?.user?.id ? Number(session.user.id) : null;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentItem[]>([]);
  const [groupCourseIds, setGroupCourseIds] = useState<number[]>([]);

  const isStudent = role === "student";

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
        getCourses(token, { page: 1, size: 500 }),
        userId ? getEnrollmentsByUserId(token, userId) : Promise.resolve([]),
        userId ? getGroupCourseIdsByUser(token, userId).catch(() => []) : Promise.resolve([]),
      ]);
      setCourses(coursesRes.payload?.items ?? []);
      setEnrollments(Array.isArray(enrollmentsList) ? enrollmentsList : []);
      setGroupCourseIds(Array.isArray(groupIds) ? groupIds : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load courses"
      );
      setCourses([]);
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

  const handleContinue = (courseId: number) => {
    router.push(`/dashboard/course/${courseId}`);
  };

  const handleViewCourse = (courseId: number) => {
    router.push(`/dashboard/course/${courseId}`);
  };

  const enrolledCourseIds = new Set(enrollments.map((e) => e.course_id));
  const groupCourseIdSet = new Set(groupCourseIds);

  // For students: only show courses they have access to (enrolled or group)
  const accessibleCourses = isStudent
    ? courses.filter(
        (c) => enrolledCourseIds.has(c.course_id) || groupCourseIdSet.has(c.course_id)
      )
    : courses;

  const courseCards: CourseCardProps[] = accessibleCourses.map((c) => {
    const isEnrolled = enrolledCourseIds.has(c.course_id) || groupCourseIdSet.has(c.course_id);
    if (isEnrolled) {
      return {
        variant: "progress" as const,
        title: c.course_name ?? "Untitled",
        author: c.instructor_name ?? "—",
        courseId: c.course_id,
        onViewCourse: handleViewCourse,
        progress: 0,
        onContinue: () => handleContinue(c.course_id),
        hideActions: true,
      };
    }
    return {
      variant: "enrollment" as const,
      title: c.course_name ?? "Untitled",
      author: c.instructor_name ?? "—",
      courseId: c.course_id,
      onViewCourse: handleViewCourse,
      rating: 4.5,
      duration: undefined,
      hideActions: true,
    };
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="min-h-screen bg-white p-8 sm:p-10 lg:p-12"
    >
      <PageHeader
        userName={session?.user?.name?.split(" ")[0] || "User"}
        greeting={isStudent ? "My Courses" : "All courses"}
        subtitle={isStudent ? "Your enrolled courses" : "Browse the full catalog"}
        searchPlaceholder="Search courses..."
      />
      <section className="mt-8">
        {courseCards.length > 0 ? (
          <CourseGrid courses={courseCards} hideActions={true} />
        ) : (
          <div className="text-center py-12 text-gray-500">
            {isStudent
              ? "You are not enrolled in any courses yet. Please contact your administrator."
              : "No courses available."}
          </div>
        )}
      </section>
    </motion.div>
  );
}
