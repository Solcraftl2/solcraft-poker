
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getUserProfile, updateProfile } from "@/lib/actions/user.actions";

export function ProfileSettingsForm() {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [isSaving, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const profile = await getUserProfile(user.uid);
        if (profile) {
          setName(profile.name || '');
          setUsername(profile.username || '');
          setBio(profile.bio || '');
          setEmail(profile.email || '');
        }
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
        toast({ title: "Error", description: "You must be logged in to update your profile.", variant: "destructive"});
        return;
    }
    startTransition(async () => {
      const result = await updateProfile(currentUser.uid, { name, username, bio });
      if (result.success) {
        toast({
          title: "Profile Updated",
          description: "Your profile information has been successfully updated.",
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
                  <CardTitle>Public Profile</CardTitle>
                  <CardDescription>This is how others will see you on the site.</CardDescription>
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
          <CardTitle>Public Profile</CardTitle>
          <CardDescription>This is how others will see you on the site.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={isSaving} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} disabled={isSaving} />
            <p className="text-xs text-muted-foreground">This is your unique handle on SolCraft.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} disabled />
            <p className="text-xs text-muted-foreground">Your email is not displayed publicly.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={4} disabled={isSaving} />
            <p className="text-xs text-muted-foreground">A brief description of yourself.</p>
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
