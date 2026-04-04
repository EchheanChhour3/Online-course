import { describe, expect, it } from "vitest";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  otpVerifySchema,
  changePasswordSchema,
} from "@/types/auth";

describe("auth Zod schemas (frontend validation)", () => {
  describe("loginSchema", () => {
    it("positive: valid email and password", () => {
      const r = loginSchema.safeParse({
        email: "user@example.com",
        password: "123456",
        rememberMe: true,
      });
      expect(r.success).toBe(true);
    });

    it("negative: invalid email", () => {
      const r = loginSchema.safeParse({
        email: "not-an-email",
        password: "123456",
      });
      expect(r.success).toBe(false);
    });

    it("negative: password too short", () => {
      const r = loginSchema.safeParse({
        email: "u@e.com",
        password: "12345",
      });
      expect(r.success).toBe(false);
    });
  });

  describe("registerSchema", () => {
    it("positive: matching passwords and long name", () => {
      const r = registerSchema.safeParse({
        full_name: "John Doe",
        email: "j@e.com",
        password: "secret12",
        confirmPassword: "secret12",
      });
      expect(r.success).toBe(true);
    });

    it("negative: name too short", () => {
      const r = registerSchema.safeParse({
        full_name: "AB",
        email: "j@e.com",
        password: "secret12",
        confirmPassword: "secret12",
      });
      expect(r.success).toBe(false);
    });

    it("negative: password mismatch", () => {
      const r = registerSchema.safeParse({
        full_name: "John Doe",
        email: "j@e.com",
        password: "secret12",
        confirmPassword: "otherpwd",
      });
      expect(r.success).toBe(false);
    });
  });

  describe("forgotPasswordSchema", () => {
    it("positive: valid email", () => {
      expect(
        forgotPasswordSchema.safeParse({ email: "a@b.co" }).success
      ).toBe(true);
    });
    it("negative: invalid email", () => {
      expect(forgotPasswordSchema.safeParse({ email: "x" }).success).toBe(
        false
      );
    });
  });

  describe("otpVerifySchema", () => {
    it("positive: 6 digits", () => {
      expect(otpVerifySchema.safeParse({ otp: "123456" }).success).toBe(true);
    });
    it("negative: wrong length", () => {
      expect(otpVerifySchema.safeParse({ otp: "12345" }).success).toBe(false);
    });
  });

  describe("changePasswordSchema", () => {
    it("positive", () => {
      expect(
        changePasswordSchema.safeParse({
          password: "abcdef",
          confirmPassword: "abcdef",
        }).success
      ).toBe(true);
    });
    it("negative: mismatch", () => {
      expect(
        changePasswordSchema.safeParse({
          password: "abcdef",
          confirmPassword: "abcdeg",
        }).success
      ).toBe(false);
    });
  });
});
