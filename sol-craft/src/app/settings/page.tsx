import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your application preferences and account settings."
      />
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Application Settings</CardTitle>
          <CardDescription>
            This page is a placeholder for future settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <SettingsIcon className="w-16 h-16 mb-4" />
          <p className="text-lg">Settings page coming soon!</p>
        </CardContent>
      </Card>
    </>
  );
}
