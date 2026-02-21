"use client";

import { Star, Users, Play } from "lucide-react";

interface InstructorProfileProps {
  name?: string;
  title?: string;
  avatarSrc?: string;
  reviews?: number;
  students?: number;
  courses?: number;
  bio?: string;
}

export function InstructorProfile({
  name = "Ronald Richards",
  title = "UI/UX Designer",
  reviews = 40445,
  students = 500,
  courses = 15,
  bio = "Ronald Richards is an experienced UI/UX designer with over a decade of industry experience. He has worked with leading tech companies to create user-centric interfaces that drive engagement and satisfaction. His approach combines research-driven design with practical implementation strategies.",
}: InstructorProfileProps) {
  const stats = [
    { icon: Star, value: `${reviews.toLocaleString()} Reviews` },
    { icon: Users, value: `${students} Students` },
    { icon: Play, value: `${courses} Courses` },
  ];

  return (
    <section>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructor</h3>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
          <span className="text-2xl font-bold text-gray-500">
            {name.charAt(0)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900">{name}</h4>
          <p className="text-gray-500 text-sm mb-3">{title}</p>
          <div className="flex flex-wrap gap-4 mb-3">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.value}
                  className="flex items-center gap-2 text-sm text-gray-600"
                >
                  <Icon className="w-4 h-4" />
                  <span>{stat.value}</span>
                </div>
              );
            })}
          </div>
          {bio ? (
            <p className="text-gray-600 text-sm leading-relaxed">{bio}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
