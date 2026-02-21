"use server";

export interface EnrollmentItem {
  enrollment_id: number;
  user_id: number;
  course_id: number;
  user_name?: string;
  user_email?: string;
  course_name?: string;
  enrollment_date?: string;
  view_count?: number;
  join_count?: number;
  enrollment_status?: string;
}

export interface GetEnrollmentsParams {
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: "ASC" | "DESC";
}

export interface GetEnrollmentsResponse {
  payload: {
    items: EnrollmentItem[];
    pagination: {
      totalElements: number;
      currentPage: number;
      pageSize: number;
      totalPages: number;
    };
  };
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

export async function getAllEnrollments(
  accessToken: string,
  params: GetEnrollmentsParams = {}
): Promise<GetEnrollmentsResponse["payload"]> {
  const { page = 1, size = 100, sortBy = "enrollmentDate", direction = "DESC" } = params;
  const searchParams = new URLSearchParams({
    page: String(page),
    size: String(size),
    sortBy,
    direction,
  });
  const url = `${baseUrl}/api/v1/enrollments?${searchParams.toString()}`;
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
  return result.payload;
}

export async function getEnrollmentsByUserId(
  accessToken: string,
  userId: number
): Promise<EnrollmentItem[]> {
  const url = `${baseUrl}/api/v1/enrollments/user/${userId}`;
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

export async function createEnrollment(
  accessToken: string,
  userId: number,
  courseId: number
): Promise<EnrollmentItem> {
  const url = `${baseUrl}/api/v1/enrollments`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      user_id: userId,
      course_id: courseId,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw parseError(response, errorText);
  }

  const result = await response.json();
  return result.payload;
}

export async function updateEnrollment(
  accessToken: string,
  enrollmentId: number,
  userId: number,
  courseId: number
): Promise<EnrollmentItem> {
  const url = `${baseUrl}/api/v1/enrollments/${enrollmentId}`;
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      user_id: userId,
      course_id: courseId,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw parseError(response, errorText);
  }

  const result = await response.json();
  return result.payload;
}

export async function deleteEnrollment(
  accessToken: string,
  enrollmentId: number
): Promise<void> {
  const url = `${baseUrl}/api/v1/enrollments/${enrollmentId}`;
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
