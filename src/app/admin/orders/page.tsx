import db from "@/db";
import { orders } from "@/db/schema";
import { desc } from "drizzle-orm";
import { OrdersList } from "./orders-list";

export default async function AdminOrdersPage() {
  // Fetch all orders from database
  const dbOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold p-4">Orders Management</h1>
        <p className="text-muted-foreground pl-5">
          View and manage all customer orders
        </p>
      </div>

      <OrdersList orders={dbOrders} />
    </div>
  );
}
