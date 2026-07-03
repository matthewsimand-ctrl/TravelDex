/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Search, SlidersHorizontal, Grid, FolderHeart, Plus, Compass, BookOpen, Star, Sparkles, Filter } from "lucide-react";
import { TradingCard, TravelCollection, CardRarity } from "../types.js";
import HolographicCard from "./HolographicCard.tsx";

interface CollectionViewProps {
  cards: TradingCard[];
  customCollections: TravelCollection[];
  presetCollections: TravelCollection[];
  onFavoriteToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onCreateCollection: (name: string) => Promise<void>;
  selectedCardId: string | null;
  onSelectCard: (id: string | null) => void;
}

export default function CollectionView({
  cards,
  customCollections,
  presetCollections,
  onFavoriteToggle,
  onDelete,
  onCreateCollection,
  selectedCardId,
  onSelectCard
}: CollectionViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRarity, setSelectedRarity] = useState<string>("all");
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("all");
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [showCreateBinder, setShowCreateBinder] = useState(false);
  const [newBinderName, setNewBinderName] = useState("");

  const allCollections = [...presetCollections, ...customCollections];

  // Helper to get card count inside a collection
  const getCollectionProgress = (colId: string) => {
    const totalInCol = cards.filter(c => c.collectionId === colId).length;
    // Set a fun milestone limit (e.g., 5 cards per collection for the prototype)
    const milestone = 5;
    const percentage = Math.min(100, Math.floor((totalInCol / milestone) * 100));
    return { count: totalInCol, milestone, percentage };
  };

  // Filter logic
  const filteredCards = cards.filter(card => {
    // Search query matches title, landmark, city, country, sceneType, or tags
    const searchLower = searchQuery.toLowerCase();
    const queryMatch = 
      card.title.toLowerCase().includes(searchLower) ||
      card.landmark.toLowerCase().includes(searchLower) ||
      card.city.toLowerCase().includes(searchLower) ||
      card.country.toLowerCase().includes(searchLower) ||
      card.sceneType.toLowerCase().includes(searchLower) ||
      card.tags.some(tag => tag.toLowerCase().includes(searchLower));

    // Rarity match
    const rarityMatch = selectedRarity === "all" || card.rarity === selectedRarity;

    // Collection category match
    const collectionMatch = selectedCollectionId === "all" || card.collectionId === selectedCollectionId;

    // Favorites match
    const favMatch = !showOnlyFavorites || card.favorite;

    return queryMatch && rarityMatch && collectionMatch && favMatch;
  });

  const handleCreateBinderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBinderName.trim()) return;
    try {
      await onCreateCollection(newBinderName);
      setNewBinderName("");
      setShowCreateBinder(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto p-5 no-scrollbar pb-24 relative bg-transparent">
      
      {/* Header */}
      <div className="mb-5 shrink-0">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-indigo-500" />
          <span>Explorer Binder</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Browse, filter, and admire your custom-crafted virtual travel card collection.
        </p>
      </div>

      {/* Search and Filters panel */}
      <div className="flex flex-col gap-2.5 shrink-0 mb-5">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search country, city, rarity, tag..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100 border border-slate-200/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-100 focus:border-indigo-400 focus:bg-white"
          />
        </div>

        {/* Filter Toolbar Chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5 select-none shrink-0">
          <button
            onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
            className={`px-3 py-1.5 rounded-full border text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
              showOnlyFavorites 
                ? "bg-rose-500 text-white border-rose-500" 
                : "bg-slate-100 text-slate-500 border-slate-200/60 hover:text-slate-700"
            }`}
          >
            <Star className={`w-3 h-3 ${showOnlyFavorites ? "fill-white" : ""}`} />
            <span>Favourites Only</span>
          </button>

          {/* Rarity selector pill */}
          <select
            value={selectedRarity}
            onChange={(e) => setSelectedRarity(e.target.value)}
            className="px-3 py-1.5 rounded-full border border-slate-200/60 bg-slate-100 text-slate-500 text-[10px] font-bold focus:outline-none cursor-pointer"
          >
            <option value="all">All Rarities</option>
            {Object.values(CardRarity).map(val => (
              <option key={val} value={val}>{val}</option>
            ))}
          </select>

          {/* Create binder fast button */}
          <button
            onClick={() => setShowCreateBinder(true)}
            className="px-3 py-1.5 rounded-full border border-dashed border-indigo-300 bg-indigo-50/50 text-indigo-600 text-[10px] font-bold flex items-center gap-1 hover:bg-indigo-50 transition-all cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Create Binder</span>
          </button>
        </div>
      </div>

      {/* Binder Creation Popup */}
      {showCreateBinder && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-40 flex items-center justify-center p-6">
          <form 
            onSubmit={handleCreateBinderSubmit} 
            className="bg-white border border-indigo-100 rounded-2xl p-5 w-full max-w-xs animate-scale-up shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="font-bold text-slate-800 text-sm mb-1 flex items-center gap-1.5">
              <FolderHeart className="w-4 h-4 text-indigo-500" />
              <span>Create Custom Binder</span>
            </h4>
            <p className="text-xs text-slate-500 mb-4">Create a custom album to organize unique destinations.</p>
            <input 
              type="text" 
              placeholder="e.g. My Honeymoon, Europe 2026..." 
              value={newBinderName}
              onChange={(e) => setNewBinderName(e.target.value)}
              className="w-full bg-white border border-indigo-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 mb-4"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button 
                type="button" 
                onClick={() => setShowCreateBinder(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 text-xs font-semibold hover:text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 cursor-pointer"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Binder Progress Horizontal Scroll */}
      <div className="mb-5 shrink-0">
        <h3 className="text-[10px] font-mono uppercase text-slate-400 mb-2.5 block font-bold">Your Binders</h3>
        <div className="flex gap-3 overflow-x-auto no-scrollbar py-1 pr-1">
          {/* "All" Category card */}
          <div 
            onClick={() => setSelectedCollectionId("all")}
            className={`min-w-[120px] max-w-[120px] rounded-xl p-3 border cursor-pointer select-none transition-all duration-200 ${
              selectedCollectionId === "all" 
                ? "bg-gradient-to-r from-pink-400 to-indigo-500 text-white border-transparent shadow-sm shadow-indigo-100" 
                : "bg-slate-50 text-slate-600 border-slate-200/80 hover:border-indigo-200 hover:bg-slate-100"
            }`}
          >
            <Grid className="w-4 h-4 mb-2.5" />
            <h4 className="font-bold text-xs truncate">All Cards</h4>
            <span className={`text-[10px] font-mono block mt-1 ${selectedCollectionId === "all" ? "text-white/80" : "text-slate-400"}`}>{cards.length} Collectibles</span>
          </div>

          {/* Standard and Custom collections */}
          {allCollections.map(col => {
            const { count, milestone, percentage } = getCollectionProgress(col.id);
            const isSelected = selectedCollectionId === col.id;
            return (
              <div
                key={col.id}
                onClick={() => setSelectedCollectionId(col.id)}
                className={`min-w-[140px] max-w-[140px] rounded-xl p-3 border cursor-pointer select-none transition-all duration-200 flex flex-col justify-between ${
                  isSelected 
                    ? "bg-gradient-to-r from-pink-400 to-indigo-500 text-white border-transparent shadow-sm shadow-indigo-100" 
                    : "bg-slate-50 text-slate-600 border-slate-200/80 hover:border-indigo-200 hover:bg-slate-100"
                }`}
              >
                <div>
                  <div className={`w-6 h-6 rounded-lg mb-2 flex items-center justify-center text-xs ${isSelected ? "bg-white/20 text-white animate-pulse" : "bg-indigo-50 text-indigo-500"}`}>
                    {col.isCustom ? "📂" : "🗺️"}
                  </div>
                  <h4 className="font-bold text-xs truncate leading-snug">{col.name}</h4>
                  <span className={`text-[9px] font-mono mt-0.5 block ${isSelected ? "text-white/85" : "text-slate-400"}`}>{count} / {milestone} cards</span>
                </div>

                {/* Micro Progress Bar */}
                <div className={`w-full h-1 rounded-full mt-3 overflow-hidden ${isSelected ? "bg-white/20" : "bg-slate-200"}`}>
                  <div 
                    className={`h-full rounded-full ${isSelected ? "bg-white" : "bg-indigo-500"}`} 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Collection Grid */}
      <div className="flex-grow flex flex-col">
        <h3 className="text-[10px] font-mono uppercase text-slate-400 mb-3 block font-bold">
          {selectedCollectionId === "all" ? "All Collectibles" : allCollections.find(c => c.id === selectedCollectionId)?.name} ({filteredCards.length})
        </h3>

        {filteredCards.length > 0 ? (
          <div className="grid grid-cols-2 gap-3.5">
            {filteredCards.map(card => (
              <HolographicCard 
                key={card.id} 
                card={card} 
                compact={true} 
                onFavoriteToggle={onFavoriteToggle}
                onDelete={onDelete}
                onClick={() => onSelectCard(card.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 border border-dashed border-indigo-200 rounded-2xl text-center bg-slate-50/50 min-h-[220px]">
            <Compass className="w-8 h-8 text-slate-400 animate-pulse mb-3" />
            <h4 className="font-bold text-slate-500 text-xs">No cards found</h4>
            <p className="text-[10px] text-slate-400 mt-1 max-w-[200px] leading-relaxed">
              No collectibles matched your filter criteria. Go to the Create tab to scan a new photo!
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
