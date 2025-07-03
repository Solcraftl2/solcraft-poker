
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useState, useTransition } from "react";
import { Loader2, KeyRound } from "lucide-react";
import { auth } from "@/lib/firebase";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";

export function SecuritySettingsForm() {
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }
    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "New password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
        const user = auth.currentUser;
        if (!user || !user.email) {
            toast({ title: "Error", description: "You must be logged in to change your password.", variant: "destructive" });
            return;
        }

        const credential = EmailAuthProvider.credential(user.email, currentPassword);

        try {
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);

            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            toast({
                title: "Password Updated",
                description: "Your password has been changed successfully.",
            });

        } catch (error: any) {
            console.error("Password update error:", error);
            let errorMessage = "Failed to update password. Please try again.";
            if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                errorMessage = "The current password you entered is incorrect.";
            }
            toast({
                title: "Update Failed",
                description: errorMessage,
                variant: "destructive",
            });
        }
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Manage your account security settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center"><KeyRound className="mr-2 h-5 w-5"/>Change Password</h3>
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input id="current-password" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required disabled={isSaving} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required disabled={isSaving} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input id="confirm-password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required disabled={isSaving} />
            </div>
          </div>
          <Separator />
          <div className="space-y-4">
             <h3 className="text-lg font-medium">Two-Factor Authentication (2FA)</h3>
             <p className="text-sm text-muted-foreground">
                Enhance your account security by enabling 2FA. (This feature is for demonstration purposes).
             </p>
             <Button variant="outline" disabled>Enable 2FA</Button>
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Password
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
