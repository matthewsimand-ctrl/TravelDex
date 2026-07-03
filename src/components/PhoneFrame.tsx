/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ReactNode } from "react";
import { Signal, Wifi, Battery, Compass } from "lucide-react";

interface PhoneFrameProps {
  children: ReactNode;
}

export default function PhoneFrame({ children }: PhoneFrameProps) {
  // Get current time formatted beautifully for the status bar
  const formatTime = () => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return `${hours}:${minutes} ${ampm}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-rose-100/70 via-indigo-50/60 to-amber-100/70 flex items-center justify-center p-0 md:p-6 overflow-x-hidden">
      {/* Absolute Ambient Glow behind the phone using Indigo and Slate theme */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-300/20 blur-[120px] rounded-full pointer-events-none hidden md:block" />
      <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-amber-200/20 blur-[120px] rounded-full pointer-events-none hidden md:block" />

      {/* Main Container */}
      <div 
        id="phone-wrapper"
        className="relative w-full max-w-[440px] h-screen md:h-[880px] md:rounded-[50px] md:border-[10px] md:border-amber-100 bg-white shadow-[0_20px_60px_-15px_rgba(251,191,36,0.15),_0_0_80px_rgba(139,92,246,0.08)] overflow-hidden flex flex-col transition-all duration-300 md:ring-1 md:ring-amber-200/30"
      >
        {/* Dynamic Island / Notch */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-full z-50 flex items-center justify-center shadow-inner pointer-events-none hidden md:flex">
          <div className="w-3 h-3 bg-slate-850 rounded-full border border-slate-800/80 absolute right-4" />
          <div className="w-1.5 h-1.5 bg-indigo-900 rounded-full absolute right-[18px] opacity-60" />
        </div>

        {/* Status Bar */}
        <div className="h-12 bg-white/75 backdrop-blur-md px-6 flex items-center justify-between text-slate-500 text-xs font-semibold select-none z-40 shrink-0 border-b border-amber-900/5">
          <span id="status-time" className="font-bold text-slate-700">{formatTime()}</span>
          
          {/* Status Bar Icons */}
          <div className="flex items-center gap-2">
            <Signal className="w-3.5 h-3.5 text-slate-500" />
            <Wifi className="w-3.5 h-3.5 text-slate-500" />
            <div className="flex items-center gap-0.5">
              <Battery className="w-4 h-4 text-slate-600" />
            </div>
          </div>
        </div>

        {/* Client Viewport */}
        <div className="flex-1 overflow-hidden flex flex-col bg-[#FDFCF7] text-slate-800 relative">
          {/* Soft color grid dot overlay for playful aesthetics */}
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "radial-gradient(#ec4899 0.5px, transparent 0.5px)", backgroundSize: "24px 24px" }}></div>
          
          <div className="flex-1 flex flex-col overflow-hidden relative z-10">
            {children}
          </div>
        </div>

        {/* Home Indicator (Apple iOS Bar) */}
        <div className="h-6 bg-white/80 backdrop-blur-sm flex items-center justify-center shrink-0 z-40 border-t border-amber-900/5">
          <div className="w-36 h-1 bg-slate-300 rounded-full opacity-60 hover:opacity-100 transition-opacity duration-200" />
        </div>
      </div>
    </div>
  );
}
