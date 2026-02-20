"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Price, PriceValue } from "@/components/price";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Product } from "@/lib/data/products";
import { useCart } from "@/contexts/cart-context";
import { ShoppingCart } from "lucide-react";
import { StockBadge } from "@/components/stock-badge";
import { WishlistButton } from "@/components/wishlist-button";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const isOutOfStock = product.trackInventory && (product.stockQuantity || 0) === 0;

  // Build the full image list: main image + gallery images (max 6 total)
  const allImages = useMemo(() => {
    const images = [product.image.src];
    if (product.gallery && product.gallery.length > 0) {
      images.push(...product.gallery.slice(0, 5)); // main + 5 gallery = 6 max
    }
    return images;
  }, [product.image.src, product.gallery]);

  const hasMultipleImages = allImages.length > 1;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!hasMultipleImages || !imageContainerRef.current) return;
      const rect = imageContainerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      const index = Math.min(
        Math.floor(percentage * allImages.length),
        allImages.length - 1
      );
      setActiveIndex(index);
    },
    [hasMultipleImages, allImages.length]
  );

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setActiveIndex(0);
  }, []);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const { default: Swal } = await import("sweetalert2");
    
    if (isOutOfStock) {
      Swal.fire({
        title: "Out of Stock",
        text: "Sorry, this product is currently unavailable.",
        icon: "error",
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      });
      return;
    }
    
    addToCart(product);
    
    Swal.fire({
      title: "Added to Cart!",
      text: `${product.name} has been added to your cart.`,
      icon: "success",
      timer: 1500,
      showConfirmButton: false,
      toast: true,
      position: "top-end",
    });
  };

  return (
    <Link
      href={`/products/${product.id}`}
      className="block"
    >
      <Card className="h-full overflow-hidden p-0">
        <CardHeader className="relative block p-0">
          <div
            ref={imageContainerRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            className="relative"
          >
            <AspectRatio ratio={1} className="overflow-hidden">
              {allImages.map((src, i) => (
                <Image
                  key={src}
                  src={src}
                  alt={i === 0 ? product.image.alt : `${product.name} - View ${i + 1}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className={`block object-cover object-center transition-opacity duration-200 ${
                    i === activeIndex ? "opacity-100" : "opacity-0"
                  }`}
                  priority={false}
                />
              ))}
            </AspectRatio>

            {/* Gallery indicator bars */}
            {hasMultipleImages && isHovered && (
              <div className="absolute bottom-0 left-0 right-0 flex gap-[3px] px-2 pb-2">
                {allImages.map((_, i) => (
                  <div
                    key={`bar-${product.id}-${i}`}
                    className="h-[3px] flex-1 rounded-full transition-colors duration-150"
                    style={{
                      backgroundColor:
                        i === activeIndex
                          ? "#ea580c"
                          : "rgba(255,255,255,0.45)",
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {product.badge && (
            <Badge
              style={{
                background: product.badge.backgroundColor,
              }}
              className="absolute start-4 top-4"
            >
              {product.badge.text}
            </Badge>
          )}
          {/* Wishlist Button - Top Right */}
          <div className="absolute end-4 top-4 bg-white rounded-full shadow-md">
            <WishlistButton productId={product.id} variant="icon" />
          </div>
        </CardHeader>
        <CardContent className="flex h-full flex-col gap-3 pb-6">
          <CardTitle className="text-base font-semibold">
            {product.name}
          </CardTitle>
          <CardDescription className="text-xs font-medium text-muted-foreground">
            {product.company}
          </CardDescription>
          
          {/* Stock Badge */}
          {product.trackInventory && (
            <StockBadge
              stockQuantity={product.stockQuantity || 0}
              lowStockThreshold={product.lowStockThreshold || 10}
              trackInventory={product.trackInventory}
              className="w-fit"
            />
          )}
          
          <div className="mt-auto space-y-3">
            <Price
              onSale={product.price.sale != null}
              className="text-base font-semibold"
            >
              <PriceValue
                price={product.price.regular}
                currency={product.price.currency}
                variant="regular"
              />
              <PriceValue
                price={product.price.sale}
                currency={product.price.currency}
                variant="sale"
              />
            </Price>
            <Button
              onClick={handleAddToCart}
              className="w-full"
              size="sm"
              disabled={isOutOfStock}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
