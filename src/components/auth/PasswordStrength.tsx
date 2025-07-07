
'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface PasswordStrengthProps {
  password?: string;
}

type StrengthLevel = 'Too Weak' | 'Weak' | 'Medium' | 'Strong';

export function PasswordStrength({ password = '' }: PasswordStrengthProps) {
  const [strength, setStrength] = useState<StrengthLevel>('Too Weak');
  const [level, setLevel] = useState(0);

  useEffect(() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (password.length > 0 && password.length < 8) {
      setLevel(1);
      setStrength('Too Weak');
    } else if (score <= 2 && password.length >= 8) {
      setLevel(2);
      setStrength('Weak');
    } else if (score <= 4 && password.length >= 8) {
      setLevel(3);
      setStrength('Medium');
    } else if (score >= 5 && password.length >= 8) {
      setLevel(4);
      setStrength('Strong');
    } else {
      setLevel(0);
      setStrength('Too Weak');
    }
  }, [password]);

  if (!password) {
    return null; // Don't show the component if there's no password
  }

  return (
    <div className="space-y-1">
      <div className="grid grid-cols-4 gap-x-2">
        <div className={cn('h-1 rounded-full', level >= 1 ? (level === 1 ? 'bg-red-500' : 'bg-green-500') : 'bg-muted')}></div>
        <div className={cn('h-1 rounded-full', level >= 2 ? (level === 2 ? 'bg-yellow-500' : 'bg-green-500') : 'bg-muted')}></div>
        <div className={cn('h-1 rounded-full', level >= 3 ? 'bg-green-500' : 'bg-muted')}></div>
        <div className={cn('h-1 rounded-full', level >= 4 ? 'bg-green-500' : 'bg-muted')}></div>
      </div>
      <p className={cn('text-xs', 
        level === 1 ? 'text-red-500' :
        level === 2 ? 'text-yellow-500' :
        level >= 3 ? 'text-green-500' :
        'text-muted-foreground'
      )}>
        {strength}
      </p>
    </div>
  );
}
