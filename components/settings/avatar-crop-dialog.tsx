"use client";

import { useState, useCallback, useRef } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getCroppedImg } from "@/lib/crop-image";
import { Upload, Loader2 } from "lucide-react";

const AVATAR_STORAGE_KEY = "profile-avatar";

export function getStoredAvatar(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AVATAR_STORAGE_KEY);
}

export function setStoredAvatar(dataUrl: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(AVATAR_STORAGE_KEY, dataUrl);
}

interface AvatarCropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentAvatar: string | null;
  onSave: (croppedDataUrl: string) => void;
}

export function AvatarCropDialog({
  open,
  onOpenChange,
  currentAvatar,
  onSave,
}: AvatarCropDialogProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = useCallback(() => {
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setPreviewUrl(null);
  }, []);

  const handleClose = useCallback(
    (open: boolean) => {
      if (!open) {
        resetState();
      }
      onOpenChange(open);
    },
    [onOpenChange, resetState],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.addEventListener("load", () => {
          setImageSrc(reader.result as string);
          setPreviewUrl(null);
        });
        reader.readAsDataURL(file);
      }
      e.target.value = "";
    },
    [],
  );

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const generatePreview = useCallback(async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setIsCropping(true);
    try {
      const cropped = await getCroppedImg(imageSrc, croppedAreaPixels);
      setPreviewUrl(cropped);
    } finally {
      setIsCropping(false);
    }
  }, [imageSrc, croppedAreaPixels]);

  const handleSave = useCallback(async () => {
    if (!previewUrl) {
      if (imageSrc && croppedAreaPixels) {
        setIsSaving(true);
        try {
          const cropped = await getCroppedImg(imageSrc, croppedAreaPixels);
          setStoredAvatar(cropped);
          onSave(cropped);
          handleClose(false);
        } finally {
          setIsSaving(false);
        }
      }
      return;
    }
    setIsSaving(true);
    try {
      setStoredAvatar(previewUrl);
      onSave(previewUrl);
      handleClose(false);
    } finally {
      setIsSaving(false);
    }
  }, [previewUrl, imageSrc, croppedAreaPixels, onSave, handleClose]);

  const handleBackToCrop = useCallback(() => {
    setPreviewUrl(null);
  }, []);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg p-0 overflow-hidden gap-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Change Profile Photo</DialogTitle>
          <DialogDescription>
            Upload a photo and crop it to use as your avatar.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-4">
          {!imageSrc ? (
            <div
              className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-16 cursor-pointer hover:border-gray-300 hover:bg-gray-50/80 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <Upload className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-sm font-medium text-gray-600">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, GIF up to 10MB
              </p>
            </div>
          ) : !previewUrl ? (
            <>
              <div className="relative h-[280px] w-full rounded-lg overflow-hidden bg-gray-100">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                  style={{
                    containerStyle: { borderRadius: "8px" },
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Zoom</Label>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-200 accent-gray-900"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setImageSrc(null)}
                  className="flex-1"
                >
                  Choose Different
                </Button>
                <Button
                  type="button"
                  onClick={generatePreview}
                  disabled={isCropping}
                  className="flex-1 bg-gray-900 hover:bg-gray-800"
                >
                  {isCropping ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Preview"
                  )}
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col items-center">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Preview
                </p>
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 shadow-lg">
                  <img
                    src={previewUrl}
                    alt="Avatar preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBackToCrop}
                  className="flex-1"
                >
                  Back to Crop
                </Button>
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 bg-gray-900 hover:bg-gray-800"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Save Photo"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        {imageSrc && !previewUrl && (
          <DialogFooter className="p-6 pt-0">
            <Button variant="ghost" onClick={() => handleClose(false)}>
              Cancel
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
