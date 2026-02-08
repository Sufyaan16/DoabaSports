"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Package, User, MapPin, CreditCard, Truck, Loader2 } from "lucide-react";
import type { Order } from "@/db/schema";
import Swal from "sweetalert2";

interface OrderDetailProps {
  order: Order;
}

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
  refunded: "bg-gray-500",
  failed: "bg-red-500",
};

export function OrderDetail({ order: initialOrder }: OrderDetailProps) {
  const router = useRouter();
  const [order, setOrder] = useState(initialOrder);
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || "");
  const [status, setStatus] = useState(order.status);
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [restoreInventory, setRestoreInventory] = useState(true);
  const [isRefunding, setIsRefunding] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);
  const [isUpdatingTracking, setIsUpdatingTracking] = useState(false);

  const handleUpdateTracking = async () => {
    setIsUpdatingTracking(true);
    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingNumber }),
      });

      if (!response.ok) throw new Error("Failed to update tracking");

      await Swal.fire({
        title: "Updated!",
        text: "Tracking number has been updated.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });

      router.refresh();
    } catch (error) {
      await Swal.fire({
        title: "Error!",
        text: "Failed to update tracking number.",
        icon: "error",
      });
    } finally {
      setIsUpdatingTracking(false);
    }
  };

  const handleUpdateStatus = async () => {
    setIsUpdatingStatus(true);
    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      setOrder({ ...order, status });

      await Swal.fire({
        title: "Updated!",
        text: "Order status has been updated.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });

      router.refresh();
    } catch (error) {
      await Swal.fire({
        title: "Error!",
        text: "Failed to update order status.",
        icon: "error",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleUpdatePaymentStatus = async () => {
    setIsUpdatingPayment(true);
    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus }),
      });

      if (!response.ok) throw new Error("Failed to update payment status");

      setOrder({ ...order, paymentStatus });

      await Swal.fire({
        title: "Updated!",
        text: "Payment status has been updated.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });

      router.refresh();
    } catch (error) {
      await Swal.fire({
        title: "Error!",
        text: "Failed to update payment status.",
        icon: "error",
      });
    } finally {
      setIsUpdatingPayment(false);
    }
  };

  const handleRefund = async () => {
    if (refundReason.trim().length < 10) {
      await Swal.fire({
        title: "Invalid Input",
        text: "Refund reason must be at least 10 characters.",
        icon: "error",
      });
      return;
    }

    setIsRefunding(true);
    try {
      const body: any = {
        reason: refundReason,
        restoreInventory,
      };

      // Add refund amount if specified
      if (refundAmount && parseFloat(refundAmount) > 0) {
        body.refundAmount = parseFloat(refundAmount);
      }

      const response = await fetch(`/api/orders/${order.id}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        setOrder({ ...order, status: "refunded", paymentStatus: "refunded" });
        setStatus("refunded");
        setPaymentStatus("refunded");
        setRefundDialogOpen(false);
        setRefundReason("");
        setRefundAmount("");

        await Swal.fire({
          title: "Refunded!",
          html: `
            <p>${data.message}</p>
            <p class="text-sm text-muted-foreground mt-2">
              Amount: $${data.data.refundAmount} ${data.data.currency}
            </p>
            ${data.data.note ? `<p class="text-xs text-yellow-600 mt-2">${data.data.note}</p>` : ''}
          `,
          icon: "success",
          timer: 5000,
        });

        router.refresh();
      } else {
        await Swal.fire({
          title: "Refund Failed",
          text: data.message || "Failed to process refund.",
          icon: "error",
        });
      }
    } catch (error) {
      console.error("Error processing refund:", error);
      await Swal.fire({
        title: "Error!",
        text: "Failed to process refund. Please try again.",
        icon: "error",
      });
    } finally {
      setIsRefunding(false);
    }
  };

  const handleCancel = async () => {
    const result = await Swal.fire({
      title: "Cancel Order",
      text: "Are you sure you want to cancel this order?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, cancel it",
      cancelButtonText: "No",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });

      if (!response.ok) throw new Error("Failed to cancel order");

      setOrder({ ...order, status: "cancelled" });
      setStatus("cancelled");

      await Swal.fire({
        title: "Cancelled!",
        text: "Order has been cancelled successfully.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });

      router.refresh();
    } catch (error) {
      await Swal.fire({
        title: "Error!",
        text: "Failed to cancel order.",
        icon: "error",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 mt-4">
          <Link href="/admin/orders">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4" />
              {/* Back to Orders */}
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Order {order.orderNumber}</h1>
            <p className="text-sm text-muted-foreground">
              Created on {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {order.status !== "cancelled" && order.status !== "refunded" && (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Cancel Order
              </Button>
              {order.paymentStatus === "paid" && (
                <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">Refund Order</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                      <DialogTitle>Process Refund</DialogTitle>
                      <DialogDescription>
                        Process a full or partial refund for order {order.orderNumber}.
                        Total order amount: ${parseFloat(order.total).toFixed(2)}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="refund-reason">
                          Refund Reason <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="refund-reason"
                          placeholder="Enter reason for refund (minimum 10 characters)..."
                          value={refundReason}
                          onChange={(e) => setRefundReason(e.target.value)}
                          minLength={10}
                          maxLength={500}
                          rows={4}
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          {refundReason.length}/500 characters (min. 10)
                        </p>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="refund-amount">
                          Refund Amount (Optional)
                        </Label>
                        <Input
                          id="refund-amount"
                          type="number"
                          placeholder={`Leave empty for full refund ($${parseFloat(order.total).toFixed(2)})`}
                          value={refundAmount}
                          onChange={(e) => setRefundAmount(e.target.value)}
                          step="0.01"
                          min="0.01"
                          max={order.total}
                        />
                        <p className="text-xs text-muted-foreground">
                          Leave empty to refund full amount. Max: ${parseFloat(order.total).toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="restore-inventory"
                          checked={restoreInventory}
                          onCheckedChange={(checked) =>
                            setRestoreInventory(checked === true)
                          }
                        />
                        <Label
                          htmlFor="restore-inventory"
                          className="text-sm font-normal cursor-pointer"
                        >
                          Restore inventory for refunded items
                        </Label>
                      </div>
                      <div className="rounded-md bg-yellow-50 p-3 border border-yellow-200">
                        <p className="text-xs text-yellow-800">
                          <strong>Note:</strong> This will update the order status to "refunded". 
                          You'll need to process the actual payment refund through your payment gateway 
                          (Stripe, PayPal, etc.) separately.
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setRefundDialogOpen(false);
                          setRefundReason("");
                          setRefundAmount("");
                          setRestoreInventory(true);
                        }}
                        disabled={isRefunding}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={handleRefund}
                        disabled={isRefunding || refundReason.trim().length < 10}
                      >
                        {isRefunding ? "Processing..." : "Process Refund"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
                    <div className="relative w-20 h-20 shrink-0 rounded overflow-hidden">
                      <Image
                        src={item.productImage}
                        alt={item.productName}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity}
                      </p>
                      <p className="text-sm">
                        ${item.price.toFixed(2)} × {item.quantity} = $
                        {item.total.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>${parseFloat(order.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax:</span>
                  <span>${parseFloat(order.tax).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping:</span>
                  <span>${parseFloat(order.shippingCost).toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>
                    {order.currency} ${parseFloat(order.total).toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-muted-foreground">Name</Label>
                <p className="font-medium">{order.customerName}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Email</Label>
                <p className="font-medium">{order.customerEmail}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Phone</Label>
                <p className="font-medium">{order.customerPhone || "N/A"}</p>
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
              <p>{order.shippingAddress}</p>
              <p>
                {order.shippingCity}, {order.shippingState} {order.shippingZip}
              </p>
              <p>{order.shippingCountry}</p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Current Status</Label>
                <div className="mt-2">
                  <Badge className={STATUS_COLORS[order.status]}>
                    {order.status}
                  </Badge>
                </div>
              </div>

              <div>
                <Label>Update Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  className="w-full mt-2"
                  onClick={handleUpdateStatus}
                  disabled={status === order.status || isUpdatingStatus}
                >
                  {isUpdatingStatus ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Status"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Current Payment Status</Label>
                <div className="mt-1">
                  <Badge className={PAYMENT_STATUS_COLORS[order.paymentStatus]}>
                    {order.paymentStatus}
                  </Badge>
                </div>
              </div>

              <div>
                <Label>Update Payment Status</Label>
                <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  className="w-full mt-2"
                  onClick={async () => {
                    // Check for risky payment status transitions
                    const isRiskyTransition = 
                      order.paymentStatus === "paid" && 
                      paymentStatus !== "paid";

                    if (isRiskyTransition) {
                      const result = await Swal.fire({
                        title: "Confirm Payment Status Change",
                        html: `
                          <p>You are changing payment status from <strong>paid</strong> to <strong>${paymentStatus}</strong>.</p>
                          <p class="text-red-600 mt-2">This is a sensitive operation that may affect financial records.</p>
                          <p class="mt-2">Are you sure you want to proceed?</p>
                        `,
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonText: "Yes, update status",
                        cancelButtonText: "Cancel",
                        confirmButtonColor: "#ef4444",
                      });

                      if (result.isConfirmed) {
                        await handleUpdatePaymentStatus();
                      }
                    } else {
                      await handleUpdatePaymentStatus();
                    }
                  }}
                  disabled={paymentStatus === order.paymentStatus || isUpdatingPayment}
                >
                  {isUpdatingPayment ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Payment Status"
                  )}
                </Button>
              </div>

              <div>
                <Label className="text-muted-foreground">Payment Method</Label>
                <p className="font-medium capitalize mt-1">
                  {order.paymentMethod?.replace("_", " ") || "N/A"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tracking Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Tracking Number</Label>
                <Input
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number"
                  className="mt-2"
                />
                <Button
                  className="w-full mt-2"
                  onClick={handleUpdateTracking}
                  disabled={trackingNumber === order.trackingNumber || isUpdatingTracking}
                >
                  {isUpdatingTracking ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Tracking"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Order Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
