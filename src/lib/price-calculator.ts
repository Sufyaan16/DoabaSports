import db from "@/db";
import { products } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { TAX_RATE } from "@/lib/constants";

export interface OrderItem {
  productId: number;
  quantity: number;
}

export interface CalculatedOrderItem extends OrderItem {
  productName: string;
  productImage: string;
  price: number; // Actual current price from database
  total: number; // price * quantity
}

export interface OrderCalculation {
  items: CalculatedOrderItem[];
  subtotal: number;
  tax: number;
  taxRate: number;
  shippingCost: number;
  total: number;
}

export interface PriceCalculationError {
  error: string;
  details?: any;
}

/**
 * Calculate order prices server-side - NEVER trust client prices
 * Uses a single batch query instead of N+1 individual queries
 * @param items - Array of product IDs and quantities
 * @param taxRate - Tax rate (e.g., 0.08 for 8%)
 * @param shippingCost - Shipping cost
 * @returns Calculated order with actual prices or error
 */
export async function calculateOrderPrices(
  items: OrderItem[],
  taxRate: number = TAX_RATE,
  shippingCost: number = 0
): Promise<OrderCalculation | PriceCalculationError> {
  try {
    if (!items || items.length === 0) {
      return {
        error: "Order must contain at least one item",
      };
    }

    // Validate all items upfront
    for (const item of items) {
      if (!item.productId || item.quantity <= 0) {
        return {
          error: "Invalid item in order",
          details: { productId: item.productId, quantity: item.quantity },
        };
      }
    }

    // ========================================
    // BATCH QUERY: Fetch all products in one query
    // Fixes N+1 problem (was: 1 query per item)
    // ========================================
    const productIds = items.map(item => item.productId);
    const fetchedProducts = await db
      .select({
        id: products.id,
        name: products.name,
        imageSrc: products.imageSrc,
        priceRegular: products.priceRegular,
        priceSale: products.priceSale,
        stockQuantity: products.stockQuantity,
        trackInventory: products.trackInventory,
      })
      .from(products)
      .where(inArray(products.id, productIds));

    // Build a lookup map for O(1) access
    const productMap = new Map(fetchedProducts.map(p => [p.id, p]));

    const calculatedItems: CalculatedOrderItem[] = [];
    let subtotal = 0;

    for (const item of items) {
      const product = productMap.get(item.productId);

      if (!product) {
        return {
          error: "Product not found",
          details: { productId: item.productId },
        };
      }

      // Check stock availability
      if (product.trackInventory) {
        const availableStock = product.stockQuantity || 0;
        if (availableStock < item.quantity) {
          return {
            error: "Insufficient stock",
            details: {
              productName: product.name,
              requested: item.quantity,
              available: availableStock,
            },
          };
        }
      }

      // Calculate actual price (use sale price if available)
      const actualPrice = product.priceSale
        ? parseFloat(product.priceSale)
        : parseFloat(product.priceRegular);

      if (isNaN(actualPrice) || actualPrice < 0) {
        return {
          error: "Invalid product price",
          details: { productId: item.productId, productName: product.name },
        };
      }

      const itemTotal = actualPrice * item.quantity;
      subtotal += itemTotal;

      calculatedItems.push({
        productId: product.id,
        productName: product.name,
        productImage: product.imageSrc,
        quantity: item.quantity,
        price: actualPrice,
        total: itemTotal,
      });
    }

    // Calculate tax and total
    const tax = subtotal * taxRate;
    const total = subtotal + tax + shippingCost;

    return {
      items: calculatedItems,
      subtotal: Math.round(subtotal * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      taxRate,
      shippingCost: Math.round(shippingCost * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  } catch (error) {
    console.error("❌ Price calculation error:", error);
    return {
      error: "Failed to calculate order prices",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Validate that client-provided prices match server calculation
 * Use this to detect tampering attempts
 */
export function validateClientPrices(
  clientTotal: number,
  serverCalculation: OrderCalculation,
  tolerance: number = 0.01 // Allow 1 cent difference for rounding
): boolean {
  const difference = Math.abs(clientTotal - serverCalculation.total);
  return difference <= tolerance;
}
