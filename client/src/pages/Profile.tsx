import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ProfilePicture } from "@/components/ProfilePicture";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);

  const handleWhatsAppToggle = async (checked: boolean) => {
    if (checked && !user?.phone) {
      toast({ 
        title: "Phone Required", 
        description: "Please register with a phone number to enable WhatsApp notifications",
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
        body: JSON.stringify({ enabled: checked }),
        credentials: 'include'
      });

      if (!res.ok) throw new Error('Failed to update');

      setWhatsappEnabled(checked);
      
      if (checked) {
        // Get WhatsApp reminder link
        const linkRes = await fetch('http://localhost:4255/api/whatsapp/reminder-link', {
          headers: { 'Authorization': `Bearer ${token}` },
          credentials: 'include'
        });
        const { url } = await linkRes.json();
        
        toast({ 
          title: "WhatsApp Notifications Enabled", 
          description: `Click here to test: ${url.substring(0, 30)}...`
        });
        
        // Open WhatsApp link
        setTimeout(() => window.open(url, '_blank'), 1000);
      } else {
        toast({ title: "WhatsApp Notifications Disabled" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update settings", variant: "destructive" });
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({ title: "Error", description: "Passwords don't match", variant: "destructive" });
      return;
    }

    if (password.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }

    toast({ title: "Success", description: "Password updated successfully" });
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" onClick={() => window.location.href = '/'} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <ProfilePicture />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email || ""} disabled />
            </div>

            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input value={user?.phone || ""} disabled />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>WhatsApp Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  {user?.phone ? `Get daily reminders at ${user.phone}` : 'Phone number required'}
                </p>
              </div>
              <Switch 
                checked={whatsappEnabled} 
                onCheckedChange={handleWhatsAppToggle}
                className={`border-2 transition-all duration-200 ${whatsappEnabled ? 'data-[state=checked]:bg-green-500 border-gray-500' : 'border-gray-300'}`}
              />
            </div>

            <div className="space-y-2">
              <Label>First Name</Label>
              <Input value={user?.firstName || ""} disabled />
            </div>

            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input value={user?.lastName || ""} disabled />
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">Change Password</h3>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>

                <Button type="submit">Update Password</Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
