"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export type CourseTab = "details" | "instructor" | "courses" | "reviews";

interface CourseTabsProps {
  activeTab: CourseTab;
  onTabChange: (tab: CourseTab) => void;
}

const tabs: { id: CourseTab; label: string }[] = [
  { id: "details", label: "Details" },
  { id: "instructor", label: "Instructor" },
  { id: "courses", label: "Courses" },
  { id: "reviews", label: "Reviews" },
];

export function CourseTabs({ activeTab, onTabChange }: CourseTabsProps) {
  return (
    <div className="flex gap-1 border-b border-gray-200 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "px-4 py-3 text-sm font-medium transition-colors -mb-px",
            activeTab === tab.id
              ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
