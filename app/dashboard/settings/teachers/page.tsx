"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TeachersSettingsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/teachers");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <p className="text-gray-500">Redirecting to Teachers...</p>
    </div>
  );
}
