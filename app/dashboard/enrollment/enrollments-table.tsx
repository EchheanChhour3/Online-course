"use client";

import { useState } from "react";
import { Edit, Trash2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ViewRole } from "@/contexts/role-context";
import type { EnrollmentItem } from "@/services/enrollment.service";
import { updateEnrollment, deleteEnrollment } from "@/services/enrollment.service";
import type { CourseItem } from "@/services/course.service";
import type { UserItem } from "@/services/user.service";
import { toast } from "sonner";

interface EnrollmentsTableProps {
  role: ViewRole;
  searchTerm: string;
  selectedCourse: string;
  selectedStatus: string;
  enrollments: EnrollmentItem[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  accessToken?: string | null;
  users?: UserItem[];
  courses?: CourseItem[];
}

function getInitials(name?: string): string {
  if (!name?.trim()) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function formatDate(value?: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function EnrollmentsTable({
  role,
  searchTerm,
  selectedCourse,
  selectedStatus,
  enrollments,
  loading = false,
  error = null,
  onRefresh,
  accessToken = null,
  users = [],
  courses = [],
}: EnrollmentsTableProps) {
  const router = useRouter();
  const isStudent = role === "student";
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<EnrollmentItem | null>(null);
  const [editForm, setEditForm] = useState({ userId: "", courseId: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleEditClick = (e: EnrollmentItem) => {
    setSelectedEnrollment(e);
    setEditForm({
      userId: String(e.user_id),
      courseId: String(e.course_id),
    });
    setEditOpen(true);
  };

  const handleDeleteClick = (e: EnrollmentItem) => {
    setSelectedEnrollment(e);
    setDeleteOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!accessToken || !selectedEnrollment) return;
    const userId = Number(editForm.userId);
    const courseId = Number(editForm.courseId);
    if (!userId || !courseId) {
      toast.error("Please select both student and course.");
      return;
    }
    setSubmitting(true);
    try {
      await updateEnrollment(accessToken, selectedEnrollment.enrollment_id, userId, courseId);
      toast.success("Enrollment updated successfully");
      setEditOpen(false);
      setSelectedEnrollment(null);
      onRefresh?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update enrollment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!accessToken || !selectedEnrollment) return;
    setSubmitting(true);
    try {
      await deleteEnrollment(accessToken, selectedEnrollment.enrollment_id);
      toast.success("Enrollment deleted successfully");
      setDeleteOpen(false);
      setSelectedEnrollment(null);
      onRefresh?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete enrollment");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredEnrollments = enrollments.filter((e) => {
    const userName = e.user_name ?? "";
    const userEmail = e.user_email ?? "";
    const courseName = e.course_name ?? "";
    const matchesSearch =
      userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      courseName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCourse =
      selectedCourse === "all" ||
      String(e.course_id) === selectedCourse;

    const matchesStatus =
      selectedStatus === "all" ||
      (e.enrollment_status?.toLowerCase() ?? "") === selectedStatus.toLowerCase();

    return matchesSearch && matchesCourse && matchesStatus;
  });

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-center py-16">
          <p className="text-gray-500">Loading enrollments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <p className="text-red-500">{error}</p>
          {onRefresh && (
            <Button variant="outline" onClick={onRefresh}>
              Retry
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {isStudent ? "COURSE" : "STUDENT"}
              </th>
              {!isStudent && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  COURSE
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {isStudent ? "ENROLLED" : "ENROLLMENT DATE"}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {isStudent ? "ACTION" : "ACTIONS"}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEnrollments.map((e) => (
              <tr key={e.enrollment_id} className="hover:bg-gray-50">
                {isStudent ? (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {e.course_name ?? "—"}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {e.course_id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(e.enrollment_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        onClick={() => router.push(`/dashboard/course/${e.course_id}`)}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Continue
                      </Button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {getInitials(e.user_name)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {e.user_name ?? "—"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {e.user_email ?? "—"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {e.course_name ?? "—"}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {e.course_id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(e.enrollment_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        {role === "admin" ? (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1"
                              onClick={() => handleEditClick(e)}
                              aria-label="Edit enrollment"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1"
                              onClick={() => handleDeleteClick(e)}
                              aria-label="Delete enrollment"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1"
                            onClick={() => router.push(`/dashboard/course/${e.course_id}`)}
                          >
                            View
                          </Button>
                        )}
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredEnrollments.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-sm">No enrollments found</div>
          <div className="text-gray-400 text-xs mt-2">
            Try adjusting your search or filters
          </div>
        </div>
      )}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Enrollment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Student</Label>
              <Select
                value={editForm.userId}
                onValueChange={(v) => setEditForm((p) => ({ ...p, userId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
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
            </div>
            <div className="space-y-2">
              <Label>Course</Label>
              <Select
                value={editForm.courseId}
                onValueChange={(v) => setEditForm((p) => ({ ...p, courseId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
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
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleEditSubmit} disabled={submitting}>
              {submitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Enrollment</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 py-2">
            Are you sure you want to remove{" "}
            <strong>{selectedEnrollment?.user_name ?? selectedEnrollment?.user_email ?? "this student"}</strong>{" "}
            from <strong>{selectedEnrollment?.course_name ?? "the course"}</strong>? This cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={submitting}
            >
              {submitting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
