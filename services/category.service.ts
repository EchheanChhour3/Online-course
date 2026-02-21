"use server";

export interface CategoryItem {
  category_id: number;
  name: string;
  courses: unknown[];
}

export interface CategoryPagination {
  totalElements: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

export interface GetCategoriesPayload {
  items: CategoryItem[];
  pagination: CategoryPagination;
}

export interface GetCategoriesResponse {
  message: string;
  status: string;
  requested_time: string;
  payload: GetCategoriesPayload;
}

export interface GetCategoriesParams {
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: "ASC" | "DESC";
}

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9091";

export async function getCategories(
  accessToken: string,
  params: GetCategoriesParams = {},
): Promise<GetCategoriesResponse> {
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
  const url = `${baseUrl}/api/v1/category?${searchParams.toString()}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData: { message?: string };
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }
      throw new Error(errorData.message || "Failed to fetch categories");
    }

    return response.json();
  } catch (error) {
    console.error("Category service error:", error);
    throw error;
  }
}

function parseError(response: Response, errorText: string): Error {
  let errorData: { message?: string };
  try {
    errorData = JSON.parse(errorText);
  } catch {
    errorData = { message: errorText };
  }
  return new Error(errorData.message || `Request failed: ${response.status}`);
}

export async function createCategory(
  accessToken: string,
  category_name: string,
): Promise<void> {
  const url = `${baseUrl}/api/v1/category`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ category_name: category_name.trim() }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw parseError(response, errorText);
  }
}

export async function updateCategory(
  accessToken: string,
  category_id: number,
  category_name: string,
): Promise<void> {
  const url = `${baseUrl}/api/v1/category/${category_id}`;
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ category_name: category_name.trim() }),
  });
  console.log("Update category response:", response);
  if (!response.ok) {
    const errorText = await response.text();
    throw parseError(response, errorText);
  }
}

export async function deleteCategory(
  accessToken: string,
  category_id: number,
): Promise<void> {
  const url = `${baseUrl}/api/v1/category/${category_id}`;
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
