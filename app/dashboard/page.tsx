"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/contexts/role-context";

export default function DashboardPage() {
  const router = useRouter();
  const { role } = useRole();

  useEffect(() => {
    router.replace(role === "teacher" ? "/dashboard/course/manage" : "/dashboard/course");
  }, [router, role]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent mx-auto" />
        <p className="mt-4 text-gray-600 text-sm">Loading...</p>
      </div>
    </div>
  );
}
