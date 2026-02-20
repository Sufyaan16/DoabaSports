"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCart } from "@/contexts/cart-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Truck, Shield, RotateCcw } from "lucide-react";
import type { Product } from "@/lib/data/products";
import { formatCurrency } from "@/lib/format";

interface ProductDetailClientProps {
  product: Product;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(product.image);

  // Build image list: main + gallery images
  const images: { src: string; alt: string }[] = [
    product.image,
    ...(product.gallery && product.gallery.length > 0
      ? product.gallery.map((src, i) => ({
          src,
          alt: `${product.name} - View ${i + 2}`,
        }))
      : []),
  ];

  const handleAddToCart = async () => {
    addToCart(product);
    
    const { default: Swal } = await import("sweetalert2");
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Added to cart!",
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    });
  };

  const handleBuyNow = () => {
    addToCart(product);
    router.push("/checkout");
  };

  const displayPrice = product.price.sale || product.price.regular;
  const hasDiscount = !!product.price.sale;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 md:px-8 lg:px-20 py-8 md:py-16">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
              <Image
                src={selectedImage.src}
                alt={selectedImage.alt}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
              {product.badge && (
                <Badge
                  className="absolute top-4 right-4 text-white border-0"
                  style={{ backgroundColor: product.badge.backgroundColor }}
                >
                  {product.badge.text}
                </Badge>
              )}
            </div>

            {/* Image Thumbnails */}
            {images.length > 1 && (
              <div className={`grid gap-3 ${
                images.length <= 3 ? "grid-cols-3" : 
                images.length <= 4 ? "grid-cols-4" : 
                "grid-cols-3 sm:grid-cols-6"
              }`}>
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(img)}
                    className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                      selectedImage.src === img.src
                        ? "border-primary"
                        : "border-muted hover:border-primary/50"
                    }`}
                  >
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      sizes="200px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col space-y-6">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">
                {product.company}
              </p>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {product.name}
              </h1>
              
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-4xl font-bold">
                  {formatCurrency(displayPrice, product.price.currency)}
                </span>
                {hasDiscount && (
                  <span className="text-2xl text-muted-foreground line-through">
                    {formatCurrency(product.price.regular, product.price.currency)}
                  </span>
                )}
              </div>

              {hasDiscount && (
                <Badge variant="destructive" className="mb-4">
                  Save {formatCurrency(product.price.regular - displayPrice, product.price.currency)}
                </Badge>
              )}
            </div>

            <Separator />

            <div>
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            <Separator />

            {/* Quantity Selector */}
            <div>
              <label className="text-sm font-medium mb-2 block">Quantity</label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </Button>
                <span className="text-xl font-semibold w-12 text-center">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                className="flex-1"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="flex-1"
                onClick={handleBuyNow}
              >
                Proceed to Checkout
              </Button>
            </div>

            {/* Features */}
            <Card className="p-6 mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <Truck className="h-5 w-5 text-primary mt-1 shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Free Shipping</p>
                    <p className="text-xs text-muted-foreground">On orders over $100</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary mt-1 shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Warranty</p>
                    <p className="text-xs text-muted-foreground">1 year warranty</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <RotateCcw className="h-5 w-5 text-primary mt-1 shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Easy Returns</p>
                    <p className="text-xs text-muted-foreground">30-day return policy</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
