"use server";

export interface GroupMemberItem {
  user_id: number;
  full_name: string;
  email: string;
}

export interface GroupCourseItem {
  course_id: number;
  course_name: string;
}

export interface GroupItem {
  group_id: number;
  group_name: string;
  members: GroupMemberItem[];
  courses: GroupCourseItem[];
  member_count: number;
  course_count: number;
}

export interface GetGroupsParams {
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: "ASC" | "DESC";
}

export interface GetGroupsResponse {
  payload: {
    items: GroupItem[];
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

export async function getAllGroups(
  accessToken: string,
  params: GetGroupsParams = {}
): Promise<GetGroupsResponse["payload"]> {
  const { page = 1, size = 100, sortBy = "groupName", direction = "ASC" } = params;
  const searchParams = new URLSearchParams({
    page: String(page),
    size: String(size),
    sortBy,
    direction,
  });
  const url = `${baseUrl}/api/v1/groups?${searchParams.toString()}`;
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

export async function getGroupById(
  accessToken: string,
  groupId: number
): Promise<GroupItem> {
  const url = `${baseUrl}/api/v1/groups/${groupId}`;
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

export async function createGroup(
  accessToken: string,
  groupName: string
): Promise<GroupItem> {
  const url = `${baseUrl}/api/v1/groups`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ group_name: groupName }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw parseError(response, errorText);
  }

  const result = await response.json();
  return result.payload;
}

export async function updateGroup(
  accessToken: string,
  groupId: number,
  groupName: string
): Promise<GroupItem> {
  const url = `${baseUrl}/api/v1/groups/${groupId}`;
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ group_name: groupName }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw parseError(response, errorText);
  }

  const result = await response.json();
  return result.payload;
}

export async function deleteGroup(
  accessToken: string,
  groupId: number
): Promise<void> {
  const url = `${baseUrl}/api/v1/groups/${groupId}`;
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

export async function addGroupMember(
  accessToken: string,
  groupId: number,
  userId: number
): Promise<GroupItem> {
  const url = `${baseUrl}/api/v1/groups/${groupId}/members`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ user_id: userId }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw parseError(response, errorText);
  }

  const result = await response.json();
  return result.payload;
}

export async function removeGroupMember(
  accessToken: string,
  groupId: number,
  userId: number
): Promise<GroupItem> {
  const url = `${baseUrl}/api/v1/groups/${groupId}/members/${userId}`;
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

  const result = await response.json();
  return result.payload;
}

export async function addGroupCourse(
  accessToken: string,
  groupId: number,
  courseId: number
): Promise<GroupItem> {
  const url = `${baseUrl}/api/v1/groups/${groupId}/courses`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ course_id: courseId }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw parseError(response, errorText);
  }

  const result = await response.json();
  return result.payload;
}

export async function removeGroupCourse(
  accessToken: string,
  groupId: number,
  courseId: number
): Promise<GroupItem> {
  const url = `${baseUrl}/api/v1/groups/${groupId}/courses/${courseId}`;
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

  const result = await response.json();
  return result.payload;
}

export async function getGroupCourseIdsByUser(
  accessToken: string,
  userId: number
): Promise<number[]> {
  const url = `${baseUrl}/api/v1/groups/user/${userId}/course-ids`;
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
