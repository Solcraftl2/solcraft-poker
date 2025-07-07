
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";
import { submitSupportTicket } from "@/lib/actions/support.actions";

export function ContactForm() {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSubmitting, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setFormData(prev => ({
          ...prev,
          name: user.displayName || '',
          email: user.email || '',
        }));
      }
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubjectChange = (value: string) => {
    setFormData(prev => ({ ...prev, subject: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await submitSupportTicket(formData, currentUser?.uid);
      if (result.success) {
          toast({
            title: "Message Sent!",
            description: "Our support team will get back to you shortly.",
          });
          setFormData({
            ...formData,
            subject: '',
            message: '',
          });
      } else {
          toast({
              title: "Submission Failed",
              description: result.message,
              variant: "destructive"
          });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" value={formData.name} onChange={handleChange} placeholder="Your Name" required disabled={isSubmitting} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={formData.email} onChange={handleChange} placeholder="your.email@example.com" required disabled={isSubmitting} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Select value={formData.subject} onValueChange={handleSubjectChange} required disabled={isSubmitting}>
          <SelectTrigger id="subject">
            <SelectValue placeholder="Select a topic..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general">General Inquiry</SelectItem>
            <SelectItem value="technical">Technical Support</SelectItem>
            <SelectItem value="investment">Investment Question</SelectItem>
            <SelectItem value="feedback">Feedback & Suggestions</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" value={formData.message} onChange={handleChange} placeholder="Describe your issue or question..." required disabled={isSubmitting} rows={5} />
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Send Message
      </Button>
    </form>
  );
}
