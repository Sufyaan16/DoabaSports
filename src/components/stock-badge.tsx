import { Badge } from "@/components/ui/badge";

interface StockBadgeProps {
  stockQuantity: number;
  lowStockThreshold: number;
  trackInventory: boolean;
  className?: string;
}

export function StockBadge({ 
  stockQuantity, 
  lowStockThreshold, 
  trackInventory,
  className 
}: StockBadgeProps) {
  if (!trackInventory) {
    return null;
  }

  if (stockQuantity === 0) {
    return (
      <Badge 
        variant="destructive" 
        className={className}
      >
        Out of Stock
      </Badge>
    );
  }

  if (stockQuantity <= lowStockThreshold) {
    return (
      <Badge 
        variant="secondary"
        className={`bg-orange-100 text-orange-800 hover:bg-orange-100 ${className}`}
      >
        Low Stock ({stockQuantity} left)
      </Badge>
    );
  }

  return (
    <Badge 
      variant="secondary"
      className={`bg-green-100 text-green-800 hover:bg-green-100 ${className}`}
    >
      In Stock
    </Badge>
  );
}
