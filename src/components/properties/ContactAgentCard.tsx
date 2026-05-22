'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Phone, MessageCircle, Send } from 'lucide-react';
import { toast } from 'sonner';

interface ContactAgentCardProps {
  projectName: string;
  agentPhone?: string | null;
}

export function ContactAgentCard({ projectName, agentPhone }: ContactAgentCardProps) {
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);

  const whatsappNumber = agentPhone?.replace(/[^0-9]/g, '') || '60123456789';
  const whatsappMessage = encodeURIComponent(
    `Hi, I'm interested in ${projectName}. Could you share more details?`,
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;
  const callUrl = `tel:+${whatsappNumber}`;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const message = formData.get('message') as string;

    if (!name.trim() || !phone.trim()) {
      toast.error('Please fill in your name and phone number');
      return;
    }

    startTransition(async () => {
      // For now, show success — can wire to a server action later
      setSubmitted(true);
      toast.success('Enquiry sent! An agent will contact you shortly.');
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Contact Agent</h3>

      {/* Quick contact buttons */}
      <div className="flex gap-2">
        <Button asChild className="flex-1 gap-2 bg-green-600 hover:bg-green-700 text-white">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
        </Button>
        <Button asChild variant="outline" className="flex-1 gap-2">
          <a href={callUrl}>
            <Phone className="h-4 w-4" />
            Call
          </a>
        </Button>
      </div>

      {/* Enquiry form */}
      <div className="border-t border-border pt-4">
        <p className="text-sm text-muted-foreground mb-3">
          Or leave your details and we&apos;ll get back to you
        </p>
        {submitted ? (
          <div className="text-center py-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Thank you!</p>
            <p>We&apos;ll be in touch soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label htmlFor="contact-name" className="text-xs">Name</Label>
              <Input id="contact-name" name="name" placeholder="Your name" required />
            </div>
            <div>
              <Label htmlFor="contact-phone" className="text-xs">Phone</Label>
              <Input id="contact-phone" name="phone" placeholder="+60 12-345 6789" type="tel" required />
            </div>
            <div>
              <Label htmlFor="contact-message" className="text-xs">Message (optional)</Label>
              <Textarea
                id="contact-message"
                name="message"
                placeholder={`I'm interested in ${projectName}`}
                rows={3}
              />
            </div>
            <Button type="submit" className="w-full gap-2" disabled={isPending}>
              <Send className="h-4 w-4" />
              Send Enquiry
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
