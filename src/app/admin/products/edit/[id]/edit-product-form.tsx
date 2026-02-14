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
import { Product } from "@/lib/data/products";
import { useCloudinaryUpload } from "@/hooks/use-cloudinary-upload";

interface EditProductFormProps {
  product: Product;
}

export function EditProductForm({ product }: EditProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>(product.image.src);
  const [imageHoverPreview, setImageHoverPreview] = useState<string>(
    product.imageHover?.src || "",
  );
  const [galleryUrls, setGalleryUrls] = useState<string[]>(
    product.gallery || [],
  );
  const [galleryUploading, setGalleryUploading] = useState<Record<number, boolean>>({});

  const { uploading: imageUploading, uploadFile } = useCloudinaryUpload();

  const addGalleryUrl = () => {
    if (galleryUrls.length < 6) {
      setGalleryUrls([...galleryUrls, ""]);
    }
  };

  const removeGalleryUrl = (index: number) => {
    setGalleryUrls(galleryUrls.filter((_, i) => i !== index));
  };

  const updateGalleryUrl = (index: number, value: string) => {
    const updated = [...galleryUrls];
    updated[index] = value;
    setGalleryUrls(updated);
  };

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

  const handleGalleryFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setGalleryUploading((prev) => ({ ...prev, [index]: true }));
      const url = await uploadFile(file);
      if (url) updateGalleryUrl(index, url);
      setGalleryUploading((prev) => ({ ...prev, [index]: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);

      // Create product data object
      const productData = {
        name: formData.get("name") as string,
        company: formData.get("company") as string,
        category: formData.get("category") as string,
        description: formData.get("description") as string,
        priceRegular: parseFloat(formData.get("price") as string),
        priceSale: formData.get("salePrice")
          ? parseFloat(formData.get("salePrice") as string)
          : null,
        priceCurrency: "USD",
        imageSrc: imagePreview,
        imageAlt: formData.get("name") as string,
        imageHoverSrc: imageHoverPreview || null,
        imageHoverAlt: imageHoverPreview
          ? `${formData.get("name")} - Alternate View`
          : null,
        badgeText: (formData.get("badgeText") as string) || null,
        badgeBackgroundColor: (formData.get("badgeColor") as string) || null,
        // Inventory Management
        sku: (formData.get("sku") as string) || null,
        stockQuantity: formData.get("stockQuantity")
          ? parseInt(formData.get("stockQuantity") as string)
          : 0,
        lowStockThreshold: formData.get("lowStockThreshold")
          ? parseInt(formData.get("lowStockThreshold") as string)
          : 10,
        trackInventory: formData.get("trackInventory") === "on",
        galleryImages: galleryUrls.filter((url) => url.trim() !== ""),
      };

      // Send to API
      const response = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error("Failed to update product");
      }

      setLoading(false);

      // Show success message
      const { default: Swal } = await import("sweetalert2");
      await Swal.fire({
        title: "Updated!",
        text: `${productData.name} has been updated successfully.`,
        icon: "success",
        confirmButtonText: "OK",
      });

      router.push("/admin/products");
    } catch (error) {
      setLoading(false);
      const { default: Swal } = await import("sweetalert2");
      Swal.fire({
        title: "Error!",
        text: "Failed to update product. Please try again.",
        icon: "error",
      });
    }
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
                <SelectItem value="cricketaccessories">
                  Cricket Accessories
                </SelectItem>
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
                placeholder="249.00 - Must be Less than Regular Price"
                defaultValue={product.price.sale || ""}
              />
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="image">Product Image (Primary)</Label>
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={imageUploading}
                    className="cursor-pointer"
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {imageUploading
                    ? "Uploading to cloud..."
                    : "Upload a new primary image to replace the current one (JPG, PNG, or WebP)"}
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
            <Label htmlFor="imageHover">Product Image (Hover)</Label>
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Input
                    id="imageHover"
                    name="imageHover"
                    type="file"
                    accept="image/*"
                    onChange={handleImageHoverChange}
                    disabled={imageUploading}
                    className="cursor-pointer"
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {imageUploading
                    ? "Uploading to cloud..."
                    : "Upload hover image (optional - shown when customer hovers over product)"}
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

          {/* Gallery Images Section */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Gallery Images</h3>
                <p className="text-sm text-muted-foreground">
                  Add up to 6 gallery images for the product card hover effect
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addGalleryUrl}
                disabled={galleryUrls.length >= 6}
              >
                + Add Image
              </Button>
            </div>

            {galleryUrls.length === 0 && (
              <p className="text-sm text-muted-foreground italic py-4 text-center border border-dashed rounded-lg">
                No gallery images added yet. Click &quot;+ Add Image&quot; to add up to 6 images.
              </p>
            )}

            {galleryUrls.map((url, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex-1 space-y-2">
                  <Label className="text-sm">
                    Gallery Image {index + 1}
                  </Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleGalleryFileChange(e, index)}
                    disabled={galleryUploading[index]}
                    className="cursor-pointer"
                  />
                  <Input
                    type="url"
                    placeholder="Or paste image URL directly"
                    value={url}
                    onChange={(e) => updateGalleryUrl(index, e.target.value)}
                    className="text-sm"
                  />
                  {galleryUploading[index] && (
                    <p className="text-xs text-muted-foreground">Uploading...</p>
                  )}
                </div>
                {url && (
                  <div className="w-16 h-16 border rounded-lg overflow-hidden shrink-0 mt-6">
                    <img
                      src={url}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-6 text-red-500 hover:text-red-700 hover:bg-red-50 px-2"
                  onClick={() => removeGalleryUrl(index)}
                >
                  ✕
                </Button>
              </div>
            ))}
          </div>

          {/* Inventory Management Section */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-semibold">Inventory Management</h3>

            {/* SKU */}
            <div className="space-y-2">
              <Label htmlFor="sku">SKU (Stock Keeping Unit)</Label>
              <Input
                id="sku"
                name="sku"
                placeholder="e.g., BAT-001-BLU"
                defaultValue={product.sku || ""}
                maxLength={100}
              />
              <p className="text-sm text-muted-foreground">
                Unique identifier for this product (optional)
              </p>
            </div>

            {/* Stock Quantity */}
            <div className="space-y-2">
              <Label htmlFor="stockQuantity">
                Stock Quantity <span className="text-red-500">*</span>
              </Label>
              <Input
                id="stockQuantity"
                name="stockQuantity"
                type="number"
                min="0"
                placeholder="0"
                defaultValue={product.stockQuantity || 0}
                required
              />
              <p className="text-sm text-muted-foreground">
                Current number of units in stock
              </p>
            </div>

            {/* Low Stock Threshold */}
            <div className="space-y-2">
              <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
              <Input
                id="lowStockThreshold"
                name="lowStockThreshold"
                type="number"
                min="0"
                placeholder="10"
                defaultValue={product.lowStockThreshold || 10}
              />
              <p className="text-sm text-muted-foreground">
                Get notified when stock falls below this number
              </p>
            </div>

            {/* Track Inventory Checkbox */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="trackInventory"
                name="trackInventory"
                defaultChecked={product.trackInventory !== false}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label
                htmlFor="trackInventory"
                className="font-normal cursor-pointer"
              >
                Track inventory for this product
              </Label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading || imageUploading} className="flex-1">
              {loading ? "Updating Product..." : imageUploading ? "Uploading Image..." : "Update Product"}
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
