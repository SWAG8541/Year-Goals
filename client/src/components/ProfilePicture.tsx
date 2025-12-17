import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export function ProfilePicture() {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      const userId = user?._id || user?.email || user?.phone;
      localStorage.setItem(`profileImage_${userId}`, base64);
      setUploading(false);
      window.location.reload();
    };
    reader.readAsDataURL(file);
  };

  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase() || user?.email?.[0]?.toUpperCase() || user?.phone?.[0] || 'U';
  const userId = user?._id || user?.email || user?.phone;
  const savedImage = localStorage.getItem(`profileImage_${userId}`);

  return (
    <div className="relative inline-block">
      <Avatar className="w-20 h-20">
        <AvatarImage src={savedImage || user?.profileImageUrl} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <label htmlFor="profile-upload" className="absolute bottom-0 right-0 cursor-pointer">
        <Button size="icon" variant="secondary" className="rounded-full w-8 h-8" disabled={uploading} asChild>
          <span>
            <Camera className="w-4 h-4" />
          </span>
        </Button>
        <input
          id="profile-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
      </label>
    </div>
  );
}
