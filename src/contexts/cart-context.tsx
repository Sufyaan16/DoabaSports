"use client";

import React, { createContext, useContext, useState, useEffect, Suspense } from "react";
import { Product } from "@/lib/data/products";
import { useUser } from "@stackframe/stack";

export interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function CartProviderInner({ children }: { children: React.ReactNode }) {
  const user = useUser();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);

  // Fetch all products for cart display
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  // Load cart based on auth status
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      
      if (user) {
        // Logged in user - fetch from database
        try {
          const response = await fetch("/api/cart");
          if (response.ok) {
            const dbCart = await response.json();
            const cartItems = await hydrateCart(dbCart.items || []);
            setCart(cartItems);
            
            // Merge guest cart if exists
            const guestCart = localStorage.getItem("cart");
            if (guestCart) {
              const guestItems = JSON.parse(guestCart);
              if (guestItems.length > 0) {
                await mergeGuestCart(guestItems, dbCart.items || []);
              }
              // Clear guest cart after merge
              localStorage.removeItem("cart");
            }
          }
        } catch (error) {
          console.error("Error loading user cart:", error);
        }
      } else {
        // Guest user - load from localStorage
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          setCart(JSON.parse(savedCart));
        }
      }
      
      setLoading(false);
    };

    loadCart();
  }, [user?.id]); // Re-run when user logs in/out

  // Hydrate cart items with full product data
  const hydrateCart = async (cartItems: Array<{ productId: number; quantity: number }>): Promise<CartItem[]> => {
    if (products.length === 0) return [];
    
    return cartItems
      .map(item => {
        const product = products.find(p => p.id === item.productId);
        if (!product) return null;
        return { ...product, quantity: item.quantity };
      })
      .filter((item): item is CartItem => item !== null);
  };

  // Merge guest cart with user cart
  const mergeGuestCart = async (guestCart: CartItem[], userCartItems: Array<{ productId: number; quantity: number }>) => {
    const merged = [...userCartItems];
    
    for (const guestItem of guestCart) {
      const existingIndex = merged.findIndex(item => item.productId === guestItem.id);
      if (existingIndex >= 0) {
        // Add quantities
        merged[existingIndex].quantity += guestItem.quantity;
      } else {
        // Add new item
        merged.push({ productId: guestItem.id, quantity: guestItem.quantity });
      }
    }

    // Save merged cart to database
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: merged }),
      });
      
      if (response.ok) {
        const updatedCart = await response.json();
        const cartItems = await hydrateCart(updatedCart.items);
        setCart(cartItems);
      }
    } catch (error) {
      console.error("Error merging cart:", error);
    }
  };

  // Save cart to appropriate storage
  const saveCart = async (newCart: CartItem[]) => {
    setCart(newCart);
    
    if (user) {
      // Save to database
      const dbItems = newCart.map(item => ({
        productId: item.id,
        quantity: item.quantity,
      }));
      
      try {
        await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: dbItems }),
        });
      } catch (error) {
        console.error("Error saving cart to database:", error);
      }
    } else {
      // Save to localStorage
      localStorage.setItem("cart", JSON.stringify(newCart));
    }
  };

  const addToCart = (product: Product) => {
    const newCart = [...cart];
    const existingItem = newCart.find((item) => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      newCart.push({ ...product, quantity: 1 });
    }
    
    saveCart(newCart);
  };

  const removeFromCart = (productId: number) => {
    const newCart = cart.filter((item) => item.id !== productId);
    saveCart(newCart);
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    const newCart = cart.map((item) =>
      item.id === productId ? { ...item, quantity } : item
    );
    
    saveCart(newCart);
  };

  const clearCart = async () => {
    setCart([]);
    
    if (user) {
      try {
        await fetch("/api/cart", { method: "DELETE" });
      } catch (error) {
        console.error("Error clearing cart:", error);
      }
    } else {
      localStorage.removeItem("cart");
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const price = item.price.sale || item.price.regular;
      return total + price * item.quantity;
    }, 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div>Loading cart...</div>}>
      <CartProviderInner>{children}</CartProviderInner>
    </Suspense>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
