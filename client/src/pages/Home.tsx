import React from 'react';
import { YearGrid } from '@/components/YearGrid';
import bgImage from '@assets/generated_images/subtle_white_paper_texture_with_very_faint_grain.png';

export default function Home() {
  return (
    <div 
      className="min-h-screen w-full bg-background relative overflow-x-hidden"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: '300px', // Repeat the texture
        backgroundRepeat: 'repeat'
      }}
    >
      <div className="absolute inset-0 bg-white/40 pointer-events-none" /> {/* Lighten overlay */}
      <main className="relative z-10 py-10">
        <YearGrid />
      </main>
      
      <footer className="py-8 text-center text-sm text-muted-foreground/60 font-mono relative z-10">
        <p>2026 Grid Tracker</p>
      </footer>
    </div>
  );
}
