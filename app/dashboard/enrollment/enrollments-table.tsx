"use client";

import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EnrollmentsTableProps {
  searchTerm: string;
  selectedCourse: string;
  selectedStatus: string;
}

// Dummy data matching the image
const dummyEnrollments = [
  {
    id: 1,
    studentName: "Samantha Lee",
    email: "samantha.lee@gmail.com",
    course: "HTML",
    courseId: "CD-1001",
    enrollmentDate: "2025-10-24",
    avatar: "SL", // Using initials for avatar
  },
  {
    id: 2,
    studentName: "Samantha Lee",
    email: "samantha.lee@gmail.com",
    course: "HTML",
    courseId: "CD-1001",
    enrollmentDate: "2025-10-24",
    avatar: "SL",
  },
  {
    id: 3,
    studentName: "Samantha Lee",
    email: "samantha.lee@gmail.com",
    course: "HTML",
    courseId: "CD-1001",
    enrollmentDate: "2025-10-24",
    avatar: "SL",
  },
  {
    id: 4,
    studentName: "Samantha Lee",
    email: "samantha.lee@gmail.com",
    course: "HTML",
    courseId: "CD-1001",
    enrollmentDate: "2025-10-24",
    avatar: "SL",
  },
  {
    id: 5,
    studentName: "Samantha Lee",
    email: "samantha.lee@gmail.com",
    course: "HTML",
    courseId: "CD-1001",
    enrollmentDate: "2025-10-24",
    avatar: "SL",
  },
  {
    id: 6,
    studentName: "Samantha Lee",
    email: "samantha.lee@gmail.com",
    course: "HTML",
    courseId: "CD-1001",
    enrollmentDate: "2025-10-24",
    avatar: "SL",
  },
  {
    id: 7,
    studentName: "Samantha Lee",
    email: "samantha.lee@gmail.com",
    course: "HTML",
    courseId: "CD-1001",
    enrollmentDate: "2025-10-24",
    avatar: "SL",
  },
  {
    id: 8,
    studentName: "Samantha Lee",
    email: "samantha.lee@gmail.com",
    course: "HTML",
    courseId: "CD-1001",
    enrollmentDate: "2025-10-24",
    avatar: "SL",
  },
];

export default function EnrollmentsTable({
  searchTerm,
  selectedCourse,
  selectedStatus,
}: EnrollmentsTableProps) {
  // Filter enrollments based on search and filters
  const filteredEnrollments = dummyEnrollments.filter((enrollment) => {
    const matchesSearch =
      enrollment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.course.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCourse =
      selectedCourse === "all" ||
      enrollment.course.toLowerCase() === selectedCourse;

    return matchesSearch && matchesCourse;
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                STUDENT
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                COURSE
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ENROLLMENT DATE
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEnrollments.map((enrollment) => (
              <tr key={enrollment.id} className="hover:bg-gray-50">
                {/* Student Info with Avatar */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {/* Avatar */}
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {enrollment.avatar}
                        </span>
                      </div>
                    </div>
                    {/* Student Details */}
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {enrollment.studentName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {enrollment.email}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Course Info */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {enrollment.course}
                  </div>
                  <div className="text-sm text-gray-500">
                    {enrollment.courseId}
                  </div>
                </td>

                {/* Enrollment Date */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(enrollment.enrollmentDate).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      },
                    )}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredEnrollments.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-sm">No enrollments found</div>
          <div className="text-gray-400 text-xs mt-2">
            Try adjusting your search or filters
          </div>
        </div>
      )}
    </div>
  );
}
