"use server";

export interface LessonItem {
  lesson_id: number;
  title: string;
  video_url?: string;
  content_text?: string;
  duration?: number;
  position?: number;
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

function parseDuration(durationStr: string): number {
  if (!durationStr || !durationStr.trim()) return 0;
  const m = durationStr.match(/(\d+)\s*min/i);
  if (m) return parseFloat(m[1]) || 0;
  const h = durationStr.match(/(\d+)\s*h/i);
  if (h) return (parseFloat(h[1]) || 0) * 60;
  return parseFloat(durationStr) || 0;
}

export async function createLesson(
  accessToken: string,
  moduleId: number,
  title: string,
  duration = "0min",
  videoUrl?: string,
  contentText?: string,
  position = 0
): Promise<LessonItem> {
  const url = `${baseUrl}/api/v1/lessons`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      module_id: moduleId,
      title: title.trim(),
      video_url: videoUrl?.trim() || "",
      content_text: contentText?.trim() || "",
      duration: parseDuration(duration),
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

export async function updateLesson(
  accessToken: string,
  lessonId: number,
  moduleId: number,
  title: string,
  duration = "0min",
  videoUrl?: string,
  contentText?: string,
  position = 0
): Promise<LessonItem> {
  const url = `${baseUrl}/api/v1/lessons/${lessonId}`;
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      module_id: moduleId,
      title: title.trim(),
      video_url: videoUrl?.trim() || "",
      content_text: contentText?.trim() || "",
      duration: parseDuration(duration),
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

export async function deleteLesson(
  accessToken: string,
  lessonId: number
): Promise<void> {
  const url = `${baseUrl}/api/v1/lessons/${lessonId}`;
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
