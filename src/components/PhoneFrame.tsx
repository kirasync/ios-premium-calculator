import React, { useState, useEffect } from 'react';
import { Wifi, Signal, Battery, Moon, Sparkles, Smartphone, HelpCircle, Calculator } from 'lucide-react';

interface PhoneFrameProps {
  children: React.ReactNode;
}

export default function PhoneFrame({ children }: PhoneFrameProps) {
  const [time, setTime] = useState('');

  // Update time for the standard top-left iOS clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12; // 12-hour format like iOS
      setTime(`${hours}:${minutes} ${ampm}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#000000] flex flex-col items-center justify-center py-6 px-4 font-sans select-none relative overflow-hidden">
      
      {/* Decorative Sophisticated Dark ambient background meshes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        {/* Blue/orange ambient gradients from Design HTML */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 blur-[130px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-900/20 blur-[130px] rounded-full" />
        
        {/* Premium subtle alignment grids */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:5rem_5rem] opacity-3" />
      </div>

      {/* Main outer studio workspace containing phone and brief directions */}
      <div className="w-full max-w-sm flex flex-col items-center gap-4 relative z-10">
        
        {/* Subtle retro title card */}
        <div className="text-center space-y-1 select-all">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-amber-500 bg-amber-500/5 border border-amber-500/10 px-2.5 py-1 rounded-full uppercase tracking-widest inline-flex">
            <Calculator size={11} className="text-amber-500" />
            <span>Interactive premium prototype</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white mb-0.5">
            iOS Premium Calculator
          </h1>
          <p className="text-[11px] text-neutral-400 max-w-xs mx-auto">
            Experience standard iOS looks with a simulated upgrade checkout gating when evaluating calculation equations.
          </p>
        </div>

        {/* PHYSICAL PHONE SHELL CONTAINER */}
        <div 
          className="w-full aspect-[9/19.2] max-w-[360px] bg-black rounded-[48px] p-2.5 shadow-[0_25px_60px_-15px_rgba(255,159,10,0.15)] border-[5px] border-neutral-800 relative ring-8 ring-neutral-900 flex flex-col justify-between overflow-hidden" 
          id="hardware-phone-frame"
        >
          {/* TOP SCREEN AREA GLASS SHEEN REFLECTION (Absolute upper shine layer) */}
          <div className="absolute top-0 right-0 left-0 h-[40%] bg-gradient-to-b from-white/3 to-transparent pointer-events-none z-40 rounded-t-[38px] mix-blend-overlay" />

          {/* INNER TARGET PLATFORM SCREEN CANVAS */}
          <div className="flex-1 w-full bg-black rounded-[38px] relative overflow-hidden flex flex-col justify-between pt-7">
            
            {/* iOS Status Bar */}
            <div className="absolute top-1 left-0 right-0 h-6 flex justify-between items-center px-6 text-[10px] font-bold text-white z-30 select-none">
              <div>{time || '9:41 AM'}</div>
              <div className="flex items-center gap-1">
                <Signal size={10} className="text-white shrink-0" />
                <span className="text-[8px] font-mono font-medium">5G</span>
                <Wifi size={10} className="text-white shrink-0" />
                <div className="flex items-center gap-0.5">
                  <span className="text-[7px] font-mono pr-0.5">88%</span>
                  <Battery size={13} className="text-white shrink-0 rotate-0" />
                </div>
              </div>
            </div>

            {/* EMBEDDED APPLICATION CHANNELS */}
            <div className="flex-1 w-full flex flex-col relative" id="screen-inner-canvas">
              {children}
            </div>

            {/* iOS Bottom Swipe/Home Indicator handle */}
            <div className="absolute bottom-1 left-0 right-0 h-4 flex items-center justify-center z-30 pointer-events-none">
              <div className="w-32 h-1 bg-white/70 rounded-full" />
            </div>
          </div>
        </div>

        {/* Handy helper prompts below phone */}
        <div className="flex flex-col items-center gap-1.5 text-center px-4">
          <div className="flex gap-4 text-[10px] text-neutral-500 font-mono">
            <span>Tap <code className="text-amber-400 bg-neutral-900 px-1 py-0.5 rounded">C</code> to Clear</span>
            <span>•</span>
            <span>Click <strong className="text-amber-400">Settings</strong> to toggle premium test demo</span>
          </div>
          <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-2.5 max-w-[325px] flex items-start gap-2 text-[10px] text-neutral-400">
            <Moon size={13} className="text-amber-500 mt-0.5 shrink-0" />
            <p>
              Tap the cog icon in the top-left of the calculator to toggling/testing the checkout paywall multiple times.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
