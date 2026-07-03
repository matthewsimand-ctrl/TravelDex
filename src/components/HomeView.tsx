/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Sparkles, Compass, MapPin, Trophy, ShieldAlert, Award, FileText, ChevronRight, Zap, ArrowRight, Heart } from "lucide-react";
import { TradingCard, UserProfile } from "../types.js";

interface HomeViewProps {
  profile: UserProfile | null;
  cards: TradingCard[];
  onNavigate: (view: "home" | "explore" | "collection" | "achievements" | "profile", tab?: "presets" | "upload" | "camera" | "manual") => void;
}

export default function HomeView({ profile, cards, onNavigate }: HomeViewProps) {
  // Find a showcase card: a favorite, or the most recent card, or fallback to null
  const spotlightCard = cards.find(c => c.favorite) || cards[0] || null;

  // Level progress percentage
  const levelProgress = profile ? Math.floor((profile.xp / profile.xpToNextLevel) * 100) : 0;

  return (
    <div className="flex-1 flex flex-col overflow-y-auto p-5 no-scrollbar pb-24">
      {/* 1. Welcoming Hero Banner */}
      <div className="mb-6 shrink-0 relative rounded-2xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border border-indigo-100 p-5 overflow-hidden shadow-sm">
        {/* Decorative background gradients */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-pink-300/10 blur-[40px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-24 h-24 bg-indigo-300/10 blur-[30px] rounded-full pointer-events-none" />

        <div className="relative z-10">
          <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase tracking-widest block mb-1">
            Global Explorer Pass
          </span>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">
            Hi, {profile?.username || "Traveler"}!
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-[280px]">
            Your cartography journey is active. You have logged {cards.length} unique destinations.
          </p>

          {/* Level Progress Slider */}
          <div className="mt-4 pt-3 border-t border-indigo-100">
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 mb-1">
              <span>Level {profile?.level || 1} Globetrotter</span>
              <span className="text-indigo-600 font-bold">{levelProgress}% XP</span>
            </div>
            <div className="w-full h-2 bg-slate-200/50 rounded-full p-[1px] border border-slate-200">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-pink-400 to-indigo-500 transition-all duration-500"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
            <span className="text-[9px] font-mono text-slate-400 block mt-1">
              {profile ? `${profile.xpToNextLevel - profile.xp} XP to next rank upgrade` : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Quick stats mini ribbon */}
      <div className="grid grid-cols-2 gap-3 mb-6 shrink-0">
        <div className="rounded-xl p-3 bg-orange-50/70 border border-orange-100 flex items-center gap-3 shadow-sm">
          <div className="w-9 h-9 rounded-lg bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-500 shrink-0">
            <Zap className="w-4.5 h-4.5 fill-orange-500/10" />
          </div>
          <div>
            <span className="text-[9px] font-mono text-orange-600/80 uppercase block font-bold">Daily Streak</span>
            <span className="font-extrabold text-slate-800 text-xs block">{profile?.streak || 0} Days Logged</span>
          </div>
        </div>

        <div className="rounded-xl p-3 bg-indigo-50/70 border border-indigo-100 flex items-center gap-3 shadow-sm">
          <div className="w-9 h-9 rounded-lg bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-500 shrink-0">
            <Trophy className="w-4.5 h-4.5" />
          </div>
          <div>
            <span className="text-[9px] font-mono text-indigo-600/80 uppercase block font-bold">Total Medals</span>
            <span className="font-extrabold text-slate-800 text-xs block">
              {profile ? "4 / 5 Unlocked" : "0 / 5"}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Core Creative Engine Launchers */}
      <div className="mb-6 shrink-0">
        <h3 className="text-[10px] font-mono uppercase text-slate-400 mb-3 block font-bold">
          Choose Card Creation Core
        </h3>
        <div className="flex flex-col gap-3">
          
          {/* Action A: PREMIUM AI GENERATOR */}
          <button 
            onClick={() => onNavigate("explore", "presets")}
            className="group relative w-full rounded-2xl border border-pink-200/60 bg-gradient-to-br from-pink-50/80 to-indigo-50/80 hover:border-pink-300 p-4 text-left transition-all hover:shadow-[0_4px_15px_rgba(236,72,153,0.08)] flex items-start gap-4 cursor-pointer"
          >
            {/* Ambient Glow effect inside */}
            <div className="absolute inset-0 bg-gradient-to-r from-pink-100/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
            
            <div className="w-11 h-11 rounded-xl bg-pink-100 border border-pink-200 flex items-center justify-center text-pink-500 shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-300">
              <Sparkles className="w-5.5 h-5.5 animate-pulse" />
            </div>

            <div className="flex-1 overflow-hidden relative z-10">
              <div className="flex items-center gap-1.5">
                <h4 className="font-extrabold text-slate-800 text-sm">AI Expedition Scan</h4>
                <span className="text-[8px] font-mono font-bold bg-pink-500 text-white px-1.5 py-0.2 rounded uppercase tracking-wider shadow-sm">
                  Premium
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Upload travel photos to let Gemini AI auto-detect coordinates, trivia facts, and engrave holographic overlays.
              </p>
              <span className="text-[10px] font-bold text-pink-600 mt-2.5 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Start AI Analysis</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </button>

          {/* Action B: STANDARD MANUAL ENGRAVER */}
          <button 
            onClick={() => onNavigate("explore", "manual")}
            className="group relative w-full rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/70 to-teal-50/70 hover:border-emerald-300 p-4 text-left transition-all hover:shadow-[0_4px_15px_rgba(16,185,129,0.06)] flex items-start gap-4 cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0 group-hover:scale-105 transition-transform duration-300">
              <FileText className="w-5.5 h-5.5" />
            </div>

            <div className="flex-1 overflow-hidden relative z-10">
              <div className="flex items-center gap-1.5">
                <h4 className="font-extrabold text-slate-800 text-sm">Manual Custom Engraver</h4>
                <span className="text-[8px] font-mono font-bold bg-emerald-500 text-white px-1.5 py-0.2 rounded uppercase tracking-wider shadow-sm">
                  Standard
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Design custom trading cards of your voyages from scratch by entering titles, country, city, coordinates, and custom statistics.
              </p>
              <span className="text-[10px] font-bold text-emerald-600 mt-2.5 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Create Standard Card</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* 3. Featured Spotlight Collectible Showcase */}
      {spotlightCard ? (
        <div className="mb-2 shrink-0">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-[10px] font-mono uppercase text-slate-400 block font-bold">
              Spotlight Collectible
            </h3>
            <button 
              onClick={() => onNavigate("collection")}
              className="text-[10px] font-mono text-indigo-600 font-bold flex items-center gap-0.5 hover:underline"
            >
              <span>View Binder</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div 
            onClick={() => onNavigate("collection")}
            className="rounded-2xl border border-indigo-100 bg-white p-3.5 flex gap-4 items-center cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all group"
          >
            <div className="relative w-16 h-20 rounded-xl overflow-hidden border border-slate-100 shrink-0 shadow-sm">
              <img 
                src={spotlightCard.imageUrl} 
                alt={spotlightCard.landmark} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-400 shadow-sm shadow-rose-200" />
            </div>

            <div className="flex-1 overflow-hidden">
              <span className="text-[8px] font-mono uppercase bg-indigo-50 border border-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded font-bold animate-pulse">
                {spotlightCard.rarity}
              </span>
              <h4 className="font-extrabold text-slate-800 text-sm truncate mt-1.5">
                {spotlightCard.title}
              </h4>
              <p className="text-[11px] text-slate-500 flex items-center gap-0.5 mt-0.5 truncate">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{spotlightCard.city}, {spotlightCard.country}</span>
              </p>
            </div>

            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
          </div>
        </div>
      ) : (
        /* Empty Collection Spotlight */
        <div className="mb-2 shrink-0 rounded-2xl border border-dashed border-slate-300 p-6 text-center bg-white/50">
          <Compass className="w-8 h-8 text-slate-400 mx-auto mb-2 animate-pulse" />
          <h4 className="font-bold text-slate-600 text-xs">Your TravelDex is Empty</h4>
          <p className="text-[10px] text-slate-400 mt-1 max-w-[200px] mx-auto leading-relaxed">
            You haven't added any cards yet! Tap one of the creation core buttons above to print your first card.
          </p>
        </div>
      )}
    </div>
  );
}
