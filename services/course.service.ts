"use server";

export type CourseStatus = "NEW" | "POPULAR" | "RECOMMENDED";

export interface CourseModule {
  module_id: number;
  module_title: string;
  position?: number;
  lessons?: Array<{
    lesson_id: number;
    title: string;
    duration?: number;
    video_url?: string;
    position?: number;
  }>;
}

export interface CourseItem {
  course_id: number;
  category_id?: number;
  course_name: string;
  description?: string;
  is_active?: boolean;
  course_status?: CourseStatus;
  instructor_name?: string;
  instructor_id?: number;
  instructor_description?: string;
  modules?: CourseModule[];
}

export interface CoursePagination {
  totalElements: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

export interface GetCoursesPayload {
  items: CourseItem[];
  pagination: CoursePagination;
}

export interface GetCoursesResponse {
  message: string;
  status: string;
  requested_time: string;
  payload: GetCoursesPayload;
}

export interface GetCoursesParams {
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: "ASC" | "DESC";
}

export interface CreateCourseRequest {
  category_id: number;
  instructor_id: number;
  course_name: string;
  description: string;
  is_active?: boolean;
  course_status?: CourseStatus;
}

export interface UpdateCourseRequest {
  category_id: number;
  instructor_id?: number;
  course_name: string;
  description: string;
  is_active: boolean;
  course_status: CourseStatus;
}

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9091";

function parseError(response: Response, errorText: string): Error {
  let msg = `Request failed: ${response.status}`;
  try {
    const data = JSON.parse(errorText);
    const errMsg =
      data?.errors?.errorMessage ??
      data?.payload?.message ??
      data?.message ??
      data?.errorMessage;
    if (typeof errMsg === "string" && errMsg) msg = errMsg;
  } catch {
    if (errorText?.trim()) msg = errorText.trim();
  }
  return new Error(msg);
}

export async function getCourses(
  accessToken: string,
  params: GetCoursesParams = {},
): Promise<GetCoursesResponse> {
  const {
    page = 1,
    size = 200,
    sortBy = "createdAt",
    direction = "ASC",
  } = params;
  const searchParams = new URLSearchParams({
    page: String(page),
    size: String(size),
    sortBy,
    direction,
  });
  const url = `${baseUrl}/api/v1/courses?${searchParams.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw parseError(response, errorText);
  }

  return response.json();
}

export async function getCourseById(
  accessToken: string,
  courseId: number,
): Promise<{ message: string; payload: CourseItem }> {
  const url = `${baseUrl}/api/v1/courses/${courseId}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw parseError(response, errorText);
  }

  return response.json();
}

export async function createCourse(
  accessToken: string,
  data: CreateCourseRequest,
): Promise<CourseItem> {
  const url = `${baseUrl}/api/v1/courses`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      category_id: data.category_id,
      instructor_id: data.instructor_id,
      course_name: data.course_name.trim(),
      description: (data.description ?? "").trim(),
      is_active: data.is_active ?? true,
      course_status: data.course_status ?? "NEW",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw parseError(response, errorText);
  }

  const result = await response.json();
  return result.payload;
}

export async function updateCourse(
  accessToken: string,
  courseId: number,
  data: UpdateCourseRequest,
): Promise<CourseItem> {
  const url = `${baseUrl}/api/v1/courses/${courseId}`;
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      category_id: data.category_id,
      instructor_id: data.instructor_id ?? undefined,
      course_name: data.course_name.trim(),
      description: data.description.trim(),
      is_active: data.is_active,
      course_status: data.course_status,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw parseError(response, errorText);
  }

  const result = await response.json();
  return result.payload;
}

export async function deleteCourse(
  accessToken: string,
  courseId: number,
): Promise<void> {
  const url = `${baseUrl}/api/v1/courses/${courseId}`;
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw parseError(response, errorText);
  }
}
