"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Check } from "lucide-react";

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  active?: boolean;
}

export interface CourseModule {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface CourseCompletionSidebarProps {
  modules?: CourseModule[];
}

const defaultModules: CourseModule[] = [
  {
    id: "1",
    title: "Introduction to UX Design",
    lessons: [
      {
        id: "1-1",
        title: "What is User Experience (UX) Design?",
        duration: "4min",
        completed: true,
      },
      {
        id: "1-2",
        title: "Historical Overview of UX Design",
        duration: "4min",
        completed: true,
      },
      {
        id: "1-3",
        title: "Understanding User-Centered Design",
        duration: "4min",
        completed: false,
        active: true,
      },
      {
        id: "1-4",
        title: "The Role of UX Design in Digital Products",
        duration: "4min",
        completed: false,
      },
      {
        id: "1-5",
        title: "Introduction to UX Design Tools and Techniques",
        duration: "4min",
        completed: false,
      },
    ],
  },
  {
    id: "2",
    title: "Basics of User-Centered Design",
    lessons: [
      {
        id: "2-1",
        title: "Understanding User Needs",
        duration: "5min",
        completed: false,
      },
      {
        id: "2-2",
        title: "Creating User Personas",
        duration: "6min",
        completed: false,
      },
    ],
  },
  {
    id: "3",
    title: "Elements of User Experience",
    lessons: [
      {
        id: "3-1",
        title: "Information Architecture",
        duration: "5min",
        completed: false,
      },
      {
        id: "3-2",
        title: "Interaction Design",
        duration: "6min",
        completed: false,
      },
    ],
  },
  {
    id: "4",
    title: "Visual Design Principles",
    lessons: [
      {
        id: "4-1",
        title: "Color and Typography",
        duration: "5min",
        completed: false,
      },
      {
        id: "4-2",
        title: "Layout and Spacing",
        duration: "6min",
        completed: false,
      },
    ],
  },
];

export function CourseCompletionSidebar({
  modules = defaultModules,
}: CourseCompletionSidebarProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    new Set([modules[0]?.id].filter(Boolean))
  );

  const toggleModule = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Course Completion
      </h3>
      <div className="space-y-1">
        {modules.map((module) => {
          const isExpanded = expandedIds.has(module.id);

          return (
            <div
              key={module.id}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => toggleModule(module.id)}
                className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
              >
                {module.title}
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 shrink-0" />
                )}
              </button>
              {isExpanded && (
                <div className="border-t border-gray-200 bg-gray-50/50">
                  {module.lessons.map((lesson) => (
                    <button
                      key={lesson.id}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left ${
                        lesson.active
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                            lesson.completed
                              ? "bg-blue-600 border-blue-600 text-white"
                              : lesson.active
                                ? "border-white text-white"
                                : "border-gray-400"
                          }`}
                        >
                          {lesson.completed && (
                            <Check className="w-2.5 h-2.5" strokeWidth={3} />
                          )}
                        </div>
                        <span className="truncate">{lesson.title}</span>
                      </div>
                      <span
                        className={`shrink-0 ml-2 ${
                          lesson.active ? "text-blue-100" : "text-gray-500"
                        }`}
                      >
                        {lesson.duration}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
