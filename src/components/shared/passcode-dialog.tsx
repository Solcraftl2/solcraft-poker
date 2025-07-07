'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PasscodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>; // The parent handles the async logic
}

export function PasscodeDialog({ open, onOpenChange, onConfirm }: PasscodeDialogProps) {
  const [passcode, setPasscode] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleConfirmClick = async () => {
    // For demonstration, the correct passcode is hardcoded.
    // In a real app, this would be validated against a user-set code.
    if (passcode !== '1234') {
      setError('Incorrect passcode. Please try again.');
      return;
    }

    setError('');
    setIsConfirming(true);
    try {
      await onConfirm();
      // The parent component will handle closing the dialog on success
    } catch (e) {
        toast({
            title: 'An error occurred',
            description: 'The transaction could not be completed.',
            variant: 'destructive'
        })
    } finally {
        setIsConfirming(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 4) {
      setPasscode(value);
      setError('');
    }
  };
  
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
        // Reset state when dialog is closed
        setPasscode('');
        setError('');
        setIsConfirming(false);
    }
    onOpenChange(isOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center">
            <ShieldCheck className="mr-2 h-5 w-5 text-primary" />
            Confirm Transaction
          </DialogTitle>
          <DialogDescription>
            For your security, please enter your 4-digit passcode to authorize this transaction.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-2">
          <Label htmlFor="passcode">4-Digit Passcode</Label>
          <Input
            id="passcode"
            type="password"
            maxLength={4}
            value={passcode}
            onChange={handleInputChange}
            placeholder="••••"
            className="text-center text-2xl tracking-[0.5em]"
            disabled={isConfirming}
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button
            type="button"
            className="w-full"
            onClick={handleConfirmClick}
            disabled={isConfirming || passcode.length !== 4}
          >
            {isConfirming ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Confirm & Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
