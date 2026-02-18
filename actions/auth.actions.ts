"use server";

import { register, type RegisterRequest } from "@/services/auth.service";
import { login, type LoginRequest } from "@/services/auth.service";

export async function registerUser(userData: RegisterRequest) {
  console.log("registerUser action called with:", userData);
  try {
    const result = await register(userData);
    console.log("leang", result);
    return { success: true, data: result };
  } catch (error) {
    console.error("Registration action error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Registration failed",
    };
  }
}

export async function loginUser(credentials: LoginRequest) {
  try {
    const result = await login(credentials);
    return { success: true, data: result };
  } catch (error) {
    console.error("Login action error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Login failed",
    };
  }
}
