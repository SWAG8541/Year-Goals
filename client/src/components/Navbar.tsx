import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ExportData } from '@/components/ExportData';
import { DarkModeToggle } from '@/components/DarkModeToggle';
import { WhatsAppToggle } from '@/components/WhatsAppToggle';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, User } from 'lucide-react';

interface NavbarProps {
  currentPage?: string;
}

export function Navbar({ currentPage = 'home' }: NavbarProps) {
  const { user } = useAuth();
  
  const navItems = [
    { id: 'home', label: 'Home', href: '/' },
    { id: 'tasks', label: 'Tasks', href: '/tasks' },
    { id: 'blog', label: 'Blog', href: '/blog' },
    { id: 'feed', label: 'Feed', href: '/feed' },
  ];

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:4255/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex justify-between items-center p-4">
      {/* Left side controls */}
      <div className="flex items-center gap-2">
        <ExportData />
        <DarkModeToggle />
        <WhatsAppToggle />
      </div>
      
      {/* Center navigation */}
      <div className="flex items-center space-x-2">
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <a
              key={item.id}
              href={item.href}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 border",
                isActive
                  ? "bg-primary/20 border-primary/30 text-primary shadow-sm"
                  : "bg-white/50 border-gray-200/50 text-gray-700 hover:bg-primary/10 hover:border-primary/20 hover:text-primary"
              )}
            >
              {item.label}
            </a>
          );
        })}
      </div>
      
      {/* Right side profile */}
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => window.location.href = '/profile'}
          className="gap-2"
        >
          <Avatar className="w-6 h-6">
            <AvatarImage src={localStorage.getItem(`profileImage_${user?._id || user?.email || user?.phone}`) || user?.profileImageUrl || ''} />
            <AvatarFallback className="text-xs">
              {user?.firstName?.[0] || user?.email?.[0] || user?.phone?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          Profile
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleLogout}
          className="gap-2"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}