
"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import type { UserProfile } from "@/lib/types";

interface MyBalanceCardProps {
  className?: string;
}

export function MyBalanceCard({ className }: MyBalanceCardProps) {
  const { toast } = useToast();
  // No longer need authUser state here as we directly use currentUser from onAuthStateChanged
  const [displayBalance, setDisplayBalance] = useState<{ amount: number; currency: string; walletAddress: string; }>({
    amount: 0,
    currency: 'USD',
    walletAddress: 'N/A'
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // setAuthUser(currentUser); // Not strictly needed if only using uid from currentUser
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const profileData = userDocSnap.data() as UserProfile;
            setDisplayBalance({
              amount: profileData.balance?.amount ?? 0,
              currency: profileData.balance?.currency ?? 'USD',
              walletAddress: profileData.walletAddress ?? 'Not Connected' // More descriptive default
            });
          } else {
            // This case should ideally not happen if profile is created on signup
            toast({ title: "Profile not found", description: "Could not load balance details. Please complete your profile.", variant: "destructive" });
             setDisplayBalance({ amount: 0, currency: 'USD', walletAddress: 'Not found' });
          }
        } catch (error) {
          console.error("Error fetching user balance:", error);
          toast({ title: "Error", description: "Could not load balance.", variant: "destructive" });
          setDisplayBalance({ amount: 0, currency: 'USD', walletAddress: 'Error loading' });
        }
      } else {
        // User is signed out
        setDisplayBalance({ amount: 0, currency: 'USD', walletAddress: 'N/A' });
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [toast]);

  const handleCopyAddress = () => {
    if (displayBalance.walletAddress && !['N/A', 'Loading...', 'Error loading', 'Not Connected', 'Not found'].includes(displayBalance.walletAddress)) {
      navigator.clipboard.writeText(displayBalance.walletAddress)
        .then(() => {
          toast({ title: "Wallet Address Copied!", description: displayBalance.walletAddress });
        })
        .catch(err => {
          toast({ title: "Failed to copy", description: "Could not copy address to clipboard.", variant: "destructive" });
        });
    } else {
        toast({ title: "No Address", description: "Wallet address not available to copy.", variant: "default" });
    }
  };

  if (isLoading) {
    return (
      <Card className={cn("flex flex-col items-center justify-center", className)} style={{minHeight: '160px'}}> {/* Increased minHeight slightly */}
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-sm text-muted-foreground">Loading Balance...</p>
      </Card>
    );
  }

  return (
    <Card className={cn(className)} style={{minHeight: '160px'}}> {/* Increased minHeight slightly */}
      <CardHeader>
        <CardTitle className="text-sm font-medium uppercase text-muted-foreground">My Balance</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-4xl font-bold text-foreground mb-2">
          ${displayBalance.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          <span className="text-lg ml-1 text-muted-foreground">{displayBalance.currency}</span>
        </p>
        <div className="flex items-center justify-center text-xs text-muted-foreground">
          <span>
            Wallet: {
            displayBalance.walletAddress.length > 20 ? 
            `${displayBalance.walletAddress.substring(0,6)}...${displayBalance.walletAddress.slice(-4)}` 
            : displayBalance.walletAddress
            }
          </span>
          {!['N/A', 'Loading...', 'Error loading', 'Not Connected', 'Not found'].includes(displayBalance.walletAddress) && (
            <Button variant="ghost" size="icon" className="ml-1 h-6 w-6" onClick={handleCopyAddress}>
              <Copy className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
