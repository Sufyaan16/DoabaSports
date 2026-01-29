import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SectionCardsProps {
  stats: {
    totalProducts: number;
    productsTrend: number;
    totalRevenue: number;
    revenueTrend: number;
    newUsers: number;
    usersTrend: number;
    growthRate: number;
  };
}

export function SectionCards({ stats }: SectionCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getTrendIcon = (trend: number) => {
    return trend >= 0 ? IconTrendingUp : IconTrendingDown;
  };

  const getTrendVariant = (trend: number): "default" | "outline" => {
    return "outline";
  };

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* Total Products */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Products</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalProducts.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant={getTrendVariant(stats.productsTrend)}>
              {stats.productsTrend >= 0 ? <IconTrendingUp /> : <IconTrendingDown />}
              {formatPercentage(stats.productsTrend)}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.productsTrend >= 0 ? 'Growing inventory' : 'Inventory decreased'}{' '}
            {stats.productsTrend >= 0 ? <IconTrendingUp className="size-4" /> : <IconTrendingDown className="size-4" />}
          </div>
          <div className="text-muted-foreground">
            Products in catalog
          </div>
        </CardFooter>
      </Card>

      {/* Total Revenue */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Revenue</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatCurrency(stats.totalRevenue)}
          </CardTitle>
          <CardAction>
            <Badge variant={getTrendVariant(stats.revenueTrend)}>
              {stats.revenueTrend >= 0 ? <IconTrendingUp /> : <IconTrendingDown />}
              {formatPercentage(stats.revenueTrend)}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.revenueTrend >= 0 ? 'Revenue growing' : 'Revenue decreased'}{' '}
            {stats.revenueTrend >= 0 ? <IconTrendingUp className="size-4" /> : <IconTrendingDown className="size-4" />}
          </div>
          <div className="text-muted-foreground">
            Last 30 days performance
          </div>
        </CardFooter>
      </Card>

      {/* New Users */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>New Users</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.newUsers.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant={getTrendVariant(stats.usersTrend)}>
              {stats.usersTrend >= 0 ? <IconTrendingUp /> : <IconTrendingDown />}
              {formatPercentage(stats.usersTrend)}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.usersTrend >= 0 ? 'User acquisition up' : 'Acquisition down'}{' '}
            {stats.usersTrend >= 0 ? <IconTrendingUp className="size-4" /> : <IconTrendingDown className="size-4" />}
          </div>
          <div className="text-muted-foreground">
            New signups in last 30 days
          </div>
        </CardFooter>
      </Card>

      {/* Growth Rate */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Growth Rate</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatPercentage(stats.growthRate)}
          </CardTitle>
          <CardAction>
            <Badge variant={getTrendVariant(stats.growthRate)}>
              {stats.growthRate >= 0 ? <IconTrendingUp /> : <IconTrendingDown />}
              {formatPercentage(stats.growthRate)}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.growthRate >= 0 ? 'Positive growth trend' : 'Negative growth'}{' '}
            {stats.growthRate >= 0 ? <IconTrendingUp className="size-4" /> : <IconTrendingDown className="size-4" />}
          </div>
          <div className="text-muted-foreground">
            Month-over-month comparison
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
