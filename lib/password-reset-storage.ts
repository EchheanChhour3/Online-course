"use client";

const PASSWORD_RESET_EMAIL_KEY = "password_reset_email";
const PASSWORD_RESET_TOKEN_KEY = "password_reset_token";

export function getPasswordResetEmail(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(PASSWORD_RESET_EMAIL_KEY);
}

export function setPasswordResetEmail(email: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(PASSWORD_RESET_EMAIL_KEY, email);
}

export function clearPasswordResetData(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(PASSWORD_RESET_EMAIL_KEY);
  sessionStorage.removeItem(PASSWORD_RESET_TOKEN_KEY);
}

export function getPasswordResetToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(PASSWORD_RESET_TOKEN_KEY);
}

export function setPasswordResetToken(token: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(PASSWORD_RESET_TOKEN_KEY, token);
}
