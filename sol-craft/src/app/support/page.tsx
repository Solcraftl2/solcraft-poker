
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";

export default function SupportPage() {
  return (
    <>
      <PageHeader
        title="Support Center"
        description="Get help and find answers to your questions. This feature is currently under development."
      />
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Help & Support</CardTitle>
          <CardDescription>
            Find FAQs, troubleshooting guides, and contact information here.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <HelpCircle className="w-16 h-16 mb-4" />
          <p className="text-lg">Support page coming soon!</p>
        </CardContent>
      </Card>
    </>
  );
}
