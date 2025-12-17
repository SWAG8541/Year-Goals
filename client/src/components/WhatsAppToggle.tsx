import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export function WhatsAppToggle() {
  const [isEnabled, setIsEnabled] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchWhatsAppStatus();
  }, []);

  const fetchWhatsAppStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:4255/api/whatsapp/status', {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });
      if (res.ok) {
        const { enabled } = await res.json();
        setIsEnabled(enabled);
      }
    } catch (error) {
      const enabled = localStorage.getItem('whatsappNotifications') === 'true';
      setIsEnabled(enabled);
    }
  };

  const toggle = async () => {
    if (!isEnabled && !user?.phone) {
      toast({ 
        title: "Phone Required", 
        description: "Please add phone number in profile to enable WhatsApp notifications",
        variant: "destructive"
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:4255/api/whatsapp/toggle', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ enabled: !isEnabled }),
        credentials: 'include'
      });

      if (res.ok) {
        const newEnabled = !isEnabled;
        setIsEnabled(newEnabled);
        localStorage.setItem('whatsappNotifications', String(newEnabled));
        
        toast({ 
          title: newEnabled ? "WhatsApp Enabled" : "WhatsApp Disabled",
          description: newEnabled ? "You'll receive daily reminders" : "Notifications turned off"
        });
      }
    } catch (error) {
      const newEnabled = !isEnabled;
      setIsEnabled(newEnabled);
      localStorage.setItem('whatsappNotifications', String(newEnabled));
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={toggle}
      className={cn(
        "border-2 transition-all duration-200",
        isEnabled 
          ? "bg-green-500 hover:bg-green-600 border-green-600 text-white" 
          : "bg-background hover:bg-muted border-gray-300 text-foreground"
      )}
    >
      <MessageCircle className="w-4 h-4" />
    </Button>
  );
}