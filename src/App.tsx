/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import PhoneFrame from "./components/PhoneFrame.js";
import ExploreView from "./components/ExploreView.js";
import CollectionView from "./components/CollectionView.js";
import AchievementsView from "./components/AchievementsView.js";
import ProfileView from "./components/ProfileView.js";
import HomeView from "./components/HomeView.js";
import { TradingCard, TravelCollection, Achievement, UserProfile } from "./types.js";
import { Compass, BookOpen, Trophy, User, Sparkles, X, Heart, Eye, Home, ArrowLeft } from "lucide-react";
import HolographicCard from "./components/HolographicCard.js";

type ActiveView = "home" | "explore" | "collection" | "achievements" | "profile";

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>("home");
  const [exploreInitialTab, setExploreInitialTab] = useState<"presets" | "upload" | "camera" | "manual">("presets");
  const [cards, setCards] = useState<TradingCard[]>([]);
  const [customCollections, setCustomCollections] = useState<TravelCollection[]>([]);
  const [presetCollections, setPresetCollections] = useState<TravelCollection[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  // Pack Opening Ceremony variables
  const [newlyUnlockedCard, setNewlyUnlockedCard] = useState<TradingCard | null>(null);
  const [packPhase, setPackPhase] = useState<"hidden" | "sealed" | "tearing" | "revealed">("hidden");

  // Fetch full state on startup
  const fetchState = async () => {
    try {
      const res = await fetch("/api/db");
      const data = await res.json();
      setCards(data.cards || []);
      setCustomCollections(data.customCollections || []);
      setPresetCollections(data.presetCollections || []);
      setProfile(data.profile || null);
      setAchievements(data.achievements || []);
    } catch (e) {
      console.error("Failed to load DB state from server:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchState();
  }, []);

  // Card Generation Handler (sends back to server to finalize saving)
  const handleCardGenerated = async (cardPartial: Partial<TradingCard>) => {
    try {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cardPartial)
      });
      const data = await res.json();
      
      // Update local state with fresh database records
      setCards(data.cards || []);
      setCustomCollections(data.customCollections || []);
      setProfile(data.profile || null);
      setAchievements(data.achievements || []);

      // Trigger Pack Opening Ceremony for the newest card!
      const generatedCard = data.cards[0]; // Server unshifts new card to top
      if (generatedCard) {
        setNewlyUnlockedCard(generatedCard);
        setPackPhase("sealed");
      }
    } catch (e) {
      console.error("Failed to save generated card:", e);
    }
  };

  // Favorite toggling handler
  const handleFavoriteToggle = async (id: string) => {
    try {
      const res = await fetch(`/api/cards/${id}/favorite`, { method: "POST" });
      const data = await res.json();
      setCards(data.cards || []);
    } catch (e) {
      console.error("Failed to toggle favorite:", e);
    }
  };

  // Deletion handler
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/cards/${id}`, { method: "DELETE" });
      const data = await res.json();
      setCards(data.cards || []);
    } catch (e) {
      console.error("Failed to delete card:", e);
    }
  };

  // Custom Binder Creation
  const handleCreateCollection = async (name: string) => {
    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      });
      const data = await res.json();
      setCustomCollections(data.customCollections || []);
    } catch (e) {
      console.error("Failed to create custom binder:", e);
    }
  };

  // View navigation helper with sub-tab deep linking support
  const handleNavigate = (view: ActiveView, tab: "presets" | "upload" | "camera" | "manual" = "presets") => {
    setExploreInitialTab(tab);
    setActiveView(view);
  };

  // Tear Pack Animation trigger
  const handleTearPack = () => {
    setPackPhase("tearing");
    setTimeout(() => {
      setPackPhase("revealed");
    }, 1500); // 1.5s tearing dramatic delay
  };

  return (
    <PhoneFrame>
      {/* 1. Pack Opening Ceremony Overlay Portal */}
      {packPhase !== "hidden" && newlyUnlockedCard && (
        <div className="absolute inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-6 text-center select-none animate-fade-in overflow-hidden">
          
          {/* Sparkle background trails */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-400 via-transparent to-transparent pointer-events-none" />

          {/* Phase A: Sealed Pack */}
          {packPhase === "sealed" && (
            <div className="flex flex-col items-center animate-scale-up">
              {/* Foil Pack Graphic wrapper */}
              <div 
                onClick={handleTearPack}
                className="relative w-64 h-[400px] bg-gradient-to-b from-zinc-800 via-zinc-900 to-zinc-950 rounded-2xl border-4 border-amber-400/80 shadow-[0_0_50px_rgba(245,158,11,0.3)] flex flex-col items-center justify-between p-6 cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300 ring-2 ring-white/10 overflow-hidden group"
              >
                {/* Crinkled Foil Edges */}
                <div className="absolute top-0 inset-x-0 h-4 bg-[repeating-linear-gradient(90deg,#000,#000_4px,#333_4px,#333_8px)] opacity-80" />
                <div className="absolute bottom-0 inset-x-0 h-4 bg-[repeating-linear-gradient(90deg,#000,#000_4px,#333_4px,#333_8px)] opacity-80" />
                
                {/* Pack Branding */}
                <div className="text-center mt-6">
                  <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase block">TravelDex Booster</span>
                  <h3 className="font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-200 tracking-tight flex items-center justify-center gap-1.5 mt-1">
                    <Sparkles className="w-5 h-5 text-amber-400 animate-spin-slow" />
                    <span>EXPEDITION</span>
                  </h3>
                </div>

                {/* Shimmering Center Crest */}
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-600 p-[1.5px] shadow-[0_0_20px_rgba(245,158,11,0.2)] animate-pulse">
                  <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center">
                    <Compass className="w-10 h-10 text-amber-400 animate-spin-slow" />
                  </div>
                </div>

                <div className="text-center mb-6">
                  <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider animate-bounce">Tap to Rip Foil Pack</p>
                  <span className="text-[9px] font-mono text-zinc-600 mt-1 block">Contains 1 Holographic Collectible</span>
                </div>
              </div>
            </div>
          )}

          {/* Phase B: Tearing Foil Pack Animation */}
          {packPhase === "tearing" && (
            <div className="flex flex-col items-center justify-center">
              <div className="relative">
                {/* Pack split parts with dramatic shaking */}
                <div className="w-60 h-[200px] bg-zinc-900 rounded-t-2xl border-t-4 border-x-4 border-amber-400/50 flex flex-col justify-end p-4 animate-shake -translate-y-4 transition-transform duration-500">
                  <h3 className="font-extrabold text-amber-400 text-sm tracking-widest text-center uppercase font-mono mb-6">Ripping Foil...</h3>
                </div>
                <div className="w-60 h-[200px] bg-zinc-950 rounded-b-2xl border-b-4 border-x-4 border-amber-400/50 flex flex-col justify-start p-4 animate-shake translate-y-4 transition-transform duration-500">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-16 h-12 bg-amber-400 blur-2xl opacity-80 animate-ping" />
                </div>
              </div>
            </div>
          )}

          {/* Phase C: Card Revealed with Sparkles */}
          {packPhase === "revealed" && (
            <div className="flex flex-col items-center justify-center w-full max-w-sm animate-scale-up">
              {/* Star sparkles banner */}
              <div className="mb-5 text-center animate-fade-in">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold block mb-1">New Expedition Registered!</span>
                <h3 className="text-xl font-black text-white flex items-center justify-center gap-1.5">
                  <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                  <span>{newlyUnlockedCard.landmark}</span>
                </h3>
              </div>

              {/* High fidelity interactive 3D card */}
              <div className="shadow-[0_0_50px_rgba(245,158,11,0.25)] rounded-[24px]">
                <HolographicCard 
                  card={newlyUnlockedCard} 
                  onFavoriteToggle={handleFavoriteToggle} 
                />
              </div>

              {/* Close / Pocket button */}
              <button
                onClick={() => {
                  setPackPhase("hidden");
                  setNewlyUnlockedCard(null);
                  setActiveView("collection"); // Navigate to collection tab to see it!
                }}
                className="mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-zinc-950 font-bold text-xs uppercase tracking-wider hover:shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all"
              >
                Insert Card into Binder
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main UI Tabs Layout */}
      {isLoading ? (
        <div className="flex-grow flex flex-col items-center justify-center text-center p-6">
          <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mb-4" />
          <h3 className="font-bold text-slate-700 text-sm font-mono uppercase tracking-widest">Loading TravelDex...</h3>
          <p className="text-xs text-slate-400 mt-1">Calibrating global databases</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden relative">
          
          {/* Top TravelDex Header Bar */}
          <div className="h-14 bg-white/80 backdrop-blur-md border-b border-pink-100 flex items-center justify-between px-5 select-none shrink-0 z-40 shadow-sm shadow-pink-100/10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-sm">
                <Compass className="w-4.5 h-4.5" />
              </div>
              <span className="font-black text-indigo-700 text-base tracking-wider">
                TravelDex
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono font-bold bg-pink-100 border border-pink-200 text-pink-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-pink-500 fill-pink-500/10" />
                <span>AI Core 2.0</span>
              </span>
            </div>
          </div>

          {/* Active Tab Viewport Router */}
          {activeView === "home" && (
            <HomeView 
              profile={profile}
              cards={cards}
              onNavigate={handleNavigate}
            />
          )}

          {activeView === "explore" && (
            <ExploreView 
              onCardGenerated={handleCardGenerated}
              collections={presetCollections.concat(customCollections)}
              initialTab={exploreInitialTab}
            />
          )}

          {activeView === "collection" && (
            <CollectionView 
              cards={cards}
              customCollections={customCollections}
              presetCollections={presetCollections}
              onFavoriteToggle={handleFavoriteToggle}
              onDelete={handleDelete}
              onCreateCollection={handleCreateCollection}
              selectedCardId={selectedCardId}
              onSelectCard={setSelectedCardId}
            />
          )}

          {activeView === "achievements" && profile && (
            <AchievementsView 
              profile={profile}
              achievements={achievements}
            />
          )}

          {activeView === "profile" && profile && (
            <ProfileView 
              profile={profile}
              cards={cards}
            />
          )}

          {/* Full Screen Card Detail Modal (with back arrow, takes up everything except the bottom tab selection bar) */}
          {selectedCardId && (
            <div className="absolute top-0 inset-x-0 bottom-20 bg-white/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4 animate-fade-in">
              {/* Back Arrow in the top left */}
              <button
                onClick={() => setSelectedCardId(null)}
                className="absolute top-4 left-4 p-2.5 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 transition-all cursor-pointer border border-slate-200/60 flex items-center justify-center shadow-sm z-50 hover:scale-105 active:scale-95"
                title="Go Back"
              >
                <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
              </button>

              <div className="mb-4 text-center select-none mt-10 shrink-0">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Tap card to flip • Scroll or swipe to read</span>
              </div>

              <div className="active:scale-98 transition-transform duration-200 shrink-0 max-h-[80vh] overflow-visible" onClick={(e) => e.stopPropagation()}>
                {(() => {
                  const activeCard = cards.find(c => c.id === selectedCardId);
                  if (!activeCard) return null;
                  return (
                    <HolographicCard 
                      card={activeCard} 
                      onFavoriteToggle={handleFavoriteToggle}
                      onDelete={(id) => {
                        handleDelete(id);
                        setSelectedCardId(null);
                      }}
                    />
                  );
                })()}
              </div>
            </div>
          )}

          {/* Bottom Tabs Selection Bar (Sleek Glassmorphic Frame) */}
          <div className="absolute bottom-0 inset-x-0 h-20 bg-white/95 backdrop-blur-md border-t border-rose-100 flex items-center justify-around px-2 z-40 select-none shrink-0 shadow-[0_-4px_20px_rgba(244,63,94,0.05)]">
            {[
              { id: "home", label: "Home", icon: Home },
              { id: "explore", label: "Create", icon: Compass },
              { id: "collection", label: "Binder", icon: BookOpen },
              { id: "achievements", label: "Medals", icon: Trophy },
              { id: "profile", label: "Passport", icon: User }
            ].map((tab) => {
              const IconComp = tab.icon;
              const isSelected = activeView === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleNavigate(tab.id as ActiveView, "presets")}
                  className="flex flex-col items-center justify-center w-14 h-12 transition-all relative group"
                >
                  <div className={`p-1.5 rounded-xl transition-all duration-300 ${
                    isSelected 
                      ? "bg-gradient-to-r from-pink-400 to-indigo-400 text-white shadow-md shadow-pink-200" 
                      : "text-slate-400 hover:text-slate-600"
                  }`}>
                    <IconComp className="w-4 h-4 shrink-0" />
                  </div>
                  <span className={`text-[9.5px] font-bold mt-1 tracking-tight transition-all ${
                    isSelected ? "text-indigo-600 font-extrabold" : "text-slate-400"
                  }`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>

        </div>
      )}
    </PhoneFrame>
  );
}
