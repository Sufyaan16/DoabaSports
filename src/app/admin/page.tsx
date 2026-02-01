import { stackServerApp } from "@/stack/server";
import { redirect } from "next/navigation";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { RecentActivity } from "@/components/recent-activity";
import { LowStockAlert } from "@/components/low-stock-alert";
import {
  getDashboardStats,
  getUsersByDateRange,
  getRecentSignups,
  getRecentOrders,
} from "@/lib/admin/dashboard-stats";

export default async function AdminDashboard() {
  const user = await stackServerApp.getUser();

  if (!user) {
    redirect("/handler/sign-in");
  }

  // Fetch all dashboard data in parallel
  const [stats, chartData, recentSignups, recentOrders] = await Promise.all([
    getDashboardStats(),
    getUsersByDateRange(90),
    getRecentSignups(5),
    getRecentOrders(5),
  ]);

  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col gap-8 p-4 lg:p-6">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards stats={stats} />
            <div className="px-4 lg:px-6">
              <ChartAreaInteractive data={chartData} />
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="px-4 lg:px-6 grid gap-6 md:grid-cols-1">
          <div>
            <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
            <RecentActivity signups={recentSignups} orders={recentOrders} />
          </div>
          <div className="">
            <h2 className="text-xl font-bold mb-4">Inventory</h2>
            <LowStockAlert />
          </div>
        </div>
      </div>
    </>
  );
}

