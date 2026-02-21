"use server";

export interface LessonItem {
  lesson_id: number;
  title: string;
  video_url?: string;
  content_text?: string;
  duration?: number;
  position?: number;
}

export interface ModuleItem {
  module_id: number;
  course_id: number;
  module_title: string;
  position: number;
  lessons?: LessonItem[];
}

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9091";

function parseError(response: Response, errorText: string): Error {
  let errorData: { message?: string };
  try {
    errorData = JSON.parse(errorText);
  } catch {
    errorData = { message: errorText };
  }
  return new Error(errorData.message || `Request failed: ${response.status}`);
}

export async function getModulesByCourseId(
  accessToken: string,
  courseId: number
): Promise<ModuleItem[]> {
  const url = `${baseUrl}/api/v1/modules/course/${courseId}`;
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

  const result = await response.json();
  return result.payload ?? [];
}

export async function createModule(
  accessToken: string,
  courseId: number,
  moduleTitle: string,
  position = 0
): Promise<ModuleItem> {
  const url = `${baseUrl}/api/v1/modules`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      course_id: courseId,
      module_title: moduleTitle.trim(),
      position,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw parseError(response, errorText);
  }

  const result = await response.json();
  return result.payload;
}

export async function updateModule(
  accessToken: string,
  moduleId: number,
  courseId: number,
  moduleTitle: string,
  position: number
): Promise<ModuleItem> {
  const url = `${baseUrl}/api/v1/modules/${moduleId}`;
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      course_id: courseId,
      module_title: moduleTitle.trim(),
      position,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw parseError(response, errorText);
  }

  const result = await response.json();
  return result.payload;
}

export async function deleteModule(
  accessToken: string,
  moduleId: number
): Promise<void> {
  const url = `${baseUrl}/api/v1/modules/${moduleId}`;
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
