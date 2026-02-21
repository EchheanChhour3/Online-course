"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCourses, type CourseItem } from "@/services/course.service";
import { createEnrollment } from "@/services/enrollment.service";
import { getUsers, type UserItem } from "@/services/user.service";
import { toast } from "sonner";

export default function CreateEnrollmentPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    userId: "",
    courseId: "",
  });

  const fetchData = useCallback(async () => {
    const token = session?.accessToken;
    if (!token || status !== "authenticated") {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [coursesRes, usersList] = await Promise.all([
        getCourses(token, { page: 1, size: 500 }),
        getUsers(token),
      ]);
      setCourses(coursesRes.payload?.items ?? []);
      const allUsers = Array.isArray(usersList) ? usersList : [];
      setUsers(allUsers.filter((u) => u.role?.includes("STUDENT")));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load data");
      setCourses([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, status]);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      setLoading(false);
      return;
    }
    fetchData();
  }, [fetchData, status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = formData.userId ? Number(formData.userId) : 0;
    const courseId = formData.courseId ? Number(formData.courseId) : 0;
    if (!userId || !courseId) {
      toast.error("Please select both user and course.");
      return;
    }
    const token = session?.accessToken;
    if (!token) {
      toast.error("Please sign in to create enrollment.");
      return;
    }

    setSubmitting(true);
    try {
      await createEnrollment(token, userId, courseId);
      toast.success("Enrollment created successfully");
      router.push("/dashboard/enrollment");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create enrollment");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto mt-10">
        <div className="flex items-center justify-center min-h-[200px]">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto mt-10">
      <nav className="flex items-center text-sm text-gray-500 mb-6">
        <button
          onClick={() => router.push("/dashboard/enrollment")}
          className="hover:text-blue-600 transition-colors"
        >
          Enrollments
        </button>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">Create</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Create New Enrollment
        </h1>
        <p className="text-gray-500 mt-2">
          Assign a student to a course by selecting their email.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-8 bg-white p-8 rounded-xl border border-gray-200 shadow-sm"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="user">Student (by email) *</Label>
            <Select
              value={formData.userId}
              onValueChange={(v) => setFormData((p) => ({ ...p, userId: v }))}
              required
            >
              <SelectTrigger id="user" className="h-11">
                <SelectValue placeholder="Select student by email" />
              </SelectTrigger>
              <SelectContent>
                {users.map((u) => (
                  <SelectItem key={u.user_id} value={String(u.user_id)}>
                    {u.email ?? "—"}
                    {u.full_name ? ` (${u.full_name})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {users.length === 0 && (
              <p className="text-sm text-amber-600">
                No students found. Register students first.
              </p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="course">Course *</Label>
            <Select
              value={formData.courseId}
              onValueChange={(v) => setFormData((p) => ({ ...p, courseId: v }))}
              required
            >
              <SelectTrigger id="course" className="h-11">
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((c) => (
                  <SelectItem key={c.course_id} value={String(c.course_id)}>
                    {c.course_name ?? "Untitled"}
                    {c.instructor_name ? ` — ${c.instructor_name}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {courses.length === 0 && (
              <p className="text-sm text-amber-600">
                No courses found. Create courses first.
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 pt-4 border-t">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/dashboard/enrollment")}
            className="h-11 px-6"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting || users.length === 0 || courses.length === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white h-11 px-8"
          >
            {submitting ? "Creating..." : "Create Enrollment"}
          </Button>
        </div>
      </form>
    </div>
  );
}
