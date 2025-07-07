'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { 
  Menu, 
  Home, 
  Trophy, 
  Wallet, 
  BarChart3,
  Settings,
  Users,
  MessageCircle,
  Phone,
  Tablet,
  Monitor
} from 'lucide-react';

interface MobileNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
}

interface TouchGestureProps {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onTap?: () => void;
  onLongPress?: () => void;
  children: React.ReactNode;
}

// Hook for detecting device type
function useDeviceType() {
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setDeviceType('mobile');
      } else if (width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    checkDeviceType();
    window.addEventListener('resize', checkDeviceType);
    return () => window.removeEventListener('resize', checkDeviceType);
  }, []);

  return deviceType;
}

// Hook for touch gestures
function useTouchGestures({ onSwipeLeft, onSwipeRight, onTap, onLongPress }: Omit<TouchGestureProps, 'children'>) {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    });

    // Start long press timer
    if (onLongPress) {
      const timer = setTimeout(() => {
        onLongPress();
      }, 500);
      setLongPressTimer(timer);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }

    if (!touchStart) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    const deltaTime = Date.now() - touchStart.time;

    // Check for swipe gestures
    const minSwipeDistance = 50;
    const maxSwipeTime = 300;

    if (Math.abs(deltaX) > minSwipeDistance && deltaTime < maxSwipeTime) {
      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    } else if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10 && deltaTime < 200 && onTap) {
      // Tap gesture
      onTap();
    }

    setTouchStart(null);
  };

  return { handleTouchStart, handleTouchEnd };
}

// Touch gesture wrapper component
function TouchGesture({ children, onSwipeLeft, onSwipeRight, onTap, onLongPress }: TouchGestureProps) {
  const { handleTouchStart, handleTouchEnd } = useTouchGestures({
    onSwipeLeft,
    onSwipeRight,
    onTap,
    onLongPress
  });

  return (
    <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {children}
    </div>
  );
}

// Mobile navigation component
function MobileNav({ currentPage, onNavigate }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'tournaments', label: 'Tournaments', icon: Trophy },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <>
      {/* Mobile bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 md:hidden">
        <div className="grid grid-cols-5 h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                  isActive 
                    ? 'text-primary bg-primary/10' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile header with hamburger menu */}
      <div className="flex items-center justify-between p-4 bg-background border-b border-border md:hidden">
        <h1 className="text-xl font-bold">SolCraft Poker</h1>
        
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
              <SheetDescription>
                Navigate through SolCraft Poker
              </SheetDescription>
            </SheetHeader>
            
            <div className="mt-6 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

// Responsive layout component
function ResponsiveLayout({ children, sidebar, header }: ResponsiveLayoutProps) {
  const deviceType = useDeviceType();

  if (deviceType === 'mobile') {
    return (
      <div className="min-h-screen bg-background">
        {header}
        <main className="pb-20"> {/* Space for bottom navigation */}
          {children}
        </main>
        {sidebar && (
          <Drawer>
            <DrawerTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="fixed top-4 right-4 z-40"
              >
                <Users className="w-4 h-4" />
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Game Info</DrawerTitle>
                <DrawerDescription>
                  Tournament details and player information
                </DrawerDescription>
              </DrawerHeader>
              <div className="p-4">
                {sidebar}
              </div>
            </DrawerContent>
          </Drawer>
        )}
      </div>
    );
  }

  if (deviceType === 'tablet') {
    return (
      <div className="min-h-screen bg-background">
        {header}
        <div className="flex">
          <main className="flex-1">
            {children}
          </main>
          {sidebar && (
            <aside className="w-80 border-l border-border p-4">
              {sidebar}
            </aside>
          )}
        </div>
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="min-h-screen bg-background">
      {header}
      <div className="flex">
        {sidebar && (
          <aside className="w-80 border-r border-border p-4">
            {sidebar}
          </aside>
        )}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

// Mobile-optimized poker table
function MobilePokerTable() {
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [showActions, setShowActions] = useState(false);

  return (
    <div className="p-4 space-y-4">
      {/* Community cards - horizontal scroll on mobile */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-center">Community Cards</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 justify-center overflow-x-auto pb-2">
            {[1, 2, 3, 4, 5].map((card) => (
              <div key={card} className="min-w-[48px] h-16 bg-white border border-gray-300 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-xs">A♠</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pot and game info */}
      <div className="grid grid-cols-3 gap-2">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-sm text-muted-foreground">Pot</p>
            <p className="text-lg font-bold">$1,250</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-sm text-muted-foreground">Players</p>
            <p className="text-lg font-bold">6/8</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-sm text-muted-foreground">Time</p>
            <p className="text-lg font-bold">0:25</p>
          </CardContent>
        </Card>
      </div>

      {/* Players - vertical list on mobile */}
      <div className="space-y-2">
        {[1, 2, 3, 4, 5, 6].map((player) => (
          <TouchGesture
            key={player}
            onTap={() => setSelectedPlayer(`player-${player}`)}
          >
            <Card className={`transition-all ${selectedPlayer === `player-${player}` ? 'ring-2 ring-primary' : ''}`}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      P{player}
                    </div>
                    <div>
                      <p className="font-medium">Player {player}</p>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="text-xs px-1 py-0">D</Badge>
                        {player === 1 && <Badge variant="secondary" className="text-xs px-1 py-0">You</Badge>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">$15,000</p>
                    <p className="text-xs text-muted-foreground">chips</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TouchGesture>
        ))}
      </div>

      {/* Action buttons - fixed at bottom */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-background border-t border-border">
        <div className="flex gap-2">
          <Button variant="destructive" className="flex-1">
            Fold
          </Button>
          <Button variant="outline" className="flex-1">
            Check
          </Button>
          <Button className="flex-1">
            Call $200
          </Button>
        </div>
        
        <div className="flex gap-2 mt-2">
          <input
            type="range"
            min="200"
            max="15000"
            className="flex-1"
          />
          <Button variant="outline">
            Bet
          </Button>
        </div>
      </div>
    </div>
  );
}

// Device type indicator (for development/testing)
function DeviceTypeIndicator() {
  const deviceType = useDeviceType();
  
  const getIcon = () => {
    switch (deviceType) {
      case 'mobile': return <Phone className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      case 'desktop': return <Monitor className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed top-4 left-4 z-50">
      <Badge variant="outline" className="flex items-center gap-1">
        {getIcon()}
        {deviceType}
      </Badge>
    </div>
  );
}

export {
  MobileNav,
  ResponsiveLayout,
  TouchGesture,
  MobilePokerTable,
  DeviceTypeIndicator,
  useDeviceType,
  useTouchGestures
};

