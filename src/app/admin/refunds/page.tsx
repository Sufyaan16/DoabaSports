"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle, XCircle, Clock, Loader2, AlertTriangle } from "lucide-react";

type RefundRequest = {
  id: number;
  orderId: number;
  orderNumber: string;
  userId: string;
  reason: string;
  status: string;
  adminNotes: string | null;
  resolvedBy: string | null;
  stripeRefundId: string | null;
  refundAmount: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  orderTotal: string | null;
  orderStatus: string | null;
  orderPaymentStatus: string | null;
  orderPaymentMethod: string | null;
  customerName: string | null;
  customerEmail: string | null;
};

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
  pending: { label: "Pending", variant: "outline", icon: <Clock className="h-3 w-3" /> },
  approved: { label: "Approved", variant: "default", icon: <CheckCircle className="h-3 w-3" /> },
  rejected: { label: "Rejected", variant: "destructive", icon: <XCircle className="h-3 w-3" /> },
  completed: { label: "Completed", variant: "default", icon: <CheckCircle className="h-3 w-3" /> },
};

export default function AdminRefundsPage() {
  const [requests, setRequests] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("pending");
  const [selectedRequest, setSelectedRequest] = useState<RefundRequest | null>(null);
  const [resolveAction, setResolveAction] = useState<"approved" | "rejected" | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== "all") params.set("status", filter);
      const res = await fetch(`/api/admin/refund-requests?${params}`);
      const data = await res.json();
      setRequests(data.refundRequests || []);
    } catch {
      console.error("Failed to fetch refund requests");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleResolve = async () => {
    if (!selectedRequest || !resolveAction) return;
    setProcessing(true);

    try {
      const res = await fetch(`/api/admin/refund-requests/${selectedRequest.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: resolveAction,
          adminNotes: adminNotes || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const { default: Swal } = await import("sweetalert2");
        await Swal.fire({
          title: "Error",
          text: data.error || data.message || "Failed to process refund",
          icon: "error",
        });
        return;
      }

      const { default: Swal } = await import("sweetalert2");
      await Swal.fire({
        title: resolveAction === "approved" ? "Refund Approved" : "Refund Rejected",
        text: data.message,
        icon: "success",
      });

      setSelectedRequest(null);
      setResolveAction(null);
      setAdminNotes("");
      fetchRequests();
    } catch {
      const { default: Swal } = await import("sweetalert2");
      await Swal.fire({
        title: "Error",
        text: "Something went wrong. Please try again.",
        icon: "error",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
        <h1 className="text-lg font-semibold">Refund Requests</h1>
      </header>

      <div className="p-4 space-y-4">
        {/* Filter buttons */}
        <div className="flex gap-2 flex-wrap">
          {["pending", "completed", "rejected", "all"].map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {filter === "all" ? "All" : filter.charAt(0).toUpperCase() + filter.slice(1)} Refund Requests
            </CardTitle>
            <CardDescription>
              Review and manage customer refund requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No {filter !== "all" ? filter : ""} refund requests found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((req) => {
                      const sc = statusConfig[req.status] || statusConfig.pending;
                      return (
                        <TableRow key={req.id}>
                          <TableCell className="font-medium">{req.orderNumber}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{req.customerName}</p>
                              <p className="text-xs text-muted-foreground">{req.customerEmail}</p>
                            </div>
                          </TableCell>
                          <TableCell>${Number.parseFloat(req.orderTotal || "0").toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {req.orderPaymentMethod === "stripe" ? "Stripe" : "COD"}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate" title={req.reason}>
                            {req.reason}
                          </TableCell>
                          <TableCell>
                            <Badge variant={sc.variant} className="flex items-center gap-1 w-fit">
                              {sc.icon}
                              {sc.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                            {new Date(req.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {req.status === "pending" ? (
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => {
                                    setSelectedRequest(req);
                                    setResolveAction("approved");
                                    setAdminNotes("");
                                  }}
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    setSelectedRequest(req);
                                    setResolveAction("rejected");
                                    setAdminNotes("");
                                  }}
                                >
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                {req.resolvedAt
                                  ? `Resolved ${new Date(req.resolvedAt).toLocaleDateString()}`
                                  : "—"}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Resolve Dialog */}
      <Dialog
        open={!!selectedRequest && !!resolveAction}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedRequest(null);
            setResolveAction(null);
            setAdminNotes("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {resolveAction === "approved" ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Approve Refund
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-600" />
                  Reject Refund
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {resolveAction === "approved"
                ? "This will process the refund and restore inventory."
                : "The customer will be notified that their request was rejected."}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p className="text-muted-foreground">Order:</p>
                <p className="font-medium">{selectedRequest.orderNumber}</p>
                <p className="text-muted-foreground">Customer:</p>
                <p>{selectedRequest.customerName}</p>
                <p className="text-muted-foreground">Amount:</p>
                <p className="font-bold">${Number.parseFloat(selectedRequest.orderTotal || "0").toFixed(2)}</p>
                <p className="text-muted-foreground">Payment:</p>
                <p>{selectedRequest.orderPaymentMethod === "stripe" ? "Stripe (will be refunded)" : "COD"}</p>
              </div>

              <div className="bg-muted p-3 rounded-md text-sm">
                <p className="font-medium mb-1">Customer&apos;s Reason:</p>
                <p className="text-muted-foreground">{selectedRequest.reason}</p>
              </div>

              {resolveAction === "approved" && selectedRequest.orderPaymentMethod === "stripe" && (
                <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-md">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <p>This will issue a Stripe refund. The funds will be returned to the customer&apos;s card.</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Admin Notes (optional)</label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder={
                    resolveAction === "approved"
                      ? "Add any notes about the refund..."
                      : "Provide a reason for rejection..."
                  }
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedRequest(null);
                setResolveAction(null);
              }}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              variant={resolveAction === "approved" ? "default" : "destructive"}
              onClick={handleResolve}
              disabled={processing}
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Processing...
                </>
              ) : resolveAction === "approved" ? (
                "Confirm Refund"
              ) : (
                "Confirm Rejection"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
