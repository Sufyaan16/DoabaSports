import db from "@/db";
import { orders, products } from "@/db/schema";
import { sql, and, gte, lte, notInArray } from "drizzle-orm";
import { stackServerApp } from "@/stack/server";

/**
 * Get total number of products
 */
export async function getTotalProducts() {
  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(products);
  
  return Number(result[0]?.count || 0);
}

/**
 * Get total products from previous period for trend calculation
 */
export async function getPreviousProductsCount(daysAgo: number = 30) {
  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - daysAgo);
  
  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(products)
    .where(lte(products.createdAt, dateThreshold.toISOString()));
  
  return Number(result[0]?.count || 0);
}

/**
 * Get total revenue from all successful orders
 */
export async function getTotalRevenue() {
  const result = await db
    .select({
      total: sql<number>`COALESCE(SUM(CAST(${orders.total} AS DECIMAL)), 0)`
    })
    .from(orders)
    .where(notInArray(orders.status, ['cancelled', 'refunded']));
  
  return Number(result[0]?.total || 0);
}

/**
 * Get revenue from a specific date range
 */
export async function getRevenueByDateRange(startDate: string, endDate: string) {
  const result = await db
    .select({
      total: sql<number>`COALESCE(SUM(CAST(${orders.total} AS DECIMAL)), 0)`
    })
    .from(orders)
    .where(
      and(
        gte(orders.createdAt, startDate),
        lte(orders.createdAt, endDate),
        notInArray(orders.status, ['cancelled', 'refunded'])
      )
    );
  
  return Number(result[0]?.total || 0);
}

/**
 * Get count of new users from StackAuth
 */
export async function getNewUsersCount() {
  try {
    const users = await stackServerApp.listUsers();
    
    // Calculate 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Count users created in last 30 days
    const newUsers = users.filter(user => {
      // Use createdAt from metadata if available
      const createdAtStr = (user.clientReadOnlyMetadata as any)?.createdAt;
      if (!createdAtStr) return false; // Skip users without metadata
      const createdAt = new Date(createdAtStr);
      return createdAt >= thirtyDaysAgo;
    });
    
    return newUsers.length;
  } catch (error) {
    console.error("Error fetching users:", error);
    return 0;
  }
}

/**
 * Get total user count from StackAuth
 */
export async function getTotalUsersCount() {
  try {
    const users = await stackServerApp.listUsers();
    return users.length;
  } catch (error) {
    console.error("Error fetching users:", error);
    return 0;
  }
}

/**
 * Get users count from previous period
 */
export async function getPreviousUsersCount(daysAgo: number = 30) {
  try {
    const users = await stackServerApp.listUsers();
    
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - daysAgo);
    
    const previousUsers = users.filter(user => {
      // Use createdAt from metadata if available
      const createdAtStr = (user.clientReadOnlyMetadata as any)?.createdAt;
      if (!createdAtStr) return false; // Skip users without metadata
      const createdAt = new Date(createdAtStr);
      return createdAt < dateThreshold;
    });
    
    return previousUsers.length;
  } catch (error) {
    console.error("Error fetching users:", error);
    return 0;
  }
}

/**
 * Calculate growth rate based on order count
 */
export async function getGrowthRate() {
  const now = new Date();
  
  // Current month
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthEnd = now;
  
  // Previous month
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  
  const currentMonthOrders = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(orders)
    .where(
      and(
        gte(orders.createdAt, currentMonthStart.toISOString()),
        lte(orders.createdAt, currentMonthEnd.toISOString())
      )
    );
  
  const lastMonthOrders = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(orders)
    .where(
      and(
        gte(orders.createdAt, lastMonthStart.toISOString()),
        lte(orders.createdAt, lastMonthEnd.toISOString())
      )
    );
  
  const current = Number(currentMonthOrders[0]?.count || 0);
  const previous = Number(lastMonthOrders[0]?.count || 0);
  
  if (previous === 0) return current > 0 ? 100 : 0;
  
  return ((current - previous) / previous) * 100;
}

/**
 * Get users grouped by date for chart
 */
export async function getUsersByDateRange(days: number = 90) {
  try {
    const users = await stackServerApp.listUsers();
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Group users by date
    const usersByDate: Record<string, number> = {};
    
    users.forEach(user => {
      // Use createdAt from metadata if available
      const createdAtStr = (user.clientReadOnlyMetadata as any)?.createdAt;
      if (!createdAtStr) return; // Skip users without metadata
      const createdAt = new Date(createdAtStr);
      if (createdAt >= startDate) {
        const dateKey = createdAt.toISOString().split('T')[0];
        usersByDate[dateKey] = (usersByDate[dateKey] || 0) + 1;
      }
    });
    
    // Fill in missing dates with 0
    const result: Array<{ date: string; users: number }> = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      const dateKey = date.toISOString().split('T')[0];
      result.push({
        date: dateKey,
        users: usersByDate[dateKey] || 0
      });
    }
    
    return result;
  } catch (error) {
    console.error("Error fetching users by date:", error);
    return [];
  }
}

/**
 * Get recent user signups
 */
export async function getRecentSignups(limit: number = 5) {
  try {
    const users = await stackServerApp.listUsers();
    
    // Sort by creation date (newest first) and take limit
    const recentUsers = users
      .filter(user => (user.clientReadOnlyMetadata as any)?.createdAt) // Only include users with metadata
      .sort((a, b) => {
        const aTime = new Date((a.clientReadOnlyMetadata as any)?.createdAt).getTime();
        const bTime = new Date((b.clientReadOnlyMetadata as any)?.createdAt).getTime();
        return bTime - aTime;
      })
      .slice(0, limit)
      .map(user => ({
        id: user.id,
        email: user.primaryEmail || 'No email',
        createdAt: (user.clientReadOnlyMetadata as any)?.createdAt,
        displayName: user.displayName || user.primaryEmail || 'Unknown User'
      }));
    
    return recentUsers;
  } catch (error) {
    console.error("Error fetching recent signups:", error);
    return [];
  }
}

/**
 * Get recent orders
 */
export async function getRecentOrders(limit: number = 5) {
  const recentOrders = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      customerEmail: orders.customerEmail,
      customerName: orders.customerName,
      total: orders.total,
      status: orders.status,
      createdAt: orders.createdAt
    })
    .from(orders)
    .orderBy(sql`${orders.createdAt} DESC`)
    .limit(limit);
  
  return recentOrders;
}

/**
 * Calculate percentage change between two values
 */
export function calculateTrend(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Get all dashboard statistics
 */
export async function getDashboardStats() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);
  const sixtyDaysAgo = new Date(now);
  sixtyDaysAgo.setDate(now.getDate() - 60);
  
  // Fetch all data in parallel
  const [
    totalProducts,
    previousProducts,
    totalRevenue,
    previousRevenue,
    newUsers,
    previousNewUsers,
    growthRate
  ] = await Promise.all([
    getTotalProducts(),
    getPreviousProductsCount(30),
    getRevenueByDateRange(thirtyDaysAgo.toISOString(), now.toISOString()),
    getRevenueByDateRange(sixtyDaysAgo.toISOString(), thirtyDaysAgo.toISOString()),
    getNewUsersCount(),
    await getPreviousUsersCount(60) - await getPreviousUsersCount(30), // Users from 60-30 days ago
    getGrowthRate()
  ]);
  
  return {
    totalProducts,
    productsTrend: calculateTrend(totalProducts, previousProducts),
    totalRevenue,
    revenueTrend: calculateTrend(totalRevenue, previousRevenue),
    newUsers,
    usersTrend: calculateTrend(newUsers, previousNewUsers),
    growthRate
  };
}
