"use client";

import { useState } from "react";
import EnrollmentsHeader from "./enrollments-header";
import EnrollmentsTable from "./enrollments-table";

export default function EnrollmentPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 m-8">
      <EnrollmentsHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCourse={selectedCourse}
        onCourseChange={setSelectedCourse}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
      />

      <EnrollmentsTable
        searchTerm={searchTerm}
        selectedCourse={selectedCourse}
        selectedStatus={selectedStatus}
      />
    </div>
  );
}
