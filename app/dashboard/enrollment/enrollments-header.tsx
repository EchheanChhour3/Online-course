"use client";

import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import type { ViewRole } from "@/contexts/role-context";
import type { CourseItem } from "@/services/course.service";

interface EnrollmentsHeaderProps {
  role: ViewRole;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCourse: string;
  onCourseChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  courses?: CourseItem[];
}

const statuses = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "dropped", label: "Dropped" },
];

export default function EnrollmentsHeader({
  role,
  searchTerm,
  onSearchChange,
  selectedCourse,
  onCourseChange,
  selectedStatus,
  onStatusChange,
  courses = [],
}: EnrollmentsHeaderProps) {
  const router = useRouter();

  const handleCreateEnrollment = () => {
    router.push("/dashboard/enrollment/create");
  };

  const isAdmin = role === "admin";
  const isStudent = role === "student";

  const headerTitle =
    isStudent ? "My enrollments" : role === "teacher" ? "Students in my courses" : "Enrollments";
  const headerSubtitle =
    isStudent
      ? "View your enrolled courses and track your progress"
      : role === "teacher"
        ? "See students enrolled in your courses"
        : "Manage student enrollments and track their progress";

  return (
    <div className="mb-8">
      {/* Header Title */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{headerTitle}</h1>
        <p className="text-gray-600 mt-2">{headerSubtitle}</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-6">
        {/* Search Bar */}
        <div className="relative flex-1 lg:max-w-lg">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder={isStudent ? "Search my courses..." : "Search enrollments..."}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-4 h-10 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Filters and Create Button */}
        <div className="flex gap-3 items-center w-full lg:w-auto">
          {/* Course Filter */}
          <Select value={selectedCourse} onValueChange={onCourseChange}>
            <SelectTrigger className="w-full lg:w-40 h-10 border-gray-300 focus:ring-blue-500 focus:border-blue-500">
              <SelectValue placeholder="All Courses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {courses.map((c) => (
                <SelectItem key={c.course_id} value={String(c.course_id)}>
                  {c.course_name ?? "Untitled"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter - hide for student (simpler view) */}
          {!isStudent && (
            <Select value={selectedStatus} onValueChange={onStatusChange}>
              <SelectTrigger className="w-full lg:w-32 h-10 border-gray-300 focus:ring-blue-500 focus:border-blue-500">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Create Enrollment Button - Admin only */}
          {isAdmin && (
            <Button
              onClick={handleCreateEnrollment}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 h-10 px-4"
            >
              <Plus className="w-4 h-4" />
              Create enrollment
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
