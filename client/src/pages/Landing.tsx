import React from 'react';
import { Button } from '@/components/ui/button';
import bgImage from '@assets/generated_images/subtle_white_paper_texture_with_very_faint_grain.png';

export default function Landing() {
  return (
    <div 
      className="min-h-screen w-full bg-background flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: '300px',
        backgroundRepeat: 'repeat'
      }}
    >
      <div className="absolute inset-0 bg-white/40 pointer-events-none" />
      
      <div className="relative z-10 text-center space-y-8 p-8 max-w-2xl">
        <div className="space-y-4">
          <h1 className="text-6xl md:text-8xl font-bold text-primary/80 font-hand">2026</h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-mono uppercase tracking-widest">
            Year In Pixels
          </p>
        </div>
        
        <div className="space-y-4">
          <p className="text-lg text-foreground/80 max-w-md mx-auto">
            Track your daily goals for 2026. Mark each day you complete your goal and watch your progress grow.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button 
              size="lg"
              onClick={() => window.location.href = '/api/login'}
              className="font-mono uppercase tracking-wider"
            >
              Get Started
            </Button>
          </div>
        </div>

        <div className="pt-8 grid grid-cols-3 gap-6 max-w-md mx-auto text-center">
          <div className="space-y-2">
            <div className="text-3xl font-bold text-primary font-mono">365</div>
            <div className="text-sm text-muted-foreground">Days to Track</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-primary font-mono">✓</div>
            <div className="text-sm text-muted-foreground">Simple Marking</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-primary font-mono">∞</div>
            <div className="text-sm text-muted-foreground">Unlimited Goals</div>
          </div>
        </div>
      </div>
    </div>
  );
}
