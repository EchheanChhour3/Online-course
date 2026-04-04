import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  login,
  getProfile,
  forgotPassword,
  verifyOtp,
  resetPassword,
} from "@/services/auth.service";
import { VALID_LOGIN_BODY } from "@/tests/mocks/bulk-data";
import { createMockResponse } from "@/tests/helpers/mock-fetch";

describe("auth.service (API client)", () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, "fetch");
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it("positive: login returns LoginResponse", async () => {
    fetchSpy.mockResolvedValue(createMockResponse(true, 200, VALID_LOGIN_BODY));
    const res = await login({ email: "a@b.com", password: "secret12" });
    expect(res.payload.accessToken).toBe("mock-access-token");
    expect(res.payload.user.email).toContain("@");
  });

  it("negative: login surfaces errors.errorMessage", async () => {
    fetchSpy.mockResolvedValue(
      createMockResponse(false, 401, {
        errors: { errorMessage: "Bad credentials" },
      })
    );
    await expect(
      login({ email: "x@y.com", password: "wrongpwd" })
    ).rejects.toThrow("Bad credentials");
  });

  it("negative: login uses top-level message when present", async () => {
    fetchSpy.mockResolvedValue(
      createMockResponse(false, 400, { message: "Account locked" })
    );
    await expect(
      login({ email: "a@b.com", password: "secret12" })
    ).rejects.toThrow("Account locked");
  });

  it("positive: getProfile returns ProfileResponse", async () => {
    fetchSpy.mockResolvedValue(
      createMockResponse(true, 200, {
        message: "OK",
        status: "OK",
        requested_time: "",
        payload: VALID_LOGIN_BODY.payload.user,
      })
    );
    const res = await getProfile("tok");
    expect(res.payload.email).toBeDefined();
  });

  it("negative: getProfile wraps HTTP errors in generic message", async () => {
    fetchSpy.mockResolvedValue(
      createMockResponse(false, 401, { message: "Unauthorized" })
    );
    await expect(getProfile("bad")).rejects.toThrow(
      "Failed to get profile. Please try again."
    );
  });

  it("positive: forgotPassword returns message from payload", async () => {
    fetchSpy.mockResolvedValue(
      createMockResponse(true, 200, {
        message: "OK",
        payload: { message: "OTP sent" },
      })
    );
    const out = await forgotPassword(" user@test.com ");
    expect(out.message).toBe("OTP sent");
    const init = fetchSpy.mock.calls[0][1] as RequestInit;
    expect(JSON.parse(String(init.body))).toEqual({ email: "user@test.com" });
  });

  it("negative: forgotPassword throws parseApiError", async () => {
    fetchSpy.mockResolvedValue(
      createMockResponse(false, 400, {
        errors: { errorMessage: "Invalid email" },
      })
    );
    await expect(forgotPassword("bad")).rejects.toThrow("Invalid email");
  });

  it("positive: verifyOtp returns reset_token", async () => {
    fetchSpy.mockResolvedValue(
      createMockResponse(true, 200, {
        payload: { reset_token: "tok-123" },
      })
    );
    const token = await verifyOtp("a@b.com", "123456");
    expect(token).toBe("tok-123");
  });

  it("negative: verifyOtp missing token", async () => {
    fetchSpy.mockResolvedValue(
      createMockResponse(true, 200, { payload: {} })
    );
    await expect(verifyOtp("a@b.com", "123456")).rejects.toThrow(
      "No reset token received"
    );
  });

  it("positive: resetPassword succeeds on OK", async () => {
    fetchSpy.mockResolvedValue(createMockResponse(true, 200, { status: "OK" }));
    await expect(
      resetPassword("tok", "newpassword12")
    ).resolves.toBeUndefined();
  });

  it("negative: resetPassword throws on error body", async () => {
    fetchSpy.mockResolvedValue(
      createMockResponse(false, 400, {
        errors: { errorMessage: "Weak password" },
      })
    );
    await expect(resetPassword("tok", "123")).rejects.toThrow("Weak password");
  });
});
