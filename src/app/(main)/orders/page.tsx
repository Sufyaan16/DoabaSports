"use client";

import { useEffect, useState } from "react";
import { useUser } from "@stackframe/stack";
import Link from "next/link";
import NextImage from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Eye, ShoppingBag } from "lucide-react";
import type { Order } from "@/db/schema";
import { formatCurrency } from "@/lib/format";

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

export default function CustomerOrdersPage() {
  const user = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.primaryEmail) return;

      try {
        const response = await fetch("/api/orders/my-orders");
        if (!response.ok) throw new Error("Failed to fetch orders");

        const data = await response.json();
        // Use the orders from the response
        setOrders(data.orders || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 md:px-8 lg:px-20 py-16">
        <div className="max-w-2xl mx-auto text-center py-16">
          <Package className="h-24 w-24 mx-auto mb-6 text-muted-foreground opacity-50" />
          <h1 className="text-3xl font-bold mb-4">Sign In Required</h1>
          <p className="text-muted-foreground mb-8">
            Please sign in to view your orders.
          </p>
          <Button asChild size="lg">
            <Link href="/handler/sign-in">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 md:px-8 lg:px-20 py-16">
        <div className="mb-8">
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 md:px-8 lg:px-20 py-16">
        <div className="max-w-2xl mx-auto text-center py-16">
          <ShoppingBag className="h-24 w-24 mx-auto mb-6 text-muted-foreground opacity-50" />
          <h1 className="text-3xl font-bold mb-4">No Orders Yet</h1>
          <p className="text-muted-foreground mb-8">
            You haven't placed any orders yet. Start shopping to see your orders here!
          </p>
          <Button asChild size="lg">
            <Link href="/products">Start Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-8 lg:px-20 py-16">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">My Orders</h1>
        <p className="text-muted-foreground">
          View and track all your orders in one place
        </p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">
                    Order {order.orderNumber}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Placed on {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={STATUS_COLORS[order.status]}>
                    {order.status}
                  </Badge>
                  <Badge className={PAYMENT_STATUS_COLORS[order.paymentStatus]}>
                    {order.paymentStatus}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Order Items Preview */}
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {order.items.slice(0, 4).map((item, index) => (
                    <div key={index} className="shrink-0 relative w-20 h-20 rounded border overflow-hidden">
                      <NextImage
                        src={item.productImage}
                        alt={item.productName}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                  ))}
                  {order.items.length > 4 && (
                    <div className="shrink-0 w-20 h-20 flex items-center justify-center bg-muted rounded border">
                      <span className="text-sm font-medium">
                        +{order.items.length - 4}
                      </span>
                    </div>
                  )}
                </div>

                {/* Order Summary */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-4 border-t">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      {order.items.length} item(s) • Total: <span className="font-semibold text-foreground">
                        {formatCurrency(parseFloat(order.total), order.currency)}
                      </span>
                    </p>
                    {order.trackingNumber && (
                      <p className="text-sm text-muted-foreground">
                        Tracking: <span className="font-mono">
                          {order.trackingNumber}
                        </span>
                      </p>
                    )}
                  </div>
                  <Link href={`/orders/${order.id}`}>
                    <Button variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
