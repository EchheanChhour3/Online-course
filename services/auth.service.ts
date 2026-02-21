"use server";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserInfo {
  additionalProp1: Record<string, unknown>;
  additionalProp2: Record<string, unknown>;
  additionalProp3: Record<string, unknown>;
}

export interface User {
  user_id: number;
  full_name: string;
  status: string;
  email: string;
  role: string[];
  user_info?: {
    userInfo?: Record<string, unknown>;
    headline?: string;
    description?: string;
    language?: string;
  };
}

export interface UpdateProfileRequest {
  full_name?: string;
  user_info?: {
    headline?: string;
    description?: string;
    language?: string;
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
    additionalProp1: Record<string, unknown>;
    additionalProp2: Record<string, unknown>;
    additionalProp3: Record<string, unknown>;
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
        additionalProp1: Record<string, unknown>;
        additionalProp2: Record<string, unknown>;
        additionalProp3: Record<string, unknown>;
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

export interface ForgotPasswordResponse {
  message: string;
  status: string;
  payload?: { message: string; otp?: string };
}

export interface VerifyOtpResponse {
  message: string;
  status: string;
  payload?: { reset_token: string };
}

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9091";

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  try {
    const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let msg = "Login failed";
      try {
        const err = JSON.parse(errorText) as { errors?: { errorMessage?: string }; message?: string };
        msg = err?.errors?.errorMessage ?? err?.message ?? msg;
      } catch {
        if (errorText?.trim()) msg = errorText.trim();
      }
      throw new Error(msg);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Login failed. Please try again.");
  }
}

export async function getProfile(
  accessToken: string,
): Promise<ProfileResponse> {
  try {
    const response = await fetch(`${baseUrl}/api/v1/auth/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();

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

export async function updateProfile(
  accessToken: string,
  data: UpdateProfileRequest
): Promise<ProfileResponse> {
  const response = await fetch(`${baseUrl}/api/v1/auth/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (!response.ok) {
    const r = result as Record<string, unknown>;
    const err = r?.errors as Record<string, unknown> | undefined;
    const msg = err?.errorMessage ?? (r?.message as string) ?? "Failed to update profile";
    throw new Error(typeof msg === "string" ? msg : "Failed to update profile");
  }

  return result;
}

function parseApiError(result: unknown): string {
  const r = result as Record<string, unknown>;
  const err = r?.errors as Record<string, unknown> | undefined;
  if (err?.errorMessage && typeof err.errorMessage === "string")
    return err.errorMessage;
  if (r?.payload && typeof (r.payload as Record<string, unknown>)?.message === "string")
    return (r.payload as Record<string, unknown>).message as string;
  if (typeof r?.message === "string") return r.message;
  return "Request failed";
}

export async function forgotPassword(email: string): Promise<{ message: string; otp?: string }> {
  const response = await fetch(`${baseUrl}/api/v1/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim() }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(parseApiError(result));
  const payload = result.payload;
  return {
    message: payload?.message ?? result.message ?? "Request processed",
    otp: payload?.otp,
  };
}

export async function verifyOtp(email: string, otp: string): Promise<string> {
  const response = await fetch(`${baseUrl}/api/v1/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim(), otp: otp.trim() }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(parseApiError(result));
  const resetToken = result.payload?.reset_token;
  if (!resetToken) throw new Error("No reset token received");
  return resetToken;
}

export async function resetPassword(resetToken: string, newPassword: string): Promise<void> {
  const response = await fetch(`${baseUrl}/api/v1/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reset_token: resetToken, new_password: newPassword }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(parseApiError(result));
}

export async function googleAuth(idToken: string): Promise<LoginResponse> {
  const response = await fetch(`${baseUrl}/api/v1/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_token: idToken }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(parseApiError(result));
  return result;
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
