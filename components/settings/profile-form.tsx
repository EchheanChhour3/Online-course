"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
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

export function ProfileForm() {
  const router = useRouter();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    headline: "",
    description: "",
    language: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUploadImage = () => {
    document.getElementById("profile-image-input")?.click();
  };

  const handleSaveImage = () => {
    // TODO: Implement save image to server
    console.log("Save image");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement save profile
    console.log("Save profile", formData);
  };

  return (
    <div className="flex-1 min-w-0">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <button
          onClick={() => router.back()}
          className="p-1 rounded hover:bg-gray-100"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span>Profile</span>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">Profile</span>
      </nav>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="Label"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Label"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                className="h-11"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="headline">Headline</Label>
              <Input
                id="headline"
                placeholder="Label"
                value={formData.headline}
                onChange={(e) => handleInputChange("headline", e.target.value)}
                className="h-11"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Label"
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
                value={formData.language}
                onValueChange={(value) => handleInputChange("language", value)}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Label" />
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
        </div>

        {/* Image Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Image Preview
          </h3>
          <div className="aspect-[3/2] max-w-[300px] bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden mb-6">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Profile preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageIcon className="w-16 h-16 text-gray-300" />
            )}
          </div>

          <h4 className="text-base font-medium text-gray-900 mb-3">
            Add/Change Image
          </h4>
          <div className="flex flex-wrap items-center gap-3">
            <input
              id="profile-image-input"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <Input
              placeholder="Label"
              readOnly
              value={fileName}
              className="h-11 flex-1 min-w-[200px]"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleUploadImage}
              className="h-11"
            >
              Upload Image
            </Button>
          </div>
          <Button
            type="button"
            onClick={handleSaveImage}
            className="mt-4 bg-gray-900 hover:bg-gray-800 text-white h-11 px-6"
          >
            Save Image
          </Button>
        </div>
      </form>
    </div>
  );
}
