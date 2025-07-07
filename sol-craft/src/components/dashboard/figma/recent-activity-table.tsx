import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { RecentActivity } from "@/lib/types";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RecentActivityTableProps {
  activities: RecentActivity[];
  className?: string;
}

export function RecentActivityTable({ activities, className }: RecentActivityTableProps) {
  // Determine variant for ShadCN badge component (mostly for structural purposes, color is overridden)
  const getStatusVariant = (status: RecentActivity['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Completed': return 'secondary'; 
      case 'In Progress': return 'default'; 
      case 'Failed': return 'destructive'; 
      case 'Pending': return 'outline';
      default: return 'outline';
    }
  };
  
  // Custom class names for specific background/text colors based on image
  const getStatusClassNames = (status: RecentActivity['status']): string => {
    switch (status) {
      case 'Completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'In Progress': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'; // Matching the yellow/orange in image
      case 'Failed': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Pending': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'border-muted-foreground/30 text-muted-foreground';
    }
  }

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="text-sm font-medium uppercase text-muted-foreground">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Token Amt</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">View</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell className="font-medium text-foreground">{activity.type}</TableCell>
                <TableCell className="text-muted-foreground">{activity.date}</TableCell>
                <TableCell className="text-muted-foreground">{activity.time}</TableCell>
                <TableCell className="text-foreground">{activity.tokenAmount}</TableCell>
                <TableCell className="text-center">
                  <Badge variant={getStatusVariant(activity.status)} className={cn("text-xs", getStatusClassNames(activity.status))}>
                    {activity.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {activity.viewLink && (
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-primary hover:text-primary/80" asChild>
                      <Link href={activity.viewLink} target="_blank">
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
