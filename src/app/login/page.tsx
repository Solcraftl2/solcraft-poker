
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, type FormEvent } from 'react';
import { LogIn, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, GithubAuthProvider, type User, setPersistence, browserSessionPersistence, browserLocalPersistence } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
import { ForgotPasswordDialog } from '@/components/auth/ForgotPasswordDialog';

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


export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const createInitialUserProfile = async (firebaseUser: User) => {
    if (!firebaseUser.email) return;
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
    };
    try {
        await setDoc(doc(db, "users", firebaseUser.uid), userProfileData);
    } catch (error) {
        console.error("Error creating user profile in Firestore:", error);
    }
  };

  const handleSocialLogin = async (providerName: 'google' | 'github') => {
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
        console.error(`${providerName} login error:`, error);
        toast({ title: 'Login Failed', description: error.message, variant: 'destructive' });
    } finally {
        setIsLoading(false);
    }
  };

  const handleEmailLogin = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(auth, persistence);
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: 'Login Successful!', description: 'Welcome back!' });
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'Failed to login. Please check your credentials.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      }
      toast({ title: 'Login Failed', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 font-body">
      <Card className="w-full max-w-md shadow-xl border-border">
        <CardHeader className="space-y-2 text-center">
          <Image 
            src="/solcraft-logo.png"
            alt="SolCraft Logo" 
            width={200} 
            height={50} 
            className="mx-auto mb-4"
            data-ai-hint="logo brand"
            priority
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/200x50.png'; (e.target as HTMLImageElement).alt = 'SolCraft Placeholder Logo';}}
          />
          <CardTitle className="text-3xl font-headline text-foreground">Welcome Back</CardTitle>
          <CardDescription className="text-muted-foreground">Login to continue to SolCraft.</CardDescription>
        </CardHeader>
        <CardContent className="pt-2 pb-6 px-6">
          <div className="flex flex-col gap-6">
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading}/>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Button variant="link" type="button" className="p-0 h-auto text-xs" onClick={() => setIsForgotPasswordOpen(true)}>
                        Forgot Password?
                    </Button>
                </div>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading}/>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="remember-me" checked={rememberMe} onCheckedChange={(checked) => setRememberMe(checked as boolean)} />
                <Label htmlFor="remember-me" className="text-sm font-normal text-muted-foreground">Remember me</Label>
              </div>
              <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={isLoading}>
                {isLoading ? <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <LogIn className="mr-2 h-5 w-5" />}
                Login
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
              <Button variant="outline" className="h-11 text-base" onClick={() => handleSocialLogin('google')} disabled={isLoading}>
                  <GoogleIcon className="mr-2 h-5 w-5" /> Google
              </Button>
              <Button variant="outline" className="h-11 text-base" onClick={() => handleSocialLogin('github')} disabled={isLoading}>
                  <GithubIcon className="mr-2 h-5 w-5" /> GitHub
              </Button>
            </div>

            <div className="text-center text-sm">
              <p className="text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="font-medium text-primary hover:text-primary/80 hover:underline">Sign Up</Link>
              </p>
              <p className="mt-2">
                  <Link href="/" className="text-xs text-muted-foreground hover:text-primary hover:underline">Back to Home</Link>
              </p>
            </div>
          </div>
        </CardContent>
         <CardFooter className="flex flex-col items-center justify-center text-center text-xs text-muted-foreground p-4 border-t">
            <ShieldCheck className="h-5 w-5 mb-1 text-primary"/>
            <p>We protect your account with 2FA and automatic account lockout policies. Your security is our priority.</p>
        </CardFooter>
      </Card>
    </div>
    <ForgotPasswordDialog open={isForgotPasswordOpen} onOpenChange={setIsForgotPasswordOpen} />
    </>
  );
}
