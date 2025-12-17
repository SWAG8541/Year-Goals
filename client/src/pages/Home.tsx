import React from 'react';
import { YearGrid } from '@/components/YearGrid';
import { Analytics } from '@/components/Analytics';
import { MotivationalQuote } from '@/components/MotivationalQuote';
import { Navbar } from '@/components/Navbar';

export default function Home() {
  return (
    <div 
      className="min-h-screen w-full relative overflow-x-hidden"
      style={{
        backgroundColor: 'hsl(var(--background))'
      }}
    >
      <div className="relative z-10">
        <Navbar currentPage="home" />
        
        <main className="py-4 px-4 max-w-7xl mx-auto">
          {/* <MotivationalQuote /> */}
          <Analytics />
          <YearGrid />
        </main>
        
        <footer className="py-8 text-center text-sm text-muted-foreground/60 font-mono relative z-10">
          <p>© {new Date().getFullYear()} Grid Tracker</p>
        </footer>
      </div>
    </div>
  );
}
