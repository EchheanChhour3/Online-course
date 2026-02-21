"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { MyCoursesContent } from "@/components/settings";
import { useRole } from "@/contexts/role-context";

export default function MyCoursesSettingsPage() {
  const router = useRouter();
  const { role } = useRole();

  useEffect(() => {
    if (role !== "teacher") {
      router.replace("/dashboard/settings");
    }
  }, [role, router]);

  if (role !== "teacher") {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-gray-500">Redirecting...</p>
      </div>
    );
  }

  return <MyCoursesContent />;
}
