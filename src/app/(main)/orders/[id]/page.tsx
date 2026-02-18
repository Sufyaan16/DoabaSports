"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@stackframe/stack";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Package, Truck, MapPin, CreditCard, User, XCircle, RotateCcw } from "lucide-react";
import type { Order } from "@/db/schema";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500",
  processing: "bg-blue-500",
  shipped: "bg-purple-500",
  delivered: "bg-green-500",
  cancelled: "bg-red-500",
  refunded: "bg-gray-500",
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  paid: "bg-green-500",
  unpaid: "bg-yellow-500",
  awaiting: "bg-orange-500",
  refunded: "bg-gray-500",
  failed: "bg-red-500",
};

export default function CustomerOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const user = useUser();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [submittingRefund, setSubmittingRefund] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!user?.primaryEmail) {
        setUnauthorized(true);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/orders/${params.id}`);
        if (!response.ok) {
          if (response.status === 404) {
            router.push("/orders");
            return;
          }
          throw new Error("Failed to fetch order");
        }

        const orderData = await response.json();

        // Verify this order belongs to the logged-in user
        if (orderData.customerEmail !== user.primaryEmail) {
          setUnauthorized(true);
          setLoading(false);
          return;
        }

        setOrder(orderData);
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [params.id, user, router]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCancelOrder = async () => {
    if (!order) return;

    setCancelling(true);
    try {
      const response = await fetch(`/api/orders/${order.id}/cancel`, {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Order Cancelled", {
          description: data.message || "Your order has been cancelled successfully.",
        });
        // Update local order state
        setOrder({ ...order, status: "cancelled" });
        router.refresh();
      } else {
        toast.error("Cancellation Failed", {
          description: data.message || "Failed to cancel order. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error("Error", {
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setCancelling(false);
    }
  };

  const handleRequestRefund = async () => {
    if (!order || refundReason.trim().length < 10) {
      toast.error("Please provide a reason with at least 10 characters.");
      return;
    }

    setSubmittingRefund(true);
    try {
      const response = await fetch("/api/refund-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: order.orderNumber,
          reason: refundReason.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Refund Request Submitted", {
          description: data.message || "Our team will review your request shortly.",
        });
        setRefundDialogOpen(false);
        setRefundReason("");
      } else {
        toast.error("Refund Request Failed", {
          description: data.message || "Failed to submit refund request. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error submitting refund request:", error);
      toast.error("Error", {
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setSubmittingRefund(false);
    }
  };

  const canRequestRefund =
    order &&
    order.paymentStatus === "paid" &&
    order.status !== "cancelled" &&
    order.status !== "refunded";

  if (!user || unauthorized) {
    return (
      <div className="container mx-auto px-4 md:px-8 lg:px-20 py-16">
        <div className="max-w-2xl mx-auto text-center py-16">
          <Package className="h-24 w-24 mx-auto mb-6 text-muted-foreground opacity-50" />
          <h1 className="text-3xl font-bold mb-4">Unauthorized</h1>
          <p className="text-muted-foreground mb-8">
            You don't have permission to view this order.
          </p>
          <Button asChild size="lg">
            <Link href="/orders">Back to Orders</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 md:px-8 lg:px-20 py-16">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 md:px-8 lg:px-20 py-16">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/orders">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
        </Button>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold">Order {order.orderNumber}</h1>
            <p className="text-muted-foreground mt-2">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={STATUS_COLORS[order.status]} variant="default">
              {order.status}
            </Badge>
            <Badge className={PAYMENT_STATUS_COLORS[order.paymentStatus]}>
              {order.paymentStatus}
            </Badge>
          </div>
        </div>
      </div>

      {/* Order Actions */}
      {((order.status === "pending" || order.status === "processing") || canRequestRefund) && (
        <div className="mb-6 flex gap-3 flex-wrap">
          {/* Cancel Order Button */}
          {(order.status === "pending" || order.status === "processing") && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={cancelling}>
                  <XCircle className="h-4 w-4 mr-2" />
                  {cancelling ? "Cancelling..." : "Cancel Order"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Order?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to cancel this order? This action cannot be undone.
                    {order.paymentStatus === "paid" && (
                      <span className="block mt-2 font-semibold">
                        Note: If this order was paid, inventory will be automatically restored.
                      </span>
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>No, keep order</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancelOrder}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Yes, cancel order
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {/* Request Refund Button */}
          {canRequestRefund && (
            <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Request Refund
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request a Refund</DialogTitle>
                  <DialogDescription>
                    Please describe why you&apos;d like a refund for order{" "}
                    <span className="font-semibold">{order.orderNumber}</span>.
                    Our team will review your request.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Textarea
                    placeholder="Please explain the reason for your refund request (minimum 10 characters)..."
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {refundReason.trim().length}/10 characters minimum
                  </p>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setRefundDialogOpen(false)}
                    disabled={submittingRefund}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleRequestRefund}
                    disabled={submittingRefund || refundReason.trim().length < 10}
                  >
                    {submittingRefund ? "Submitting..." : "Submit Request"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Order Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items ({order.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index}>
                    <div className="flex gap-4">
                      <div className="relative w-24 h-24 shrink-0 rounded border overflow-hidden">
                        <Image
                          src={item.productImage}
                          alt={item.productName}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.productName}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Quantity: {item.quantity}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Price: ${item.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          ${item.total.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    {index < order.items.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tracking Information */}
          {order.trackingNumber && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Tracking Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">Tracking Number</p>
                <p className="font-mono text-lg font-semibold">{order.trackingNumber}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Customer & Shipping Info */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{order.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{order.customerEmail}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{order.customerPhone}</p>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{order.shippingAddress}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {order.shippingCity}, {order.shippingState} {order.shippingZip}
              </p>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">${parseFloat(order.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-medium">${parseFloat(order.tax).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">${parseFloat(order.shippingCost).toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${parseFloat(order.total).toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
