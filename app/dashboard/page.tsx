"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false });
      toast.success("Signed out successfully!");
      router.push("/login");
    } catch (error) {
      toast.error("Error signing out. Please try again.");
    }
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button onClick={handleSignOut} variant="outline">
            Sign out
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Welcome back!</h2>
          <div className="space-y-2">
            <p>
              <strong>Name:</strong> {session.user?.name || "User"}
            </p>
            <p>
              <strong>Email:</strong> {session.user?.email}
            </p>
            <p>
              <strong>User ID:</strong> {session.user?.id}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
