"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  name: string;
  onNameChange: (name: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  error: string | null;
  onErrorClear: () => void;
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  mode,
  name,
  onNameChange,
  onSubmit,
  submitting,
  error,
  onErrorClear,
}: CategoryFormDialogProps) {
  const isCreate = mode === "create";

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) onErrorClear();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isCreate ? "Add Category" : "Edit Category"}</DialogTitle>
          <DialogDescription>
            {isCreate
              ? "Create a new category to organize your courses."
              : "Update the category name."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="space-y-2">
            <Label htmlFor={`category-name-${mode}`}>Name</Label>
            <Input
              id={`category-name-${mode}`}
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="e.g. Programming"
              required
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (isCreate ? "Creating..." : "Saving...") : isCreate ? "Create" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
