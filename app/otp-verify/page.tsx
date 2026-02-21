"use client";

import { useRef, useTransition, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Users } from "lucide-react";
import { verifyOtp } from "@/services/auth.service";
import {
  getPasswordResetEmail,
  setPasswordResetToken,
} from "@/lib/password-reset-storage";

const OTP_LENGTH = 6;

export default function OtpVerifyPage() {
  const [isPending, startTransition] = useTransition();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  useEffect(() => {
    const stored = getPasswordResetEmail();
    if (!stored) {
      toast.error("Session expired. Please start from forgot password.");
      router.replace("/forgot-password");
    } else {
      setEmail(stored);
    }
  }, [router]);

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p className="text-gray-500">Redirecting...</p>
      </div>
    );
  }

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const digits = value.replace(/\D/g, "").slice(0, OTP_LENGTH).split("");
      const newOtp = [...otp];
      digits.forEach((digit, i) => {
        if (index + i < OTP_LENGTH) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + digits.length, OTP_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length !== OTP_LENGTH) {
      setError("Please enter all 6 digits");
      return;
    }
    if (!email) {
      setError("Session expired. Please start from forgot password.");
      return;
    }

    startTransition(async () => {
      try {
        const resetToken = await verifyOtp(email, otpValue);
        setPasswordResetToken(resetToken);
        toast.success("OTP verified successfully!");
        router.push("/change-password");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Invalid OTP. Please try again.");
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-6xl h-[80vh] rounded-2xl shadow-2xl overflow-hidden flex">
        {/* Left Column - Blue Background */}
        <div className="hidden lg:flex lg:w-1/2 bg-[#19a7e8] flex-col justify-center px-12">
          <div className="text-white space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold leading-tight">
                Empowering Education, One Student at a Time
              </h1>
              <p className="text-xl text-blue-100">
                Join thousands of students and educators in our collaborative
                learning platform.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-white/20 p-3 rounded-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    Interactive Learning
                  </h3>
                  <p className="text-blue-100">Engage with dynamic content</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-white/20 p-3 rounded-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Collaborative</h3>
                  <p className="text-blue-100">Connect with peers & teachers</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - White Background */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 text-left">
                Verify OTP
              </h2>
              <p className="mt-2 text-sm text-gray-600 text-left">
                Enter the verification code we sent to your email.
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-3">
                    Verification code
                  </Label>
                  <div className="flex gap-2 justify-center">
                    {otp.map((digit, index) => (
                      <Input
                        key={index}
                        ref={(el) => {
                          inputRefs.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className={`w-12 h-14 text-center text-lg font-semibold ${error ? "border-red-500" : ""}`}
                      />
                    ))}
                  </div>
                  {error && (
                    <p className="mt-2 text-sm text-red-600 text-center">
                      {error}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full py-3 text-base bg-[#19a7e8]"
                disabled={isPending}
              >
                {isPending ? "Verifying..." : "Verify code"}
              </Button>
            </form>

            <div className="text-center text-sm">
              Didn&apos;t receive the code?{" "}
              <Link
                href="/forgot-password"
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Resend
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
