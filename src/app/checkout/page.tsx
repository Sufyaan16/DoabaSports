"use client";

import { useCart } from "@/contexts/cart-context";
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
import { Separator } from "@/components/ui/separator";
import { Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { useState } from "react";
import { useUser } from "@stackframe/stack";

export default function CheckoutPage() {
  const router = useRouter();
  const user = useUser();
  const { cart, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  
  const cartTotal = getCartTotal();
  const shippingCost = cartTotal > 0 ? 15 : 0;
  const tax = cartTotal * 0.1; // 10% tax
  const grandTotal = cartTotal + shippingCost + tax;

  const handlePlaceOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const city = formData.get("city") as string;
    const state = formData.get("state") as string;
    const zip = formData.get("zip") as string;

    // Generate order number
    const orderNumber = `ORD-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

    // Prepare order data
    const orderData = {
      orderNumber,
      customerName: `${firstName} ${lastName}`,
      customerEmail: email,
      customerPhone: phone,
      shippingAddress: address,
      shippingCity: city,
      shippingState: state,
      shippingZip: zip,
      shippingCountry: "USA",
      items: cart.map((item) => ({
        productId: item.id,
        productName: item.name,
        productImage: item.image.src,
        quantity: item.quantity,
        price: item.price.sale || item.price.regular,
        total: (item.price.sale || item.price.regular) * item.quantity,
      })),
      subtotal: cartTotal.toFixed(2),
      tax: tax.toFixed(2),
      shippingCost: shippingCost.toFixed(2),
      total: grandTotal.toFixed(2),
      currency: "USD",
      status: "pending",
      paymentStatus: "unpaid",
      paymentMethod: "cod",
    };

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error("Failed to create order");
      }

      const order = await response.json();

      setLoading(false);

      const result = await Swal.fire({
        title: "Order Placed Successfully!",
        html: `
          <p>Your order <strong>${order.orderNumber}</strong> has been placed successfully!</p>
          <p>Order Total: <strong>$${grandTotal.toFixed(2)}</strong></p>
          <p>You will receive a confirmation email at <strong>${email}</strong></p>
        `,
        icon: "success",
        confirmButtonText: "View My Orders",
        showCancelButton: true,
        cancelButtonText: "Continue Shopping",
      });

      clearCart();

      if (result.isConfirmed) {
        router.push("/orders");
      } else {
        router.push("/products");
      }
    } catch (error) {
      setLoading(false);
      await Swal.fire({
        title: "Error!",
        text: "Failed to place order. Please try again.",
        icon: "error",
      });
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 md:px-8 lg:px-20 py-16">
        <div className="max-w-2xl mx-auto text-center py-16">
          <ShoppingBag className="h-24 w-24 mx-auto mb-6 text-muted-foreground opacity-50" />
          <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-muted-foreground mb-8">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Button asChild size="lg">
            <Link href="/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-8 lg:px-20 py-16">
      <div className="mb-8">
        <Link href="/products" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Continue Shopping
        </Link>
        <h1 className="text-4xl font-bold">Checkout</h1>
        <p className="text-muted-foreground mt-2">
          Complete your order by filling in your details below
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Items ({cart.length})</CardTitle>
              <CardDescription>Review your items before checkout</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <img
                    src={item.image.src}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.company}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        -
                      </Button>
                      <span className="font-medium w-12 text-center">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-5 w-5 text-destructive" />
                    </Button>
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        ${((item.price.sale || item.price.regular) * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ${(item.price.sale || item.price.regular).toFixed(2)} each
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Shipping Information */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
              <CardDescription>Enter your delivery address</CardDescription>
            </CardHeader>
            <CardContent>
              <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input id="firstName" name="firstName" required placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input id="lastName" name="lastName" required placeholder="Doe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input 
                    id="email" 
                    name="email"
                    type="email" 
                    required 
                    placeholder="john@example.com"
                    defaultValue={user?.primaryEmail || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input id="phone" name="phone" type="tel" required placeholder="+1 (555) 000-0000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input id="address" name="address" required placeholder="123 Main St" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input id="city" name="city" required placeholder="New York" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input id="state" name="state" required placeholder="NY" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP Code *</Label>
                    <Input id="zip" name="zip" required placeholder="10001" />
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">${shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (10%)</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="font-semibold text-lg">Total</span>
                <span className="font-bold text-2xl">${grandTotal.toFixed(2)}</span>
              </div>
              <Button
                type="submit"
                form="checkout-form"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? "Processing..." : "Place Order"}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                By placing your order, you agree to our terms and conditions
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
