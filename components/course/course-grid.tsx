"use client";

import { CourseCard, type CourseCardProps } from "./course-card";

interface CourseGridProps {
  courses: CourseCardProps[];
}

export function CourseGrid({ courses }: CourseGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course, index) => (
        <CourseCard key={`${course.title}-${index}`} {...course} />
      ))}
    </div>
  );
}
