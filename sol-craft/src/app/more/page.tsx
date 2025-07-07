
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutGrid } from "lucide-react";

export default function MorePage() {
  return (
    <>
      <PageHeader
        title="More Features"
        description="Explore additional tools and resources. This section is currently under development."
      />
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">More To Explore</CardTitle>
          <CardDescription>
            Discover additional utilities, settings, and platform features.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <LayoutGrid className="w-16 h-16 mb-4" />
          <p className="text-lg">More Features page coming soon!</p>
        </CardContent>
      </Card>
    </>
  );
}
