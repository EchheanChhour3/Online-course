"use server";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserInfo {
  additionalProp1: any;
  additionalProp2: any;
  additionalProp3: any;
}

export interface User {
  user_id: number;
  full_name: string;
  status: string;
  email: string;
  role: string[];
  user_info: {
    userInfo: UserInfo;
  };
}

export interface LoginResponse {
  message: string;
  status: string;
  requested_time: string;
  payload: {
    accessToken: string;
    user: User;
  };
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  password: string;
  roles: string;
  user_info: {
    additionalProp1: any;
    additionalProp2: any;
    additionalProp3: any;
  };
}

export interface RegisterResponse {
  message: string;
  status: string;
  requested_time: string;
  payload: {
    user_id: number;
    full_name: string;
    status: string;
    email: string;
    role: string[];
    user_info: {
      userInfo: {
        additionalProp1: any;
        additionalProp2: any;
        additionalProp3: any;
      };
    };
  };
}

export interface ProfileResponse {
  message: string;
  status: string;
  requested_time: string;
  payload: User;
}

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  try {
    console.log("Login service called with:", credentials);
    console.log("Base URL:", baseUrl);
    console.log("Full URL:", `${baseUrl}/api/v1/auth/login`);

    const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });
    console.log("Login Response status:", response.status);
    console.log("Login Response ok:", response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Login API Error Response:", errorText);
      console.error("Login Response status:", response.status);

      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }

      throw new Error(errorData.message || "Login failed");
    }

    const result = await response.json();
    console.log("Login Success Response:", result);
    return result;
  } catch (error) {
    console.error("Login service error:", error);
    throw new Error("Login failed. Please try again.");
  }
}

export async function getProfile(
  accessToken: string,
): Promise<ProfileResponse> {
  try {
    console.log("Get profile service called");
    console.log("Full URL:", `${baseUrl}/api/v1/auth/profile`);

    const response = await fetch(`${baseUrl}/api/v1/auth/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log("Profile Response status:", response.status);
    console.log("Profile Response ok:", response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Profile API Error Response:", errorText);
      console.error("Profile Response status:", response.status);

      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }

      throw new Error(errorData.message || "Failed to get profile");
    }

    const result = await response.json();
    console.log("Profile Success Response:", result);
    return result;
  } catch (error) {
    console.error("Profile service error:", error);
    throw new Error("Failed to get profile. Please try again.");
  }
}

export async function register(
  userData: RegisterRequest,
): Promise<RegisterResponse> {
  console.log("register service called with:", userData);
  console.log("Base URL:", baseUrl);
  console.log("Full URL:", `${baseUrl}/api/v1/auth/register`);

  const response = await fetch(`${baseUrl}/api/v1/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });
  console.log("Response status:", response.status);
  console.log("Response ok:", response.ok);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("API Error Response:", errorText);
    console.error("Response status:", response.status);

    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }

    throw new Error(errorData.message || "Registration failed");
  }

  return response.json();
}
