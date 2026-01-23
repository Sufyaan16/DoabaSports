"use client";

import { useState, useEffect } from "react";
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
import { Product } from "@/lib/data/products";

interface EditProductFormProps {
  product: Product;
}

export function EditProductForm({ product }: EditProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>(product.image.src);

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
    const productData = {
      id: product.id,
      name: formData.get("name"),
      company: formData.get("company"),
      category: formData.get("category"),
      description: formData.get("description"),
      price: formData.get("price"),
      salePrice: formData.get("salePrice"),
      image: formData.get("image"),
    };

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setLoading(false);

    // Show success message
    await Swal.fire({
      title: "Updated!",
      text: `${productData.name} has been updated successfully.`,
      icon: "success",
      confirmButtonText: "OK",
    });

    router.push("/admin/products");
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        {/* <CardHeader>
          <CardTitle>Edit Product</CardTitle>
          <CardDescription>
            Update the product details below
          </CardDescription>
        </CardHeader> */}
        <CardContent className="space-y-6">
          {/* Product Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Product Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g., Legend Pro Elite"
              defaultValue={product.name}
              required
            />
          </div>

          {/* Company/Brand */}
          <div className="space-y-2">
            <Label htmlFor="company">
              Company/Brand <span className="text-red-500">*</span>
            </Label>
            <Input
              id="company"
              name="company"
              placeholder="e.g., Ihsan"
              defaultValue={product.company}
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">
              Category <span className="text-red-500">*</span>
            </Label>
            <Select name="category" defaultValue={product.category} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cricketbats">Cricket Bats</SelectItem>
                <SelectItem value="cricketgear">Sports Apparel</SelectItem>
                <SelectItem value="cricketaccessories">Cricket Accessories</SelectItem>
                <SelectItem value="cricketgloves">Protection Gears</SelectItem>
                <SelectItem value="tapballbats">Tape Ball Bats</SelectItem>
                <SelectItem value="cricketbags">Cricket Bags</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe the product features and benefits..."
              rows={4}
              defaultValue={product.description}
              required
            />
          </div>

          {/* Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">
                Regular Price ($) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                placeholder="299.00"
                defaultValue={product.price.regular}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salePrice">Sale Price ($)</Label>
              <Input
                id="salePrice"
                name="salePrice"
                type="number"
                step="0.01"
                placeholder="249.00 (optional)"
                defaultValue={product.price.sale || ""}
              />
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="image">Product Image</Label>
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="cursor-pointer"
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Upload a new image to replace the current one (JPG, PNG, or WebP)
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
              {loading ? "Updating Product..." : "Update Product"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/products")}
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
