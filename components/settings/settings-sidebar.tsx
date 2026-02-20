"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Share2, User, BookOpen, Users, Camera, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import {
  AvatarCropDialog,
  getStoredAvatar,
} from "./avatar-crop-dialog";

const navItems = [
  { label: "Profile", href: "/dashboard/settings", icon: User },
  { label: "My Courses", href: "/dashboard/settings/my-courses", icon: BookOpen },
  { label: "Teachers", href: "/dashboard/teachers", icon: Users },
];

export function SettingsSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const userName = session?.user?.name || "John Doe";
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const profileLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/profile/${encodeURIComponent(session?.user?.email || userName?.replace(/\s+/g, "-").toLowerCase() || "user")}`
      : "";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileLink);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

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
          <Button
            variant="outline"
            size="sm"
            className="mt-2 w-full"
            onClick={() => setIsShareDialogOpen(true)}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Profile
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

    <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Profile</DialogTitle>
          <DialogDescription>
            Share your profile link with others. They can use this link to view
            your profile.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 mt-4">
          <Input
            readOnly
            value={profileLink}
            className="flex-1 font-mono text-sm"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleCopyLink}
            className="shrink-0"
            aria-label="Copy link"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Click the copy button to copy the link to your clipboard.
        </p>
      </DialogContent>
    </Dialog>
    </>
  );
}
