
'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { LogOut, Menu, ChevronDown } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Image from "next/image";
import type { NavItem } from "@/lib/types";
import { 
  LayoutGrid,
  User, 
  Replace, 
  ArrowRightLeft, 
  Rocket, 
  Database, 
  Users as SocialIcon,
  HelpCircle, 
  Info,
  Settings,
  Trophy,
  MoreHorizontal
} from "lucide-react";

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { title: "Profile", href: "/profile", icon: User },
  { title: "Tournaments", href: "/tournaments", icon: Trophy },
  { title: "Swap", href: "/swap", icon: Replace },
  { title: "Deposit/Send", href: "/deposit-send", icon: ArrowRightLeft },
  { title: "Launchpad", href: "/launchtoken", icon: Rocket },
  { title: "Staking", href: "/staking", icon: Database },
  { title: "Community", href: "/social", icon: SocialIcon },
  { title: "Settings", href: "/settings", icon: Settings },
  { title: "Support", href: "/support", icon: HelpCircle },
  { title: "About", href: "/about", icon: Info },
  { title: "More", href: "/more", icon: MoreHorizontal },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut(auth);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      router.push('/login');
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout Failed",
        description: "Could not log you out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };
  
  const mainNavItems = navItems.slice(0, 7);
  const moreNavItems = navItems.slice(7);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-full items-center px-4 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
          <Image src="/solcraft-logo.png" width={128} height={32} alt="SolCraft Logo" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 text-sm font-medium">
          {mainNavItems.map((item) => (
            <Button asChild variant="ghost" key={item.href} className={cn("px-3", pathname.startsWith(item.href) && "bg-accent")}>
                <Link href={item.href}>{item.title}</Link>
            </Button>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost">
                    More <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
                {moreNavItems.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                        <Link href={item.href} className="flex items-center gap-2">
                            <item.icon className="h-4 w-4" />
                            {item.title}
                        </Link>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="flex flex-1 items-center justify-end space-x-2">
          <div className="hidden md:flex items-center">
            <Button variant="ghost" className="w-full justify-start" onClick={handleLogout} disabled={isLoggingOut}>
              {isLoggingOut ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <LogOut className="mr-2 h-4 w-4" />
              )}
              Logout
            </Button>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0">
                <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
                 <div className="flex h-full flex-col">
                    <div className="p-4 border-b">
                         <Link href="/dashboard" className="flex items-center space-x-2">
                            <Image src="/solcraft-logo.png" width={128} height={32} alt="SolCraft Logo" />
                        </Link>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                        <nav className="grid items-start text-sm font-medium gap-1">
                            {navItems.map((item) => (
                                <SheetClose asChild key={item.href}>
                                <Link
                                    href={item.href}
                                    className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                                    pathname.startsWith(item.href) && "bg-muted text-primary"
                                    )}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.title}
                                </Link>
                                </SheetClose>
                            ))}
                        </nav>
                    </div>
                    <div className="mt-auto p-4 border-t">
                        <Button variant="ghost" className="w-full justify-start" onClick={handleLogout} disabled={isLoggingOut}>
                            <LogOut className="mr-2 h-4 w-4" /> Logout
                        </Button>
                    </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
