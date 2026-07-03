/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { User, Map, Landmark, Compass, Award, Heart, Globe, Building, CheckCircle, Sparkles, ShieldCheck, Zap } from "lucide-react";
import { TradingCard, UserProfile } from "../types.js";

interface ProfileViewProps {
  profile: UserProfile;
  cards: TradingCard[];
  onTogglePremium: (isPremium: boolean) => Promise<void>;
}

export default function ProfileView({ profile, cards, onTogglePremium }: ProfileViewProps) {
  // Extract unique locations
  const uniqueCountries = Array.from(new Set(cards.map(c => c.country)));
  const uniqueCities = Array.from(new Set(cards.map(c => c.city)));
  const favoriteCards = cards.filter(c => c.favorite);
  
  // Custom formula to plot GPS coordinates onto our minimalist SVG world map frame (320x180 ratio)
  const plotCoordinates = (coordString: string) => {
    try {
      // Parses coordinates like "35.3606° N, 138.7274° E" or "13.1631° S, 72.5450° W"
      const match = coordString.match(/([\d.]+)\s*°\s*([NSns]),\s*([\d.]+)\s*°\s*([EWew])/);
      if (!match) return null;

      let lat = parseFloat(match[1]);
      const latDir = match[2].toUpperCase();
      let lng = parseFloat(match[3]);
      const lngDir = match[4].toUpperCase();

      if (latDir === "S") lat = -lat;
      if (lngDir === "W") lng = -lng;

      // Map Latitude [-90 to 90] to Y [10 to 170]
      // Standard Mercator-ish stretching
      const yPercent = ((90 - lat) / 180) * 100;
      // Map Longitude [-180 to 180] to X [10 to 310]
      const xPercent = ((lng + 180) / 360) * 100;

      return { x: xPercent, y: yPercent };
    } catch (e) {
      return null;
    }
  };

  const activePins = cards
    .map(c => ({
      id: c.id,
      name: c.landmark,
      coords: plotCoordinates(c.coordinates)
    }))
    .filter(pin => pin.coords !== null) as { id: string; name: string; coords: { x: number; y: number } }[];

  return (
    <div className="flex-1 flex flex-col overflow-y-auto p-5 no-scrollbar pb-24 bg-transparent">
      {/* Header */}
      <div className="mb-6 shrink-0">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          <User className="w-6 h-6 text-indigo-500" />
          <span>Passport ID</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Review your personal traveling indices and live exploration world map projection.
        </p>
      </div>

      {/* Profile Card Summary */}
      <div className="rounded-2xl p-4 bg-white border border-indigo-100 flex items-center gap-4 mb-6 shrink-0 shadow-sm">
        <div className="relative">
          <img 
            src={profile.avatarUrl} 
            alt={profile.username} 
            className="w-14 h-14 rounded-full border-2 border-indigo-300 object-cover shadow-sm"
          />
          <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white font-bold text-[9px] px-1.5 py-0.5 rounded-full border border-white">
            Rank {profile.level}
          </div>
        </div>
        <div className="overflow-hidden">
          <h3 className="font-extrabold text-slate-800 text-md tracking-tight truncate">{profile.username}</h3>
          <p className="text-xs text-slate-400 font-mono truncate">{profile.email}</p>
          <span className="text-[10px] text-indigo-650 font-mono flex items-center gap-1 mt-1 font-bold">
            <Compass className="w-3.5 h-3.5 text-pink-500 animate-spin-slow" />
            <span>Class-A Cartographer</span>
          </span>
        </div>
      </div>

      {/* Global Explorer Indices Grid */}
      <div className="grid grid-cols-3 gap-2.5 mb-6 shrink-0">
        {[
          { label: "Cards", value: cards.length, icon: Landmark, color: "text-indigo-500 bg-indigo-50" },
          { label: "Countries", value: uniqueCountries.length, icon: Globe, color: "text-pink-500 bg-pink-50" },
          { label: "Cities", value: uniqueCities.length, icon: Building, color: "text-purple-500 bg-purple-50" }
        ].map(idx => {
          const IconComp = idx.icon;
          return (
            <div key={idx.label} className="bg-white border border-indigo-100 rounded-2xl p-3 flex flex-col justify-between h-20 select-none shadow-sm">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${idx.color} shrink-0`}>
                <IconComp className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[15px] font-mono font-black text-slate-800 leading-none block">{idx.value}</span>
                <span className="text-[9px] text-slate-400 block font-mono font-bold mt-0.5">{idx.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Minimal SVG World Travel Map */}
      <div className="rounded-2xl border border-indigo-100 bg-white p-4 mb-6 shrink-0 shadow-sm">
        <div className="flex justify-between items-center mb-3 select-none">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">Explorer Projection Map</span>
          <span className="text-[9px] font-mono text-indigo-600 flex items-center gap-1 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
            <span>{activePins.length} Anchors Plotted</span>
          </span>
        </div>

        {/* Minimalist SVG Vector Map Frame */}
        <div className="relative w-full aspect-[16/9] bg-slate-50/50 rounded-xl border border-slate-200/60 overflow-hidden flex items-center justify-center">
          {/* Grid lines in back */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.02)_1px,transparent_1px)] bg-[size:16px_12px]" />
          
          <svg viewBox="0 0 320 180" className="w-full h-full relative z-10 text-slate-200">
            {/* Extremely minimal stylized world layout path outlines */}
            {/* North America */}
            <path d="M 15 20 Q 40 15 55 25 Q 60 40 45 55 Q 35 70 20 60 Z" fill="currentColor" className="opacity-40 text-indigo-100" />
            {/* South America */}
            <path d="M 45 65 Q 60 70 65 90 Q 55 125 45 140 Q 35 110 40 85 Z" fill="currentColor" className="opacity-40 text-indigo-100" />
            {/* Eurasia / Africa */}
            <path d="M 100 20 Q 150 15 180 30 Q 200 45 220 30 Q 250 20 270 35 Q 260 55 230 65 Q 215 80 190 60 Z" fill="currentColor" className="opacity-40 text-indigo-100" />
            <path d="M 115 50 Q 135 45 155 55 Q 160 85 145 110 Q 125 120 115 85 Z" fill="currentColor" className="opacity-40 text-indigo-100" />
            {/* Japan / East Asia */}
            <path d="M 240 40 Q 255 42 250 55 Z" fill="currentColor" className="opacity-50 text-indigo-100" />
            {/* Australia */}
            <path d="M 230 100 Q 260 105 265 125 Q 240 135 225 115 Z" fill="currentColor" className="opacity-40 text-indigo-100" />

            {/* Glowing lines connecting consecutive pins */}
            {activePins.length > 1 && activePins.map((pin, index) => {
              if (index === 0) return null;
              const prev = activePins[index - 1];
              // Draw arc
              const mx = (pin.coords.x + prev.coords.x) / 2;
              const my = (pin.coords.y + prev.coords.y) / 2 - 20; // curve offset
              return (
                <path
                  key={`line-${index}`}
                  d={`M ${(prev.coords.x * 3.2).toFixed(1)} ${(prev.coords.y * 1.8).toFixed(1)} Q ${(mx * 3.2).toFixed(1)} ${(my * 1.8).toFixed(1)} ${(pin.coords.x * 3.2).toFixed(1)} ${(pin.coords.y * 1.8).toFixed(1)}`}
                  fill="none"
                  stroke="rgba(99, 102, 241, 0.4)"
                  strokeWidth="0.85"
                  strokeDasharray="2,2"
                />
              );
            })}

            {/* Plotted Pins */}
            {activePins.map(pin => (
              <g key={pin.id}>
                {/* Ping ring */}
                <circle 
                  cx={`${(pin.coords.x * 3.2).toFixed(1)}`} 
                  cy={`${(pin.coords.y * 1.8).toFixed(1)}`} 
                  r="5" 
                  fill="none" 
                  stroke="rgba(244, 63, 94, 0.5)" 
                  strokeWidth="0.5"
                  className="animate-pulse"
                />
                {/* Core dot */}
                <circle 
                  cx={`${(pin.coords.x * 3.2).toFixed(1)}`} 
                  cy={`${(pin.coords.y * 1.8).toFixed(1)}`} 
                  r="2" 
                  fill="#f43f5e" 
                />
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="rounded-2xl border border-indigo-100 bg-white p-4 flex flex-col gap-3.5 shadow-sm">
        <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
          <span className="text-slate-500 font-bold">Favorite Destination</span>
          <span className="font-extrabold text-slate-800 flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>{profile.favoriteDestination}</span>
          </span>
        </div>
        
        <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
          <span className="text-slate-500 font-bold">Most Collected Scene</span>
          <span className="font-extrabold text-indigo-600 font-mono uppercase tracking-wider">{profile.mostCollectedCategory}</span>
        </div>

        <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
          <span className="text-slate-500 font-bold">Longest Upload Streak</span>
          <span className="font-extrabold text-slate-800 font-mono">{profile.streak} Days Active</span>
        </div>

        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-500 font-bold">Collection Completeness</span>
          <span className="font-extrabold text-emerald-600 font-mono">
            {Math.floor((cards.length / 50) * 100)}% (Goal: 50)
          </span>
        </div>
      </div>

      {/* Premium Account Subscription Control */}
      <div className="mt-5 rounded-2xl border border-pink-200 bg-gradient-to-br from-pink-50/40 via-purple-50/40 to-indigo-50/40 p-4 shrink-0 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-pink-300/10 blur-[20px] rounded-full pointer-events-none" />
        
        <div className="flex justify-between items-start mb-3">
          <div>
            <h4 className="font-black text-slate-800 text-sm flex items-center gap-1.5">
              <Sparkles className="w-4.5 h-4.5 text-pink-500" />
              <span>TravelDex Premium</span>
            </h4>
            <p className="text-[11px] text-slate-500 mt-1 max-w-[220px] leading-relaxed">
              Toggle to simulate subscription payment status. Blocks/unlocks all premium features.
            </p>
          </div>
          
          <button
            id="premium-toggle-btn"
            onClick={() => onTogglePremium(!profile.isPremium)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-black tracking-wider shadow-sm transition-all flex items-center gap-1 cursor-pointer hover:scale-105 active:scale-95 ${
              profile.isPremium 
                ? "bg-gradient-to-r from-pink-500 to-indigo-500 text-white border border-pink-400"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200"
            }`}
          >
            {profile.isPremium ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>UNLOCKED</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" />
                <span>GO PREMIUM</span>
              </>
            )}
          </button>
        </div>

        {/* Subscription Status details */}
        <div className="bg-white/80 rounded-xl p-3 border border-pink-100/60 mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${profile.isPremium ? 'bg-pink-400' : 'bg-slate-300'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${profile.isPremium ? 'bg-pink-500' : 'bg-slate-400'}`}></span>
            </div>
            <span className="text-[11px] font-mono font-bold text-slate-600">
              Account Status:
            </span>
          </div>
          <span className={`text-[11px] font-bold uppercase tracking-wider font-mono ${profile.isPremium ? 'text-pink-600' : 'text-slate-500'}`}>
            {profile.isPremium ? "PRO UNLIMITED" : "STANDARD FREE"}
          </span>
        </div>
      </div>
    </div>
  );
}
