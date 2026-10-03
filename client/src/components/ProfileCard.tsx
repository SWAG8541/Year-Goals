import React, { useState } from 'react';
import { User, Edit, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';

export function ProfileCard() {
  const { user, updateProfile } = useAuth();
  const [editingProfile, setEditingProfile] = useState(false);
  const [tempProfile, setTempProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  const saveProfile = async () => {
    await updateProfile(tempProfile);
    setEditingProfile(false);
  };

  const getInitials = () => {
    const first = user?.firstName?.charAt(0) || '';
    const last = user?.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'SP';
  };

  const profileImage = localStorage.getItem(`profileImage_${user?._id || user?.email || user?.phone}`) || user?.profileImageUrl || '';

  
  return (
    <>
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/20 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Profile</h3>
        </div>
        
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center overflow-hidden">
{
  profileImage ? (
    <Avatar>
    <AvatarImage
      src={profileImage}
      alt="Profile"
      className = "w-full h-full object-cover"
      />
    </Avatar>

  ):( 
  
  <span className="text-2xl font-bold text-primary-foreground">
              {getInitials()}
            </span>)
}
          </div>
          <div>
            <h4 className="font-bold">{user?.firstName} {user?.lastName}</h4>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <Button 
          className="w-full mt-4" 
          variant="outline"
          onClick={() => {
            setTempProfile({
              firstName: user?.firstName || '',
              lastName: user?.lastName || '',
              email: user?.email || '',
              phone: user?.phone || ''
            });
            setEditingProfile(true);
          }}
        >
          Update Profile
        </Button>
      </div>

      <Dialog open={editingProfile} onOpenChange={setEditingProfile}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Profile Settings</DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center relative mb-2">
{
  profileImage ? (
    <Avatar>
    <AvatarImage
      src={profileImage}
      alt="Profile"
      className = "w-full h-full object-cover"
      />
    </Avatar>

  ):( 
  
  <span className="text-2xl font-bold text-primary-foreground">
              {getInitials()}
            </span>)
}
              <Button size="sm" variant="ghost" className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-background border">
                <Camera className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={tempProfile.email}
                onChange={(e) => setTempProfile(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={tempProfile.phone}
                onChange={(e) => setTempProfile(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={tempProfile.firstName}
                onChange={(e) => setTempProfile(prev => ({ ...prev, firstName: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={tempProfile.lastName}
                onChange={(e) => setTempProfile(prev => ({ ...prev, lastName: e.target.value }))}
              />
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setEditingProfile(false)}>Cancel</Button>
            <Button onClick={saveProfile}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}