import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconUser, IconShoppingCart } from "@tabler/icons-react";

interface RecentSignup {
  id: string;
  email: string;
  displayName: string | null;
  createdAt: Date | string | null | undefined;
}

interface RecentOrder {
  id: number;
  orderNumber: string;
  customerEmail: string;
  total: string;
  status: string;
  createdAt: Date | string | null | undefined;
}

interface RecentActivityProps {
  signups: RecentSignup[];
  orders: RecentOrder[];
}

function formatRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return "Unknown";
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Check if date is valid
  if (!dateObj || isNaN(dateObj.getTime())) return "Unknown";
  
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)} days ago`;

  return dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCurrency(amount: string): string {
  const numAmount = Number.parseFloat(amount);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(numAmount);
}

function getStatusColor(
  status: string,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status.toLowerCase()) {
    case "completed":
      return "default";
    case "pending":
      return "secondary";
    case "cancelled":
    case "refunded":
      return "destructive";
    default:
      return "outline";
  }
}

export function RecentActivity({ signups, orders }: RecentActivityProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Recent Signups */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconUser className="h-5 w-5" />
            Recent Signups
          </CardTitle>
        </CardHeader>
        <CardContent>
          {signups.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No recent signups yet
            </p>
          ) : (
            <div className="space-y-4">
              {signups.map((signup) => (
                <div
                  key={signup.id}
                  className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {signup.displayName || "Anonymous User"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {signup.email}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatRelativeTime(signup.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconShoppingCart className="h-5 w-5" />
            Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent orders yet</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium leading-none">
                        #{order.orderNumber}
                      </p>
                      <Badge variant={getStatusColor(order.status)} className="text-xs">
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {order.customerEmail}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {formatCurrency(order.total)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatRelativeTime(order.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
