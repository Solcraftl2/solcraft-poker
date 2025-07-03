
import { PageHeader } from "@/components/shared/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Bell, Shield } from "lucide-react";
import { ProfileSettingsForm } from "@/components/settings/profile-settings-form";
import { NotificationSettingsForm } from "@/components/settings/notification-settings-form";
import { SecuritySettingsForm } from "@/components/settings/security-settings-form";


export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your account, notifications, and security preferences."
      />
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
            <ProfileSettingsForm />
        </TabsContent>
        <TabsContent value="notifications">
            <NotificationSettingsForm />
        </TabsContent>
        <TabsContent value="security">
            <SecuritySettingsForm />
        </TabsContent>
      </Tabs>
    </>
  );
}
