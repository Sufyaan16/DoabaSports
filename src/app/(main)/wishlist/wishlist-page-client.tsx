"use client";

import { useEffect, useState } from "react";
import { Product } from "@/lib/data/products";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart } from "lucide-react";
import { useUser } from "@stackframe/stack";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/cart-context";
import Swal from "sweetalert2";
import { WishlistLoadingSkeleton } from "./wishlist-loading-skeleton";

interface WishlistItem {
  id: number;
  productId: number;
  addedAt: string;
  notes: string | null;
  product: Product;
}

export function WishlistPageClient() {
  const user = useUser();
  const router = useRouter();
  const { addToCart } = useCart();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }
    fetchWishlist();
  }, [user, router]);

  const fetchWishlist = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/wishlist");
      const data = await response.json();

      if (data.success) {
        setWishlistItems(data.data);
      } else {
        Swal.fire({
          title: "Error",
          text: data.error || "Failed to load wishlist",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to load wishlist",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleRemoveFromWishlist = async (wishlistId: number, options?: { suppressToast?: boolean }) => {
    try {
      const response = await fetch(`/api/wishlist/${wishlistId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setWishlistItems((prev) =>
          prev.filter((item) => item.id !== wishlistId)
        );
        // Dispatch custom event to update wishlist count
        window.dispatchEvent(new Event("wishlist-updated"));
        if (!options?.suppressToast) {
          Swal.fire({
            title: "Removed!",
            text: "Product removed from wishlist",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
            toast: true,
            position: "top-end",
          });
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      if (!options?.suppressToast) {
        Swal.fire({
          title: "Error",
          text: "Failed to remove from wishlist",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
      return false;
    }
  };

  const handleMoveToCart = async (item: WishlistItem) => {
    const isOutOfStock =
      item.product.trackInventory &&
      (item.product.stockQuantity || 0) === 0;

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

    // Remove from wishlist first (silently)
    const removed = await handleRemoveFromWishlist(item.id, { suppressToast: true });
    
    if (removed) {
      // Only add to cart if removal succeeded
      addToCart(item.product);
      Swal.fire({
        title: "Moved to Cart!",
        text: `${item.product.name} has been added to your cart.`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      });
    } else {
      Swal.fire({
        title: "Error",
        text: "Failed to move item to cart",
        icon: "error",
        confirmButtonText: "OK",
        toast: true,
        position: "top-end",
      });
    }
  };

  if (isLoading) {
    return <WishlistLoadingSkeleton />;
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="container py-16">
        <div className="flex flex-col items-center justify-center space-y-6 text-center">
          <div className="rounded-full bg-muted p-6">
            <Heart className="h-16 w-16 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold">Your Wishlist is Empty</h2>
            <p className="text-muted-foreground max-w-md">
              Start adding products to your wishlist by clicking the heart icon
              on any product
            </p>
          </div>
          <Button onClick={() => router.push("/products")}>
            Browse Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Wishlist</h1>
        <p className="text-muted-foreground mt-2">
          {wishlistItems.length} {wishlistItems.length === 1 ? "item" : "items"}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mx-auto max-w-screen-2xl">
        {wishlistItems.map((item) => (
          <div key={item.id} className="relative group">
            <ProductCard product={item.product} />
            
            {/* Action Buttons Overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none">
              <Button
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  handleMoveToCart(item);
                }}
                className="pointer-events-auto"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Move to Cart
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={(e) => {
                  e.preventDefault();
                  handleRemoveFromWishlist(item.id);
                }}
                className="pointer-events-auto"
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
