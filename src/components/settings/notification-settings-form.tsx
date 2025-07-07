
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { auth } from "@/lib/firebase";
import type { User } from "firebase/auth";
import { getUserProfile, updateNotificationSettings } from "@/lib/actions/user.actions";

type NotificationSettings = {
    investmentUpdates: boolean;
    newTournaments: boolean;
    socialActivity: boolean;
    platformNews: boolean;
};

const defaultSettings: NotificationSettings = {
    investmentUpdates: true,
    newTournaments: true,
    socialActivity: false,
    platformNews: true,
};

export function NotificationSettingsForm() {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [isSaving, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setCurrentUser(user);
        const profile = await getUserProfile(user.uid);
        if (profile && profile.notificationSettings) {
          setSettings(profile.notificationSettings);
        }
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);


  const handleSettingChange = (id: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
        toast({ title: "Error", description: "You must be logged in to update your settings.", variant: "destructive"});
        return;
    }
    startTransition(async () => {
        const result = await updateNotificationSettings(currentUser.uid, settings);
        if (result.success) {
            toast({
              title: "Notifications Updated",
              description: "Your notification preferences have been saved.",
            });
        } else {
            toast({
                title: "Update Failed",
                description: result.message,
                variant: "destructive"
            })
        }
    });
  };

  if (isLoading) {
      return (
          <Card>
              <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Manage how you receive notifications from SolCraft.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                 <Loader2 className="mx-auto h-8 w-8 animate-spin" />
              </CardContent>
          </Card>
      )
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Manage how you receive notifications from SolCraft.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="investmentUpdates" className="text-base">Investment Updates</Label>
              <p className="text-sm text-muted-foreground">
                Get notified about your active investments, payouts, and status changes.
              </p>
            </div>
            <Switch
              id="investmentUpdates"
              checked={settings.investmentUpdates}
              onCheckedChange={() => handleSettingChange('investmentUpdates')}
              disabled={isSaving}
            />
          </div>
          <div className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="newTournaments" className="text-base">New Tournaments & Launches</Label>
              <p className="text-sm text-muted-foreground">
                Receive alerts for new tournaments and token launches on the platform.
              </p>
            </div>
            <Switch
              id="newTournaments"
              checked={settings.newTournaments}
              onCheckedChange={() => handleSettingChange('newTournaments')}
              disabled={isSaving}
            />
          </div>
          <div className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="socialActivity" className="text-base">Social Activity</Label>
              <p className="text-sm text-muted-foreground">
                Notifications for new followers, mentions, and other social interactions.
              </p>
            </div>
            <Switch
              id="socialActivity"
              checked={settings.socialActivity}
              onCheckedChange={() => handleSettingChange('socialActivity')}
              disabled={isSaving}
            />
          </div>
          <div className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="platformNews" className="text-base">Platform News</Label>
              <p className="text-sm text-muted-foreground">
                Stay up-to-date with major platform announcements and updates.
              </p>
            </div>
            <Switch
              id="platformNews"
              checked={settings.platformNews}
              onCheckedChange={() => handleSettingChange('platformNews')}
              disabled={isSaving}
            />
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Preferences
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
