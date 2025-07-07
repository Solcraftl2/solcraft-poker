
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, type FormEvent, useEffect } from 'react';
import { UserPlus, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, GithubAuthProvider, type User, sendEmailVerification } from 'firebase/auth';
import { auth, db, firebaseConfig } from '@/lib/firebase';
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useToast } from '@/hooks/use-toast';
import type { UserProfile } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
import { PasswordStrength } from '@/components/auth/PasswordStrength';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 1.9-4.72 1.9-4.42 0-7.92-3.6-7.92-8s3.5-8 7.92-8c2.34 0 3.86.92 4.72 1.73l2.54-2.54C18.27 1.28 15.87 0 12.48 0 5.88 0 .02 5.88.02 12s5.86 12 12.46 12c3.34 0 5.76-1.18 7.6-3.02 1.9-1.9 2.54-4.62 2.54-7.52 0-.76-.07-1.5-.2-2.24H12.48z" />
    </svg>
);

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
    </svg>
);


export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    const isPasswordMatch = password === confirmPassword && password !== '';
    const isPasswordStrong = password.length >= 8; // Simple strength check
    setIsFormValid(email !== '' && isPasswordMatch && isPasswordStrong && termsAccepted);
  }, [email, password, confirmPassword, termsAccepted]);


  const createInitialUserProfile = async (firebaseUser: User, referral?: string) => {
    if (!firebaseUser.email) {
      console.error("User email is null, cannot create profile.");
      toast({ title: 'Profile Creation Issue', description: 'Could not create user profile due to missing email.', variant: 'destructive' });
      return;
    }
    const username = firebaseUser.email.split('@')[0];
    const userProfileData: UserProfile = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      username: username,
      name: firebaseUser.displayName || username,
      joinedDate: firebaseUser.metadata.creationTime || new Date().toISOString(),
      avatarUrl: firebaseUser.photoURL || '',
      bio: '',
      isWalletConnected: false,
      walletAddress: '',
      balance: { amount: 0, currency: 'USD' },
      followersCount: 0,
      followingCount: 0,
      totalInvested: 0,
      overallReturn: 0,
      ranking: null,
      currentInvestmentTierName: "Bronze Access",
      id: firebaseUser.uid,
      ...(referral && { referralCode: referral }),
    };

    try {
      await setDoc(doc(db, "users", firebaseUser.uid), userProfileData);
    } catch (error) {
      console.error("Error creating user profile in Firestore:", error);
      toast({ title: 'Profile Creation Failed', description: 'Your account was created, but we failed to save your profile info.', variant: 'destructive' });
    }
  };

  const handleSocialSignup = async (providerName: 'google' | 'github') => {
    setIsLoading(true);
    const provider = providerName === 'google' ? new GoogleAuthProvider() : new GithubAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
            await createInitialUserProfile(user);
            toast({ title: 'Account Created!', description: `Welcome to SolCraft, ${user.displayName || 'friend'}!` });
        } else {
            toast({ title: 'Login Successful!', description: `Welcome back, ${user.displayName || 'friend'}!` });
        }
        router.push('/dashboard');
    } catch (error: any) {
        console.error(`${providerName} signup error:`, error);
        toast({ title: 'Sign Up Failed', description: error.message, variant: 'destructive' });
    } finally {
        setIsLoading(false);
    }
  };

  const handleEmailSignup = async (event: FormEvent) => {
    event.preventDefault();

    // Demo mode check
    if (firebaseConfig.apiKey.startsWith("AIzaSyC...")) {
        toast({ title: 'Demo Mode', description: 'Signup is disabled. Redirecting to dashboard.' });
        router.push('/dashboard');
        return;
    }

    if (!isFormValid) {
      toast({ title: 'Signup Failed', description: "Please complete all required fields and accept the terms.", variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      await createInitialUserProfile(userCredential.user, referralCode);
      toast({ title: 'Signup Successful!', description: 'Your account has been created. Please check your email to verify your account.' });
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Signup error:', error);
      let errorMessage = 'Failed to create account. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please try logging in instead.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
      }
      toast({ title: 'Signup Failed', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 font-body">
      <Card className="w-full max-w-md shadow-xl border-border">
        <CardHeader className="space-y-2 text-center">
          <Image 
            src="/solcraft-logo.png"
            alt="SolCraft Logo" 
            width={128} 
            height={128} 
            className="mx-auto mb-4 rounded-full"
            data-ai-hint="logo brand"
            priority
          />
          <CardTitle className="text-3xl font-headline text-foreground">Create an Account</CardTitle>
          <CardDescription className="text-muted-foreground">Join SolCraft to manage your crypto assets seamlessly.</CardDescription>
        </CardHeader>
        <CardContent className="pt-2 pb-6 px-6">
            <div className="flex flex-col gap-6">
                <form onSubmit={handleEmailSignup} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} />
                        <PasswordStrength password={password} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input id="confirmPassword" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={isLoading} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="referralCode">Referral Code (Optional)</Label>
                        <Input id="referralCode" type="text" placeholder="Enter referral code" value={referralCode} onChange={(e) => setReferralCode(e.target.value)} disabled={isLoading} />
                    </div>
                    <div className="flex items-start space-x-2 pt-2">
                        <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(checked) => setTermsAccepted(checked as boolean)} disabled={isLoading} />
                        <Label htmlFor="terms" className="text-xs text-muted-foreground font-normal">
                            I agree to the SolCraft <Link href="/terms-of-service" className="underline hover:text-primary">Terms of Service</Link> and <Link href="/privacy-policy" className="underline hover:text-primary">Privacy Policy</Link>.
                        </Label>
                    </div>

                    <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={!isFormValid || isLoading}>
                        {isLoading ? <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <UserPlus className="mr-2 h-5 w-5" />}
                        Create Account
                    </Button>
                </form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                    </div>
                </div>
            
                <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="h-11 text-base" onClick={() => handleSocialSignup('google')} disabled={isLoading}>
                        <GoogleIcon className="mr-2 h-5 w-5" /> Google
                    </Button>
                    <Button variant="outline" className="h-11 text-base" onClick={() => handleSocialSignup('github')} disabled={isLoading}>
                        <GithubIcon className="mr-2 h-5 w-5" /> GitHub
                    </Button>
                </div>

                <div className="text-center text-sm">
                    <p className="text-muted-foreground">
                    Already have an account?{' '}
                    <Link href="/login" className="font-medium text-primary hover:text-primary/80 hover:underline">Login</Link>
                    </p>
                </div>
                 <div className="flex items-start text-xs text-muted-foreground p-3 bg-muted/50 rounded-lg">
                    <Info className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Please note: For regulatory compliance, we may require Know Your Customer (KYC) identity verification for certain features or withdrawal limits in the future.</span>
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
