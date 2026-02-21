"use server";

export interface TeacherItem {
  user_id: number;
  full_name: string;
  email?: string;
  status?: string;
  role?: string[];
  user_info?: Record<string, unknown>;
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

export async function getTeachers(
  accessToken: string
): Promise<TeacherItem[]> {
  const url = `${baseUrl}/api/v1/auth/teachers`;
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
