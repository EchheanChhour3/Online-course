"use server";

export interface UserItem {
  user_id: number;
  full_name: string;
  email?: string;
  status?: string;
  role?: string[];
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

/** Admin only. Get all users for enrollment assignment. */
export async function getUsers(
  accessToken: string
): Promise<UserItem[]> {
  const url = `${baseUrl}/api/v1/auth/users`;
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
