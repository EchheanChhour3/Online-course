"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { User, BookOpen, Camera } from "lucide-react";
import { useRole } from "@/contexts/role-context";
import { AvatarCropDialog, getStoredAvatar } from "./avatar-crop-dialog";

export function SettingsSidebar() {
  const pathname = usePathname();
  const { role } = useRole();

  const navItems = [
    { label: "Profile", href: "/dashboard/settings", icon: User },
    ...(role === "teacher"
      ? [{ label: "My Courses", href: "/dashboard/settings/my-courses", icon: BookOpen }]
      : []),
  ];
  const router = useRouter();
  const { data: session } = useSession();
  const userName = session?.user?.name || "John Doe";
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);

  useEffect(() => {
    setAvatarUrl(getStoredAvatar());
  }, [isAvatarDialogOpen]);

  const handleAvatarSave = (croppedDataUrl: string) => {
    setAvatarUrl(croppedDataUrl);
    setIsAvatarDialogOpen(false);
  };

  return (
    <>
    <aside className="w-72 shrink-0 pr-8">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col items-center mb-6">
          <button
            type="button"
            onClick={() => setIsAvatarDialogOpen(true)}
            className="relative group mb-3"
            aria-label="Change profile photo"
          >
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden ring-2 ring-transparent group-hover:ring-gray-300 transition-all">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={userName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-gray-500">
                  {userName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="h-8 w-8 text-white" />
            </div>
          </button>
          <h2 className="font-bold text-gray-900 text-lg">{userName}</h2>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 w-full"
            onClick={() => setIsAvatarDialogOpen(true)}
          >
            <Camera className="w-4 h-4 mr-2" />
            Change Profile
          </Button>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>

    <AvatarCropDialog
      open={isAvatarDialogOpen}
      onOpenChange={setIsAvatarDialogOpen}
      currentAvatar={avatarUrl}
      onSave={handleAvatarSave}
    />
    </>
  );
}
