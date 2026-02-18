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

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Login failed");
    }

    return response.json();
  } catch (error) {
    console.error("Login service error:", error);
    throw new Error("Login failed. Please try again.");
  }
}

export async function register(
  userData: RegisterRequest,
): Promise<RegisterResponse> {
  console.log("register service called with:", userData);

  const response = await fetch(`${baseUrl}/api/v1/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });
  console.log(response);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Registration failed");
  }

  return response.json();
}
