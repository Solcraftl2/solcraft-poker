
// @ts-nocheck
'use client';

import { useState, useEffect, type FormEvent, type ChangeEvent, useRef } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { mockInvestments, mockUserProfile, mockInvestmentTiers } from "@/lib/mock-data";
import { InvestmentHistoryCard } from "@/components/dashboard/investment-history-card";
import { Edit3, Mail, CalendarDays, DollarSign, TrendingUp, Wallet, CheckCircle, Copy, Loader2, Save, Upload, X, Crown, Activity as TierActivity, Info } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ConnectWalletDialog } from "@/components/shared/connect-wallet-dialog";
import { useWallet } from "@/contexts/WalletContext";
import type { UserProfile, InvestmentTier } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { auth, db, storage } from "@/lib/firebase"; // Import storage
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage"; // Import storage functions
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isConnectWalletOpen, setIsConnectWalletOpen] = useState(false);
  
  const [editableName, setEditableName] = useState("");
  const [editableBio, setEditableBio] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [currentTierDetails, setCurrentTierDetails] = useState<InvestmentTier | null>(null);

  // Hook per il wallet Web3
  const { 
    connected: walletConnected, 
    walletAddress: walletContextAddress, 
    walletName: walletContextName,
    balance: walletBalance,
    disconnect: walletDisconnect 
  } = useWallet();

  const avatarInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setAuthUser(currentUser);
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const profileData = userDocSnap.data() as UserProfile;
            setUserProfile(profileData);
            setEditableName(profileData.name || profileData.username || "");
            setEditableBio(profileData.bio || "");
            if (profileData.currentInvestmentTierName) {
              const tier = mockInvestmentTiers.find(t => t.name === profileData.currentInvestmentTierName);
              setCurrentTierDetails(tier || null);
            }
          } else {
            const username = currentUser.email?.split('@')[0] || 'new_user';
            const basicProfile: UserProfile = {
              ...mockUserProfile, 
              uid: currentUser.uid,
              email: currentUser.email || '',
              username: username,
              name: currentUser.displayName || username,
              joinedDate: currentUser.metadata.creationTime || new Date().toISOString(),
              avatarUrl: currentUser.photoURL || mockUserProfile.avatarUrl,
              followersCount: 0,
              followingCount: 0,
              totalInvested: 0,
              overallReturn: 0,
              ranking: undefined,
              bio: "",
              currentInvestmentTierName: "Bronze Access", // Default tier
            };
            setUserProfile(basicProfile);
            setEditableName(basicProfile.name);
            setEditableBio(basicProfile.bio || "");
            const tier = mockInvestmentTiers.find(t => t.name === basicProfile.currentInvestmentTierName);
            setCurrentTierDetails(tier || null);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          toast({ title: "Error", description: "Could not load user profile.", variant: "destructive" });
          setUserProfile(mockUserProfile); 
          setEditableName(mockUserProfile.name);
          setEditableBio(mockUserProfile.bio || "");
           const tier = mockInvestmentTiers.find(t => t.name === mockUserProfile.currentInvestmentTierName);
           setCurrentTierDetails(tier || null);
        }
      } else {
        setAuthUser(null);
        setUserProfile(null);
        setCurrentTierDetails(null);
        router.push('/login'); 
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [router, toast]);

  const handleConnectWallet = async (selectedWalletName: string) => {
    // Questa funzione ora è gestita direttamente dal ConnectWalletDialog
    // Manteniamo per compatibilità ma non fa nulla
    console.log('handleConnectWallet chiamato con:', selectedWalletName);
  };

  const handleDisconnectWallet = async () => {
    if (!authUser || !userProfile) return;
    
    try {
      // Disconnetti dal WalletContext
      await walletDisconnect();
      
      // Aggiorna il profilo utente
      const updatedProfile = {
        ...userProfile,
        isWalletConnected: false,
        walletAddress: mockUserProfile.walletAddress 
      };
      setUserProfile(updatedProfile);
      
      // Salva su Firebase
      await setDoc(doc(db, "users", authUser.uid), { 
        walletAddress: mockUserProfile.walletAddress, 
        isWalletConnected: false 
      }, { merge: true });
      
      toast({ 
        title: "Wallet Disconnesso", 
        description: "Il wallet è stato disconnesso con successo.", 
        variant: "default"
      });
    } catch (error) {
      console.error("Errore disconnessione wallet:", error);
      toast({ 
        title: "Errore Disconnessione", 
        description: "Impossibile disconnettere il wallet.", 
        variant: "destructive"
      });
    }
  };

  const handleCopyAddress = () => {
    const addressToCopy = walletContextAddress || userProfile?.walletAddress;
    if (addressToCopy) {
      navigator.clipboard.writeText(addressToCopy)
        .then(() => {
          toast({ title: "Indirizzo Copiato!", description: addressToCopy });
        })
        .catch(err => {
          toast({ title: "Errore Copia", description: "Impossibile copiare l'indirizzo.", variant: "destructive" });
        });
    }
  };
  
  const handleSaveName = async () => {
    if (!authUser || !userProfile) return;

    const trimmedName = editableName.trim();
    if (!trimmedName) {
      toast({
        title: "Validation Error",
        description: "Name cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    if (trimmedName.length > 50) {
      toast({
        title: "Validation Error",
        description: "Name cannot exceed 50 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsSavingProfile(true);
    try {
      await setDoc(doc(db, "users", authUser.uid), { name: trimmedName }, { merge: true });
      setUserProfile(prev => prev ? {...prev, name: trimmedName} : null);
      toast({ title: "Name Updated", description: "Your name has been saved." });
      setIsEditingName(false);
    } catch (error) {
      console.error("Error updating name:", error);
      toast({ title: "Error", description: "Could not update name.", variant: "destructive" });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveBio = async () => {
    if (!authUser || !userProfile) return;

    if (editableBio.length > 500) {
      toast({
        title: "Validation Error",
        description: "Bio cannot exceed 500 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsSavingProfile(true);
    try {
      await setDoc(doc(db, "users", authUser.uid), { bio: editableBio }, { merge: true });
      setUserProfile(prev => prev ? {...prev, bio: editableBio} : null);
      toast({ title: "Bio Updated", description: "Your bio has been saved." });
      setIsEditingBio(false);
    } catch (error) {
      console.error("Error updating bio:", error);
      toast({ title: "Error", description: "Could not update bio.", variant: "destructive" });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAvatarFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    const file = event.target.files[0];
    if (!authUser) {
      toast({ title: "Not Authenticated", description: "You must be logged in to upload an avatar.", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({ title: "File too large", description: "Avatar image must be less than 5MB.", variant: "destructive" });
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const avatarFilePath = `avatars/${authUser.uid}/${file.name}`;
      const fileRef = storageRef(storage, avatarFilePath);
      await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(fileRef);

      await setDoc(doc(db, "users", authUser.uid), { avatarUrl: downloadURL }, { merge: true });
      setUserProfile(prev => prev ? { ...prev, avatarUrl: downloadURL } : null);
      toast({ title: "Avatar Updated", description: "Your new avatar has been saved." });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({ title: "Upload Failed", description: "Could not upload your avatar. Please try again.", variant: "destructive" });
    } finally {
      setIsUploadingAvatar(false);
      if(avatarInputRef.current) {
        avatarInputRef.current.value = ""; // Reset file input
      }
    }
  };


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading profile...</p>
      </div>
    );
  }

  if (!userProfile) {
    return (
         <div className="flex justify-center items-center h-screen">
            <p className="text-lg text-muted-foreground">User profile not available. You might be logged out.</p>
         </div>
    );
  }

  const profileNameDisplay = userProfile.name || userProfile.username || "User";
  const profileUsername = userProfile.username || "username";
  const profileAvatarUrl = userProfile.avatarUrl || `https://placehold.co/100x100.png?text=${profileNameDisplay.substring(0,1).toUpperCase()}`;
  const profileBioDisplay = userProfile.bio || "No bio available. Click to edit.";
  const profileJoinedDate = userProfile.joinedDate ? format(parseISO(userProfile.joinedDate), "MMMM d, yyyy") : "N/A";
  const profileEmail = userProfile.email || "No email available";


  return (
    <>
      <PageHeader
        title="My Profile"
        description="Manage your account details and view your investment portfolio."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="items-center text-center">
              <div className="relative group">
                <Avatar className="h-24 w-24 mb-2 border-4 border-primary group-hover:opacity-75 transition-opacity">
                  <AvatarImage src={profileAvatarUrl} alt={profileNameDisplay} data-ai-hint="profile picture" />
                  <AvatarFallback>{profileNameDisplay.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute bottom-2 right-2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-background"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  aria-label="Upload new avatar"
                >
                  {isUploadingAvatar ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                </Button>
                <input
                  type="file"
                  ref={avatarInputRef}
                  onChange={handleAvatarFileChange}
                  accept="image/png, image/jpeg, image/gif"
                  className="hidden"
                  disabled={isUploadingAvatar}
                />
              </div>

              {isEditingName ? (
                <div className="flex items-center gap-2 w-full max-w-xs mx-auto">
                  <Input
                    value={editableName}
                    onChange={(e) => setEditableName(e.target.value)}
                    className="text-center text-2xl font-headline"
                    disabled={isSavingProfile}
                  />
                  <Button onClick={handleSaveName} size="icon" disabled={isSavingProfile}>
                    {isSavingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  </Button>
                  <Button onClick={() => { setIsEditingName(false); setEditableName(userProfile.name || ""); }} variant="ghost" size="icon" disabled={isSavingProfile}>
                     <X className="h-4 w-4"/>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 justify-center group">
                  <CardTitle className="font-headline text-2xl cursor-pointer group-hover:text-primary" onClick={() => setIsEditingName(true)}>{profileNameDisplay}</CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => setIsEditingName(true)} className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <CardDescription>@{profileUsername}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
               <div>
                {isEditingBio ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editableBio}
                      onChange={(e) => setEditableBio(e.target.value)}
                      placeholder="Tell us about yourself..."
                      rows={3}
                      disabled={isSavingProfile}
                    />
                    <div className="flex justify-end gap-2">
                       <Button onClick={() => { setIsEditingBio(false); setEditableBio(userProfile.bio || ""); }} variant="ghost" size="sm" disabled={isSavingProfile}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveBio} size="sm" disabled={isSavingProfile}>
                        {isSavingProfile ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />} Save Bio
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 group">
                    <p className="text-muted-foreground italic flex-grow cursor-pointer group-hover:text-foreground whitespace-pre-wrap min-h-[40px]" onClick={() => setIsEditingBio(true)}>
                      {profileBioDisplay}
                    </p>
                    <Button variant="ghost" size="icon" onClick={() => setIsEditingBio(true)} className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                       <Edit3 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex items-center pt-2">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{profileEmail}</span>
              </div>
              <div className="flex items-center">
                <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>Joined: {profileJoinedDate}</span>
              </div>

              {walletConnected && walletContextAddress ? (
                <div className="pt-2">
                    <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-md text-center">
                        <div className="flex items-center justify-center mb-1">
                            <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                            <span className="font-semibold text-green-500">Wallet Connesso</span>
                        </div>
                        <div className="flex items-center justify-center text-xs text-muted-foreground mb-1">
                            <span>{walletContextAddress.length > 20 ? `${walletContextAddress.substring(0,10)}...${walletContextAddress.slice(-10)}` : walletContextAddress}</span>
                            <Button variant="ghost" size="icon" className="ml-1 h-6 w-6" onClick={handleCopyAddress}>
                                <Copy className="h-3 w-3" />
                            </Button>
                        </div>
                        {walletContextName && (
                          <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                            {walletContextName}
                          </div>
                        )}
                        {walletBalance !== null && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Balance: {walletBalance.toFixed(4)} SOL
                          </div>
                        )}
                    </div>
                    <Button className="w-full mt-2" variant="outline" onClick={handleDisconnectWallet}>
                        Disconnetti Wallet
                    </Button>
                </div>
              ) : (
                <>
                    <Button className="w-full mt-4" variant="default" onClick={() => setIsConnectWalletOpen(true)}>
                        <Wallet className="mr-2 h-4 w-4" /> Connetti Wallet
                    </Button>
                    <p className="text-xs text-muted-foreground text-center mt-2">Wallet non connesso. Connetti per gestire fondi e firmare transazioni.</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-headline">My Investment Tier</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {currentTierDetails ? (
                <>
                  <div className="flex items-center justify-between">
                     <div className="flex items-center">
                        <Crown className="h-5 w-5 mr-2 text-primary" />
                        <span className="text-lg font-semibold text-foreground">{currentTierDetails.name}</span>
                     </div>
                     <Badge variant={
                        currentTierDetails.riskLevel === 'Low' ? 'secondary' :
                        currentTierDetails.riskLevel === 'Medium' ? 'default' :
                        'destructive'
                     }
                     className={
                        currentTierDetails.riskLevel === 'Low' ? 'bg-green-500/20 text-green-500 border-green-500/30' :
                        currentTierDetails.riskLevel === 'Medium' ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' :
                        'bg-red-500/20 text-red-500 border-red-500/30'
                     }
                     >
                        {currentTierDetails.riskLevel} Risk
                     </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{currentTierDetails.description}</p>
                  <div className="text-sm space-y-1 pt-2">
                      <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>Platform Fee: {currentTierDetails.platformFeePercentage}% on winnings</span>
                      </div>
                      <div className="flex items-center">
                          <Info className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{currentTierDetails.priorityDescription}</span>
                      </div>
                  </div>
                  <p className="text-xs text-muted-foreground pt-3">
                    Your tier may change based on investment volume, ROI, and activity.
                  </p>
                </>
              ) : (
                <p className="text-muted-foreground">Investment tier information not available.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Followers:</span>
                <span className="font-semibold">{(userProfile.followersCount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Following:</span>
                <span className="font-semibold">{(userProfile.followingCount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Invested:</span>
                <span className="font-semibold">${(userProfile.totalInvested || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Overall Return:</span>
                <span className={`font-semibold ${(userProfile.overallReturn || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {(userProfile.overallReturn || 0).toFixed(2)}%
                </span>
              </div>
              {userProfile.ranking && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Global Rank:</span>
                  <span className="font-semibold">#{userProfile.ranking}</span>
                </div>
              )}
               {!userProfile.ranking && (userProfile.followersCount === 0 && userProfile.totalInvested === 0) && (
                <p className="text-xs text-muted-foreground text-center pt-2">Stats will update as you engage with the platform.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <InvestmentHistoryCard investments={mockInvestments} limit={10} />
        </div>
      </div>
      <ConnectWalletDialog
        open={isConnectWalletOpen}
        onOpenChange={setIsConnectWalletOpen}
        onConnect={handleConnectWallet}
      />
    </>
  );
}
