"use client";

import { useState } from "react";
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
import Swal from "sweetalert2";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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

  const displayImage = isHovered && product.imageHover 
    ? product.imageHover 
    : product.image;

  return (
    <a
      href={`/products/${product.id}`}
      className="block transition-opacity hover:opacity-80"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className="h-full overflow-hidden p-0">
        <CardHeader className="relative block p-0">
          <AspectRatio ratio={1.268115942} className="overflow-hidden">
            <img
              src={displayImage.src}
              alt={displayImage.alt}
              className="block size-full object-cover object-center transition-opacity duration-300"
            />
          </AspectRatio>
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
        </CardHeader>
        <CardContent className="flex h-full flex-col gap-3 pb-6">
          <CardTitle className="text-base font-semibold">
            {product.name}
          </CardTitle>
          <CardDescription className="text-xs font-medium text-muted-foreground">
            {product.company}
          </CardDescription>
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
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
          </div>
        </CardContent>
      </Card>
    </a>
  );
}
