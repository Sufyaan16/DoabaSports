"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { useCloudinaryUpload } from "@/hooks/use-cloudinary-upload";

export function NewCategoryForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageHoverPreview, setImageHoverPreview] = useState<string>("");

  const { uploading: imageUploading, uploadFile } = useCloudinaryUpload();

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = await uploadFile(file);
      if (url) setImagePreview(url);
    }
  };

  const handleImageHoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = await uploadFile(file);
      if (url) setImageHoverPreview(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      // Create category data object
      const categoryData = {
        slug: formData.get("slug") as string,
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        longDescription: formData.get("longDescription") as string,
        image: imagePreview, // For now using the preview
        imageHover: imageHoverPreview || null,
      };

      // Send to API
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(categoryData),
      });

      if (!response.ok) {
        throw new Error("Failed to create category");
      }

      const newCategory = await response.json();
      setLoading(false);

      // Show success message
      const { default: Swal } = await import("sweetalert2");
      const result = await Swal.fire({
        title: "Success!",
        text: `${categoryData.name} category has been added successfully.`,
        icon: "success",
        confirmButtonText: "View Categories",
        showCancelButton: true,
        cancelButtonText: "Add Another",
      });

      if (result.isConfirmed) {
        router.push("/admin/categories");
      } else {
        // Reset form
        (e.target as HTMLFormElement).reset();
        setImagePreview("");
        setImageHoverPreview("");
      }
    } catch (error) {
      setLoading(false);
      const { default: Swal } = await import("sweetalert2");
      Swal.fire({
        title: "Error!",
        text: "Failed to create category. Please try again.",
        icon: "error",
      });
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")
      .replace(/-+/g, "");
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        {/* <CardHeader> */}
          {/* <CardTitle>Category Details</CardTitle>
          <CardDescription>
            Fill in the details below to add a new category
          </CardDescription> */}
        {/* </CardHeader> */}
        <CardContent className="space-y-6">
          {/* Category Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Category Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g., Cricket Bats"
              required
              onChange={(e) => {
                const slugInput = document.getElementById("slug") as HTMLInputElement;
                if (slugInput) {
                  slugInput.value = generateSlug(e.target.value);
                }
              }}
            />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">
              Slug <span className="text-red-500">*</span>
            </Label>
            <Input
              id="slug"
              name="slug"
              placeholder="cricketbats"
              required
              pattern="[a-z0-9]+"
              title="Only lowercase letters and numbers, no spaces or special characters"
            />
            <p className="text-sm text-muted-foreground">
              URL-friendly identifier (auto-generated from name)
            </p>
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="type">
              Type <span className="text-red-500">*</span>
            </Label>
            <Select name="type" required>
              <SelectTrigger>
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bat">Bat</SelectItem>
                <SelectItem value="bag">Bag</SelectItem>
                <SelectItem value="gear">Gear</SelectItem>
                <SelectItem value="apparel">Apparel</SelectItem>
                <SelectItem value="accessories">Accessories</SelectItem>
                <SelectItem value="protection">Protection</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Short Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Short Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Brief description for category cards..."
              rows={2}
              required
            />
          </div>

          {/* Long Description */}
          <div className="space-y-2">
            <Label htmlFor="longDescription">
              Long Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="longDescription"
              name="longDescription"
              placeholder="Detailed description for category page banner..."
              rows={4}
              required
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="image">
              Category Image (Primary) <span className="text-red-500">*</span>
            </Label>
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <Input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  required={!imagePreview}
                  disabled={imageUploading}
                  className="cursor-pointer"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  {imageUploading
                    ? "Uploading to cloud..."
                    : "Upload primary banner image (recommended: 1920x1080px)"}
                </p>
              </div>
              {imagePreview && (
                <div className="w-32 h-32 border rounded-lg overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Hover Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="imageHover">
              Category Image (Hover)
            </Label>
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <Input
                  id="imageHover"
                  name="imageHover"
                  type="file"
                  accept="image/*"
                  onChange={handleImageHoverChange}
                  disabled={imageUploading}
                  className="cursor-pointer"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  {imageUploading
                    ? "Uploading to cloud..."
                    : "Upload hover image (optional - shown when customer hovers over category card)"}
                </p>
              </div>
              {imageHoverPreview && (
                <div className="w-32 h-32 border rounded-lg overflow-hidden">
                  <img
                    src={imageHoverPreview}
                    alt="Hover Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading || imageUploading} className="flex-1">
              {loading ? "Adding Category..." : imageUploading ? "Uploading Image..." : "Add Category"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/categories")}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
