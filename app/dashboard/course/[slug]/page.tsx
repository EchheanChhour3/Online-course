"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  CourseDetailHeader,
  CourseVideoPlayer,
  CourseTabs,
  type CourseTab,
  CourseOverview,
  InstructorProfile,
  CourseCompletionSidebar,
} from "@/components/course-detail";

export default function CourseDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [activeTab, setActiveTab] = useState<CourseTab>("details");

  const breadcrumbs = [
    { label: "Category", href: "/dashboard/category" },
    { label: "Programming", href: "/dashboard/category" },
    { label: "Basic UX" },
  ];

  return (
    <div className="min-h-screen bg-white p-8 sm:p-10 lg:p-12">
      <CourseDetailHeader
        title="Course Page"
        breadcrumbs={breadcrumbs}
      />

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column */}
        <div className="flex-1 min-w-0">
          <CourseVideoPlayer title="Basic UX Introduction" />

          <CourseTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {activeTab === "details" && (
            <>
              <CourseOverview />
              <div className="mt-8">
                <InstructorProfile />
              </div>
            </>
          )}

          {activeTab === "instructor" && (
            <InstructorProfile />
          )}

          {activeTab === "courses" && (
            <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500">
              Course content coming soon
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500">
              Reviews coming soon
            </div>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="lg:w-80 shrink-0">
          <CourseCompletionSidebar />
        </div>
      </div>
    </div>
  );
}
