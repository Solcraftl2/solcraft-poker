import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { KeyMetric } from "@/lib/types";
import { cn } from "@/lib/utils";

interface KeyMetricsCardProps {
  metrics: KeyMetric[];
  className?: string;
}

export function KeyMetricsCard({ metrics, className }: KeyMetricsCardProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="text-sm font-medium uppercase text-muted-foreground">Key Metrics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {metrics.map((metric) => (
          <div key={metric.id} className="flex items-center justify-between text-sm">
            <div className="flex items-center text-muted-foreground">
              <metric.icon className="h-4 w-4 mr-2" />
              <span>{metric.label}</span>
            </div>
            <span className={cn(
              "font-semibold",
              metric.valueClassName ? metric.valueClassName : "text-foreground"
            )}>
              {metric.value}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
