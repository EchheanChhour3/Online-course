"use client";

interface CourseOverviewProps {
  overview?: string;
  objectives?: string[];
}

const defaultOverview =
  "Introduction to User Experience Design provides a foundational understanding of UX principles, methodologies, and tools. This course is designed for anyone looking to start a career in UX design or improve their understanding of user-centered design practices.";

const defaultObjectives = [
  "Gain a clear understanding of what UX Design is and why it matters.",
  "Explore the fundamental principles of user-centered design.",
  "Learn about the key elements that contribute to a positive user experience, including information architecture, interaction design, and visual design.",
];

export function CourseOverview({
  overview = defaultOverview,
  objectives = defaultObjectives,
}: CourseOverviewProps) {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Course Overview
        </h3>
        <p className="text-gray-600 leading-relaxed">{overview}</p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Key Learning Objectives
        </h3>
        <ul className="space-y-2">
          {objectives.map((objective, index) => (
            <li
              key={index}
              className="flex gap-2 text-gray-600 leading-relaxed"
            >
              <span className="text-blue-600 mt-1.5">•</span>
              <span>{objective}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
