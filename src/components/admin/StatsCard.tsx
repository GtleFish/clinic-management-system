import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number | string;
  unit?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "primary" | "success" | "warning" | "destructive";
}

export default function StatsCard({
  title,
  value,
  unit = "",
  icon,
  trend,
  color = "primary",
}: StatsCardProps) {
  const colorClasses = {
    primary: "text-primary border-primary/20 bg-primary/5",
    success: "text-green-600 border-green-200 bg-green-50",
    warning: "text-amber-600 border-amber-200 bg-amber-50",
    destructive: "text-red-600 border-red-200 bg-red-50",
  };

  const formatValue = (val: number | string) => {
    if (typeof val === "number") {
      // Format as currency if unit is currency
      if (unit.includes("đ") || unit.includes("VND")) {
        return new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
          minimumFractionDigits: 0,
        }).format(val);
      }
      // Format as number with thousand separators
      return new Intl.NumberFormat("vi-VN").format(val);
    }
    return val;
  };

  return (
    <Card className={`border ${colorClasses[color]}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">
          {formatValue(value)}
          {unit && <span className="ml-1 text-sm font-normal text-muted-foreground">{unit}</span>}
        </div>
        {trend && (
          <div className="mt-2 flex items-center gap-1 text-xs">
            {trend.isPositive ? (
              <>
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span className="text-green-600">+{trend.value}%</span>
              </>
            ) : (
              <>
                <TrendingDown className="h-3 w-3 text-red-600" />
                <span className="text-red-600">{trend.value}%</span>
              </>
            )}
            <span className="text-muted-foreground">so với tháng trước</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
