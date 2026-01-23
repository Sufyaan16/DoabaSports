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
import Swal from "sweetalert2";
import { CategoryInfo } from "@/lib/data/categories";

interface EditCategoryFormProps {
  category: CategoryInfo;
}

export function EditCategoryForm({ category }: EditCategoryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>(category.image);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const categoryData = {
      name: formData.get("name"),
      slug: category.slug, // Slug shouldn't change on edit
      type: formData.get("type"),
      description: formData.get("description"),
      longDescription: formData.get("longDescription"),
      image: formData.get("image"),
    };

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setLoading(false);

    // Show success message
    await Swal.fire({
      title: "Updated!",
      text: `${categoryData.name} has been updated successfully.`,
      icon: "success",
      confirmButtonText: "OK",
    });

    router.push("/admin/categories");
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        {/* <CardHeader>
          <CardTitle>Edit Category</CardTitle>
          <CardDescription>
            Update the category details below
          </CardDescription>
        </CardHeader> */}
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
              defaultValue={category.name}
              required
            />
          </div>

          {/* Slug (Read-only) */}
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              name="slug"
              value={category.slug}
              disabled
              className="bg-muted"
            />
            <p className="text-sm text-muted-foreground">
              Slug cannot be changed after creation
            </p>
          </div>

          {/* Type - We'll infer from category data or use a default */}
          <div className="space-y-2">
            <Label htmlFor="type">
              Type <span className="text-red-500">*</span>
            </Label>
            <Select name="type" defaultValue="bat" required>
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
              defaultValue={category.description}
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
              defaultValue={category.longDescription}
              required
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="image">Category Image</Label>
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <Input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="cursor-pointer"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Upload a new banner image to replace the current one
                  (recommended: 1920x1080px)
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

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Updating Category..." : "Update Category"}
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
