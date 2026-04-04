import type { GroupItem } from "@/services/group.service";
import type { CourseItem } from "@/services/course.service";
import type { User } from "@/services/auth.service";

/** Large mock set for pagination / list UI tests (default 250 groups). */
export function buildGroupItem(index: number): GroupItem {
  const memberCount = (index % 12) + 1;
  const courseCount = (index % 8) + 1;
  return {
    group_id: index,
    group_name: `QA Group ${String(index).padStart(4, "0")}`,
    member_count: memberCount,
    course_count: courseCount,
    members: Array.from({ length: Math.min(memberCount, 3) }, (_, m) => ({
      user_id: index * 100 + m,
      full_name: `Member ${index}-${m}`,
      email: `user${index}_${m}@example.test`,
    })),
    courses: Array.from({ length: Math.min(courseCount, 3) }, (_, c) => ({
      course_id: index * 10 + c,
      course_name: `Course ${index}-${c}`,
    })),
  };
}

export function generateManyGroups(total: number): GroupItem[] {
  return Array.from({ length: total }, (_, i) => buildGroupItem(i + 1));
}

export function generateManyCourses(total: number): CourseItem[] {
  return Array.from({ length: total }, (_, i) => ({
    course_id: i + 1,
    course_name: `Bulk Course ${String(i + 1).padStart(5, "0")}`,
    description: `Description for course ${i + 1}. `.repeat(3),
    is_active: i % 7 !== 0,
    course_status: (["NEW", "POPULAR", "RECOMMENDED"] as const)[i % 3],
    instructor_name: `Instructor ${(i % 40) + 1}`,
    instructor_id: (i % 40) + 1,
    category_id: (i % 12) + 1,
  }));
}

export function mockUser(id: number): User {
  return {
    user_id: id,
    full_name: `Test User ${id}`,
    status: "ACTIVE",
    email: `user${id}@example.test`,
    role: ["STUDENT"],
  };
}

export const VALID_LOGIN_BODY = {
  message: "OK",
  status: "OK",
  requested_time: new Date().toISOString(),
  payload: {
    accessToken: "mock-access-token",
    user: mockUser(1),
  },
};
