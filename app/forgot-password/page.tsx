"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Users } from "lucide-react";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/types/auth";
import { forgotPassword } from "@/services/auth.service";
import { setPasswordResetEmail } from "@/lib/password-reset-storage";

export default function ForgotPasswordPage() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    startTransition(async () => {
      try {
        const res = await forgotPassword(data.email);
        setPasswordResetEmail(data.email);
        toast.success(res.message);
        router.push("/otp-verify");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong.");
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
                Forgot password?
              </h2>
              <p className="mt-2 text-sm text-gray-600 text-left">
                Enter your email and we&apos;ll send you an OTP to reset your
                password.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    {...register("email")}
                    className={`mt-1 ${errors.email ? "border-red-500" : ""}`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full py-3 text-base bg-[#19a7e8]"
                disabled={isPending}
              >
                {isPending ? "Sending..." : "Send reset code"}
              </Button>
            </form>

            <div className="text-center text-sm">
              Remember your password?{" "}
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
