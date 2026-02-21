"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getProfile, updateProfile } from "@/services/auth.service";
import { toast } from "sonner";

function parseName(fullName?: string): { first: string; last: string } {
  if (!fullName?.trim()) return { first: "", last: "" };
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { first: parts[0], last: "" };
  const first = parts[0];
  const last = parts.slice(1).join(" ");
  return { first, last };
}

export function ProfileForm() {
  const { data: session, status, update: updateSession } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    headline: "",
    description: "",
    language: "",
  });

  const fetchProfile = useCallback(async () => {
    const token = session?.accessToken;
    if (!token || status !== "authenticated") {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await getProfile(token);
      const payload = res.payload;
      const { first, last } = parseName(payload?.full_name);
      const userInfo = payload?.user_info as Record<string, unknown> | undefined;
      const inner = (userInfo?.userInfo ?? userInfo) as Record<string, unknown> | undefined;
      setFormData({
        firstName: first,
        lastName: last,
        headline: (inner?.headline as string) ?? "",
        description: (inner?.description as string) ?? "",
        language: (inner?.language as string) ?? "",
      });
    } catch {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, status]);

  useEffect(() => {
    if (status === "loading") return;
    fetchProfile();
  }, [fetchProfile, status]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = session?.accessToken;
    if (!token) {
      toast.error("Please sign in to update profile.");
      return;
    }
    const fullName = [formData.firstName, formData.lastName].filter(Boolean).join(" ").trim();
    if (!fullName || fullName.length < 5) {
      toast.error("Full name must be at least 5 characters.");
      return;
    }

    setSaving(true);
    try {
      const res = await updateProfile(token, {
        full_name: fullName,
        user_info: {
          headline: formData.headline.trim() || undefined,
          description: formData.description.trim() || undefined,
          language: formData.language || undefined,
        },
      });
      toast.success("Profile updated successfully");
      const payload = res?.payload ?? res;
      if (payload?.full_name) {
        await updateSession?.({ name: payload.full_name });
      }
      fetchProfile();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-center py-16">
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <button
          onClick={() => history.back()}
          className="p-1 rounded hover:bg-gray-100"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span>Profile</span>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">Profile</span>
      </nav>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="First name"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Last name"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                className="h-11"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="headline">Headline</Label>
              <Input
                id="headline"
                placeholder="e.g. UI/UX Designer"
                value={formData.headline}
                onChange={(e) => handleInputChange("headline", e.target.value)}
                className="h-11"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description (Instructor Bio)</Label>
              <Textarea
                id="description"
                placeholder="Tell students about yourself. This appears on your course pages."
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                className="min-h-[120px] resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select
                value={formData.language || "en"}
                onValueChange={(value) => handleInputChange("language", value)}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="km">Khmer</SelectItem>
                  <SelectItem value="zh">Chinese</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t">
            <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
              {saving ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
