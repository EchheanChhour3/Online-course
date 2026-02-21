"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import EnrollmentsHeader from "./enrollments-header";
import EnrollmentsTable from "./enrollments-table";
import { useRole } from "@/contexts/role-context";
import { getAllEnrollments, getEnrollmentsByUserId, type EnrollmentItem } from "@/services/enrollment.service";
import { getCourses, type CourseItem } from "@/services/course.service";
import { getUsers, type UserItem } from "@/services/user.service";

export default function EnrollmentPage() {
  const { role } = useRole();
  const { data: session, status } = useSession();
  const userId = session?.user?.id ? Number(session.user.id) : null;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [enrollments, setEnrollments] = useState<EnrollmentItem[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (status === "unauthenticated") {
      setLoading(false);
      setError("Please sign in to view enrollments.");
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
      const isStudent = role === "student";
      const [enrollmentsData, coursesRes, usersList] = await Promise.all([
        isStudent && userId
          ? getEnrollmentsByUserId(token, userId)
          : getAllEnrollments(token, { page: 1, size: 500 }).then((p) => p.items ?? []),
        getCourses(token, { page: 1, size: 200 }),
        role !== "student" ? getUsers(token) : Promise.resolve([]),
      ]);
      setEnrollments(Array.isArray(enrollmentsData) ? enrollmentsData : []);
      setCourses(coursesRes?.payload?.items ?? []);
      const allUsers = Array.isArray(usersList) ? usersList : [];
      setUsers(allUsers.filter((u) => u.role?.includes("STUDENT")));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load enrollments");
      setEnrollments([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, status, role, userId]);

  useEffect(() => {
    if (status === "loading") return;
    fetchData();
  }, [fetchData, status]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 m-8">
      <EnrollmentsHeader
        role={role}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCourse={selectedCourse}
        onCourseChange={setSelectedCourse}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        courses={courses}
      />

      <EnrollmentsTable
        role={role}
        searchTerm={searchTerm}
        selectedCourse={selectedCourse}
        selectedStatus={selectedStatus}
        enrollments={enrollments}
        loading={loading}
        error={error}
        onRefresh={fetchData}
        accessToken={session?.accessToken ?? null}
        users={users}
        courses={courses}
      />
    </div>
  );
}
