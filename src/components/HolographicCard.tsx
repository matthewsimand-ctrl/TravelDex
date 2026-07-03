/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { TradingCard, CardRarity } from "../types.js";
import { 
  Sparkles, Compass, MapPin, Calendar, Heart, Trash2, RotateCw, BookOpen, 
  Eye, Mountain, Flower2, Landmark, Theater, Camera, Gem, Utensils, Globe, QrCode, Plane, Sun
} from "lucide-react";

interface HolographicCardProps {
  key?: string | number;
  card: TradingCard;
  onFavoriteToggle?: (id: string) => void;
  onDelete?: (id: string) => void;
  compact?: boolean;
  onClick?: () => void;
  isEditing?: boolean;
  onUpdate?: (updatedCard: Partial<TradingCard>) => void;
}

const getCardMoves = (scene: string, stats: any) => {
  const s = scene?.toLowerCase() || "";
  const adventurePower = stats?.adventure ?? 50;
  const beautyPower = stats?.beauty ?? 50;
  const historyPower = stats?.history ?? 50;
  const culturePower = stats?.culture ?? 50;
  const scenicPower = stats?.scenic ?? 50;
  const uniquenessPower = stats?.uniqueness ?? 50;
  const foodPower = stats?.food ?? 50;

  if (s.includes("nature") || s.includes("mountain") || s.includes("outdoor") || s.includes("hike") || s.includes("park") || s.includes("mountains") || s.includes("beach")) {
    return [
      {
        name: "Alpine Ascent",
        cost: ["🧗", "🎒"],
        description: "Conquer sheer cliffs. Increases altitude and stuns opponents with majestic panoramas.",
        damage: 30 + Math.round(adventurePower / 3)
      },
      {
        name: "Primal Trailblaze",
        cost: ["🧭", "📸"],
        description: "Discover a secret scenic overlook. Unleashes crowd-free high-resolution photo strikes.",
        damage: 40 + Math.round(scenicPower / 3)
      }
    ];
  } else if (s.includes("historic") || s.includes("castle") || s.includes("ruin") || s.includes("wonder") || s.includes("architecture") || s.includes("temple") || s.includes("museum")) {
    return [
      {
        name: "Ancient Lore Recall",
        cost: ["🏰", "🎒"],
        description: "Recite historical guides from memory. Highly likely to cause deep, confused slumber.",
        damage: 20 + Math.round(historyPower / 3)
      },
      {
        name: "Relic Discovery",
        cost: ["🧭", "💎"],
        description: "Unearth buried travel treasures. Enhances trade leverage and prestige attributes.",
        damage: 35 + Math.round(culturePower / 3)
      }
    ];
  } else if (s.includes("food") || s.includes("dining") || s.includes("cuisine") || s.includes("feast") || s.includes("cafe") || s.includes("culinary")) {
    return [
      {
        name: "Spicy Street Feast",
        cost: ["🍜", "🌶️"],
        description: "Devour ultra-authentic local spices. Grants temporary speed at the cost of mild stomach fire.",
        damage: 25 + Math.round(foodPower / 3)
      },
      {
        name: "Michelin Gastronomy",
        cost: ["🍜", "✨"],
        description: "Experience a pristine culinary masterpiece. Melts down opponent's elemental defenses.",
        damage: 45 + Math.round(uniquenessPower / 3)
      }
    ];
  } else if (s.includes("city") || s.includes("urban") || s.includes("street") || s.includes("shopping") || s.includes("metropolitan")) {
    return [
      {
        name: "Transit Escalator Sprint",
        cost: ["🏃", "🧭"],
        description: "Navigate high-speed subway staircases with immense precision. Boosts speed and dodge.",
        damage: 30 + Math.round(adventurePower / 3)
      },
      {
        name: "Metropolitan Glare",
        cost: ["📸", "🌟"],
        description: "Deploy ultra-wide lenses during golden hour. Opponents are blinded by perfect lens flare.",
        damage: 40 + Math.round(beautyPower / 3)
      }
    ];
  } else {
    // Default World Wonders / General
    return [
      {
        name: "Souvenir Haggling",
        cost: ["🎒", "🪙"],
        description: "Persuade local merchants to lower keychain prices. Inflicts light emotional damage.",
        damage: 15 + Math.round(culturePower / 4)
      },
      {
        name: "Airport Lounge Powernap",
        cost: ["💤", "🧭"],
        description: "Dose off for 15 minutes in a VIP terminal. Restores 30 Energy and wipes current debuffs.",
        damage: "HEAL"
      }
    ];
  }
};

export default function HolographicCard({ card, onFavoriteToggle, onDelete, compact = false, onClick, isEditing = false, onUpdate }: HolographicCardProps): React.JSX.Element {
  const [isFlipped, setIsFlipped] = useState(false);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glareX, setGlareX] = useState(50);
  const [glareY, setGlareY] = useState(50);
  const cardRef = useRef<HTMLDivElement>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [extractedEdgeColors, setExtractedEdgeColors] = useState<{
    top: string;
    bottom: string;
    left: string;
    right: string;
    average: string;
    borderGlow: string;
  } | null>(null);

  useEffect(() => {
    if (!card.imageUrl) {
      setExtractedEdgeColors(null);
      return;
    }

    const img = new Image();
    // CRITICAL: Avoid CORS issues for standard URL, but bypass for base64 data URLs to prevent security blockages.
    if (!card.imageUrl.startsWith("data:")) {
      img.crossOrigin = "anonymous";
    }
    img.src = card.imageUrl;

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 10;
        canvas.height = 10;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, 10, 10);

        const imgData = ctx.getImageData(0, 0, 10, 10).data;

        // Sample top edge (y=0, x=0..9)
        let tr = 0, tg = 0, tb = 0;
        for (let i = 0; i < 10; i++) {
          const idx = (0 * 10 + i) * 4;
          tr += imgData[idx];
          tg += imgData[idx + 1];
          tb += imgData[idx + 2];
        }
        tr = Math.round(tr / 10);
        tg = Math.round(tg / 10);
        tb = Math.round(tb / 10);

        // Sample bottom edge (y=9, x=0..9)
        let br = 0, bg = 0, bb = 0;
        for (let i = 0; i < 10; i++) {
          const idx = (9 * 10 + i) * 4;
          br += imgData[idx];
          bg += imgData[idx + 1];
          bb += imgData[idx + 2];
        }
        br = Math.round(br / 10);
        bg = Math.round(bg / 10);
        bb = Math.round(bb / 10);

        // Sample left edge (x=0, y=0..9)
        let lr = 0, lg = 0, lb = 0;
        for (let i = 0; i < 10; i++) {
          const idx = (i * 10 + 0) * 4;
          lr += imgData[idx];
          lg += imgData[idx + 1];
          lb += imgData[idx + 2];
        }
        lr = Math.round(lr / 10);
        lg = Math.round(lg / 10);
        lb = Math.round(lb / 10);

        // Sample right edge (x=9, y=0..9)
        let rr = 0, rg = 0, rb = 0;
        for (let i = 0; i < 10; i++) {
          const idx = (i * 10 + 9) * 4;
          rr += imgData[idx];
          rg += imgData[idx + 1];
          rb += imgData[idx + 2];
        }
        rr = Math.round(rr / 10);
        rg = Math.round(rg / 10);
        rb = Math.round(rb / 10);

        // Average overall
        const ar = Math.round((tr + br + lr + rr) / 4);
        const ag = Math.round((tg + bg + lg + rg) / 4);
        const ab = Math.round((tb + bb + lb + rb) / 4);

        // Enhance saturation for beautiful card frame borders
        const saturate = (c: number, amt = 1.15) => Math.min(255, Math.round(c * amt));
        
        setExtractedEdgeColors({
          top: `rgb(${saturate(tr)}, ${saturate(tg)}, ${saturate(tb)})`,
          bottom: `rgb(${Math.max(30, br - 10)}, ${Math.max(30, bg - 10)}, ${Math.max(30, bb - 10)})`,
          left: `rgb(${lr}, ${lg}, ${lb})`,
          right: `rgb(${rr}, ${rg}, ${rb})`,
          average: `rgb(${ar}, ${ag}, ${ab})`,
          borderGlow: `rgba(${saturate(ar, 1.25)}, ${saturate(ag, 1.25)}, ${saturate(ab, 1.25)}, 0.85)`
        });
      } catch (e) {
        console.warn("Failed to extract edge colors from image:", e);
        setExtractedEdgeColors(null);
      }
    };

    img.onerror = () => {
      setExtractedEdgeColors(null);
    };
  }, [card.imageUrl]);

  const rarity = card.rarity;

  // Dynamic RPG game stat bonus based on rarity
  const getStatModifier = (rar: CardRarity) => {
    switch(rar) {
      case CardRarity.COMMON: return "+3 Wanderlust";
      case CardRarity.UNCOMMON: return "+5 Exploration";
      case CardRarity.RARE: return "+7 Cultural Insight";
      case CardRarity.EPIC: return "+10 Inner Serenity";
      case CardRarity.LEGENDARY: return "+12 Global Enlightenment";
      case CardRarity.MYTHIC: return "+15 Cosmic Intellect";
      default: return "+5 Exploration";
    }
  };

  // Rarity Theme Configs (Bright, Pastel, and Classic Card Styling)
  const getRarityConfig = (r: CardRarity) => {
    switch (r) {
      case CardRarity.COMMON:
        return {
          border: "border-slate-300 shadow-[0_0_15px_rgba(148,163,184,0.15)]",
          outerFrame: "bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100 text-slate-600 border-[3px] border-slate-300",
          innerFrame: "border-slate-200 bg-white/70",
          ribbonBg: "bg-slate-200 text-slate-800 border-slate-300",
          glow: "rgba(148,163,184,0.15)",
          shimmer: "from-slate-200/10 via-white/5 to-slate-200/10",
          accentColor: "text-slate-500",
          parchmentBorder: "border-slate-300",
          stars: 1,
          medal: "text-slate-400"
        };
      case CardRarity.UNCOMMON:
        return {
          border: "border-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.2)]",
          outerFrame: "bg-gradient-to-b from-emerald-100 via-emerald-50 to-emerald-100 text-emerald-800 border-[3px] border-emerald-300",
          innerFrame: "border-emerald-200 bg-white/70",
          ribbonBg: "bg-emerald-200 text-emerald-900 border-emerald-300",
          glow: "rgba(52,211,153,0.2)",
          shimmer: "from-emerald-300/20 via-white/10 to-emerald-300/20",
          accentColor: "text-emerald-600",
          parchmentBorder: "border-emerald-300",
          stars: 2,
          medal: "text-emerald-500"
        };
      case CardRarity.RARE:
        return {
          border: "border-sky-300 shadow-[0_0_25px_rgba(56,189,248,0.25)]",
          outerFrame: "bg-gradient-to-b from-sky-100 via-sky-50 to-sky-100 text-sky-850 border-[3px] border-sky-300",
          innerFrame: "border-sky-200 bg-white/70",
          ribbonBg: "bg-sky-200 text-sky-900 border-sky-300",
          glow: "rgba(56,189,248,0.3)",
          shimmer: "from-sky-300/30 via-white/15 to-sky-300/30",
          accentColor: "text-sky-600",
          parchmentBorder: "border-sky-300",
          stars: 3,
          medal: "text-sky-500"
        };
      case CardRarity.EPIC:
        return {
          border: "border-purple-300 shadow-[0_0_30px_rgba(192,132,252,0.3)]",
          outerFrame: "bg-gradient-to-b from-purple-100 via-purple-50 to-purple-100 text-purple-850 border-[3px] border-purple-300",
          innerFrame: "border-purple-200 bg-white/70",
          ribbonBg: "bg-purple-200 text-purple-900 border-purple-300",
          glow: "rgba(192,132,252,0.4)",
          shimmer: "from-purple-300/30 via-white/20 to-purple-300/30",
          accentColor: "text-purple-600",
          parchmentBorder: "border-purple-300",
          stars: 4,
          medal: "text-purple-500"
        };
      case CardRarity.LEGENDARY:
        return {
          border: "border-amber-300 shadow-[0_0_35px_rgba(251,191,36,0.4)]",
          outerFrame: "bg-gradient-to-b from-amber-100 via-amber-50 to-amber-100 text-amber-900 border-[4px] border-amber-350",
          innerFrame: "border-amber-200/50 bg-white/80",
          ribbonBg: "bg-amber-200 text-amber-950 border-amber-300",
          glow: "rgba(251,191,36,0.5)",
          shimmer: "from-amber-300/40 via-white/30 to-amber-300/40",
          accentColor: "text-amber-700 font-extrabold tracking-wider",
          parchmentBorder: "border-amber-300/40",
          stars: 5,
          medal: "text-amber-500"
        };
      case CardRarity.MYTHIC:
        return {
          border: "border-pink-300 shadow-[0_0_40px_rgba(244,63,94,0.45)]",
          outerFrame: "bg-gradient-to-b from-pink-100 via-rose-50 to-violet-100 text-rose-800 border-[4px] border-pink-300",
          innerFrame: "border-pink-200 bg-white/85",
          ribbonBg: "bg-pink-200 text-rose-950 border-pink-300",
          glow: "rgba(244,63,94,0.6)",
          shimmer: "from-pink-300/50 via-white/40 to-cyan-300/50",
          accentColor: "text-pink-600 font-black tracking-widest",
          parchmentBorder: "border-pink-300/40",
          stars: 6,
          medal: "text-pink-500"
        };
    }
  };

  const theme = getRarityConfig(rarity);

  const averageStat = Math.round(
    ((card.stats?.adventure ?? 50) +
     (card.stats?.beauty ?? 50) +
     (card.stats?.history ?? 50) +
     (card.stats?.culture ?? 50) +
     (card.stats?.scenic ?? 50) +
     (card.stats?.uniqueness ?? 50) +
     (card.stats?.food ?? 50)) / 7
  );

  const moves = getCardMoves(card.sceneType, card.stats);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isFlipped) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate rotate degrees based on cursor position relative to card center
    const middleX = rect.width / 2;
    const middleY = rect.height / 2;
    const angleX = -((y - middleY) / middleY) * 14;
    const angleY = ((x - middleX) / middleX) * 14;

    setRotateX(angleX);
    setRotateY(angleY);

    // Glare position percentage
    const percentX = (x / rect.width) * 100;
    const percentY = (y / rect.height) * 100;
    setGlareX(percentX);
    setGlareY(percentY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlareX(50);
    setGlareY(50);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent flip if clicking action buttons or forms
    if ((e.target as HTMLElement).closest(".action-btn")) {
      return;
    }
    if (compact && onClick) {
      onClick();
      return;
    }
    setIsFlipped(!isFlipped);
  };

  // Icon mapping helper for Scene Types
  const getSceneIcon = (type: string) => {
    const t = type?.toLowerCase() || "";
    if (t.includes("beach") || t.includes("lake") || t.includes("water") || t.includes("sea")) return "🏝️";
    if (t.includes("mountain") || t.includes("peak") || t.includes("hike") || t.includes("summit")) return "⛰️";
    if (t.includes("city") || t.includes("urban") || t.includes("street") || t.includes("metropolitan")) return "🌆";
    if (t.includes("museum") || t.includes("art")) return "🖼️";
    if (t.includes("food") || t.includes("dining") || t.includes("cuisine")) return "🍜";
    if (t.includes("wildlife") || t.includes("animal") || t.includes("safari")) return "🦁";
    if (t.includes("historic") || t.includes("castle") || t.includes("ruin") || t.includes("site")) return "🏰";
    if (t.includes("architecture") || t.includes("building") || t.includes("wonder")) return "🏛️";
    if (t.includes("sunset") || t.includes("sunrise") || t.includes("twilight")) return "🌅";
    if (t.includes("adventure") || t.includes("sport") || t.includes("camp")) return "🧗";
    return "🗺️";
  };

  // Compact Mode Render (Simplified Binder/Grid view)
  if (compact) {
    return (
      <div 
        onClick={handleCardClick}
        style={{
          boxShadow: `0 4px 15px ${theme.glow}`,
        }}
        className={`relative group aspect-[2/3] w-full rounded-2xl overflow-hidden border-[3.5px] ${theme.border} ${theme.outerFrame} bg-white cursor-pointer active:scale-95 transition-all duration-300 shadow-sm`}
      >
        {/* Shimmer flare overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[1.5s] ease-out" />
        
        {/* Rarity Star Glow */}
        <div className="absolute top-2 right-2 flex items-center gap-0.5 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] text-indigo-600 z-10 border border-indigo-100 shadow-sm">
          <Sparkles className="w-2.5 h-2.5 text-indigo-500 animate-spin-slow" />
          <span className="font-extrabold uppercase font-mono tracking-tight text-indigo-600">{rarity}</span>
        </div>

        {/* Hero image filling the top */}
        <div className="w-full h-[65%] relative overflow-hidden bg-slate-50 border-b border-indigo-50">
          <img 
            src={card.imageUrl} 
            alt={card.landmark} 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/5 to-transparent" />
        </div>

        {/* Caption */}
        <div className="absolute bottom-0 inset-x-0 p-3 flex flex-col justify-end bg-gradient-to-t from-white via-white/95 to-transparent pt-6">
          <div className="text-[8.5px] font-mono uppercase tracking-widest text-pink-500 flex items-center gap-1 font-bold">
            <span>{getSceneIcon(card.sceneType)}</span>
            <span>{card.sceneType}</span>
          </div>
          <h4 className="font-serif font-black text-sm text-slate-800 truncate tracking-tight mt-1">{card.landmark}</h4>
          <p className="text-[10px] text-slate-500 truncate flex items-center gap-0.5 mt-0.5 font-mono">
            <MapPin className="w-2.5 h-2.5 text-rose-500 shrink-0" />
            <span>{card.city}, {card.country}</span>
          </p>
        </div>
      </div>
    );
  }

  // Double-sided Deluxe 3D Holographic Trading Card
  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleCardClick}
      style={{
        transform: !isFlipped 
          ? `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1, 1, 1)`
          : "perspective(1200px) rotateY(180deg)",
        transition: isFlipped ? "transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)" : "transform 0.1s ease-out, shadow 0.1s ease-out",
        boxShadow: `0 12px 35px ${theme.glow}`,
      }}
      className={`relative w-[360px] h-[550px] rounded-[24px] cursor-pointer preserve-3d select-none ${theme.border} ${theme.outerFrame} transition-shadow duration-300 z-30`}
    >
      {/* FRONT SIDE */}
      <div 
        className="absolute inset-[8px] p-3.5 flex flex-col justify-between backface-hidden rounded-[16px] overflow-hidden bg-[#FAF9F5] border border-slate-200/50 z-10 shadow-inner"
        style={{ transform: "rotateY(0deg)" }}
      >
        {/* Blurred background image representing the uploaded photo as the background */}
        {card.imageUrl && (
          <div 
            className="absolute inset-0 pointer-events-none opacity-[0.14] blur-md z-0"
            style={{
              backgroundImage: `url(${card.imageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        )}
        {/* Interactive Dynamic Holographic Prism overlay */}
        <div 
          className="absolute inset-0 pointer-events-none mix-blend-color-dodge opacity-20 z-20"
          style={{
            background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.9) 0%, transparent 60%), 
                         linear-gradient(${glareY}deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.3) 50%, rgba(255, 255, 255, 0) 100%)`
          }}
        />

        {/* 1. Styled Card Header Nameplate */}
        <div className="z-30 shrink-0 relative flex items-center justify-between bg-gradient-to-r from-white via-slate-50 to-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 shadow-sm h-11 select-none">
          {/* Left Side: Element Icon + Text Name */}
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <span className="text-xs bg-indigo-50 border border-indigo-100 w-6 h-6 rounded-full flex items-center justify-center filter drop-shadow-sm shrink-0">
              {getSceneIcon(card.sceneType)}
            </span>
            <div className="flex flex-col justify-center leading-none min-w-0 flex-1 w-full" onClick={(e) => e.stopPropagation()}>
              {isEditing && onUpdate ? (
                <input
                  type="text"
                  value={card.landmark}
                  onChange={(e) => onUpdate({ landmark: e.target.value })}
                  className="text-[12.5px] font-sans font-black text-slate-800 tracking-wide uppercase bg-transparent border-b border-indigo-200 focus:outline-none w-full focus:border-indigo-500 py-0"
                  placeholder="LANDMARK"
                />
              ) : (
                <h3 className="text-[12.5px] font-sans font-black text-slate-800 tracking-wide uppercase truncate">
                  {card.landmark}
                </h3>
              )}
              {isEditing && onUpdate ? (
                <div className="flex gap-1 mt-0.5">
                  <input
                    type="text"
                    value={card.city}
                    onChange={(e) => onUpdate({ city: e.target.value })}
                    className="text-[7px] font-mono font-extrabold tracking-widest text-indigo-500 uppercase bg-transparent border-b border-indigo-100 focus:outline-none w-1/2 py-0"
                    placeholder="CITY"
                  />
                  <input
                    type="text"
                    value={card.country}
                    onChange={(e) => onUpdate({ country: e.target.value })}
                    className="text-[7px] font-mono font-extrabold tracking-widest text-indigo-500 uppercase bg-transparent border-b border-indigo-100 focus:outline-none w-1/2 py-0"
                    placeholder="COUNTRY"
                  />
                </div>
              ) : (
                <span className="text-[7.5px] font-mono font-extrabold tracking-widest text-indigo-500 uppercase truncate">
                  {card.city.toUpperCase()}, {card.country.substring(0, 3).toUpperCase()}
                </span>
              )}
            </div>
          </div>

          {/* Right Side: Level Badge (EXP) & Stars */}
          <div className="flex items-center gap-1.5 shrink-0 ml-1.5">
            {/* EXP Badge */}
            <div className="bg-gradient-to-r from-pink-500 to-indigo-600 border border-indigo-200 px-1.5 py-0.5 rounded text-white font-mono text-[9px] font-black tracking-tighter shadow-sm flex items-center gap-0.5 select-none shrink-0">
              <span className="text-[6.5px] opacity-80 font-black">EXP</span>
              <span>{averageStat}</span>
            </div>

            {/* Stars Emblem */}
            <div 
              className="w-6 h-7 bg-white flex items-center justify-center border border-indigo-200 shadow-sm relative shrink-0"
              style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
            >
              <div className="absolute inset-[1.5px] bg-indigo-50 flex items-center justify-center" style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}>
                <span className="text-[8px] font-mono text-indigo-600 font-extrabold">{theme.stars}★</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Illustration Frame */}
        <div className={`relative w-full h-[180px] rounded-xl overflow-hidden border-2 border-indigo-200 shadow-sm my-1 bg-slate-50 z-30 group shrink-0`}>
          <img 
            src={card.imageUrl} 
            alt={card.landmark} 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-500"
          />
          <div className="absolute inset-0 border border-white/10 pointer-events-none z-10" />

          {/* Visited Stamp Overlay (Postmark sticker) */}
          <div className="absolute bottom-3 left-3 bg-white text-slate-850 px-2 py-1 shadow-md border border-indigo-100 rounded-sm rotate-[-5deg] z-30 flex flex-col items-center justify-center select-none max-w-[90px] text-center font-mono pointer-events-none">
            <div className="absolute inset-[-1.5px] border border-dashed border-indigo-300 rounded-sm" />
            <span className="text-[5px] font-bold text-slate-400 uppercase tracking-widest leading-none">Visited On</span>
            <span className="text-[7.5px] font-black uppercase text-indigo-600 mt-0.5 leading-none">{card.dateVisited || "JULY 2026"}</span>
            <Plane className="w-2.5 h-2.5 text-indigo-400 mt-1 fill-indigo-400/5 rotate-[-45deg]" />
          </div>

          {/* Location Caption Overlay (capsule) */}
          <div className="absolute bottom-2.5 right-2.5 bg-white/95 backdrop-blur-md border border-indigo-100 rounded-full px-2.5 py-0.5 text-[8px] font-mono text-slate-700 flex items-center gap-1 shadow-sm z-30 font-bold">
            <MapPin className="w-2.5 h-2.5 text-rose-500 fill-rose-500/10" />
            <span className="uppercase text-slate-750 tracking-tight">{card.city}</span>
          </div>

          {/* GPS coordinates capsule */}
          <div className="absolute top-2.5 right-2.5 bg-white/95 backdrop-blur-md border border-indigo-100 rounded-full px-2 py-0.5 text-[7px] font-mono text-slate-700 flex items-center gap-1 shadow-sm z-30 font-bold" onClick={(e) => e.stopPropagation()}>
            <Compass className="w-2.5 h-2.5 text-pink-500 animate-spin-slow shrink-0" />
            {isEditing && onUpdate ? (
              <input
                type="text"
                value={card.coordinates}
                onChange={(e) => onUpdate({ coordinates: e.target.value })}
                className="bg-transparent text-[7px] text-slate-700 font-mono font-bold focus:outline-none w-20 border-b border-indigo-300 py-0"
                placeholder="GPS COORDS"
              />
            ) : (
              <span>{card.coordinates}</span>
            )}
          </div>
        </div>

        {/* 3. Stats Row Strip */}
        <div className="grid grid-cols-7 border-y border-indigo-100 bg-white/60 divide-x divide-indigo-50 py-1 z-30 select-none shrink-0 rounded-lg">
          {[
            { label: "ADVENTURE", value: card.stats.adventure, color: "text-emerald-600", icon: Mountain },
            { label: "BEAUTY", value: card.stats.beauty, color: "text-pink-600", icon: Flower2 },
            { label: "HISTORY", value: card.stats.history, color: "text-amber-600", icon: Landmark },
            { label: "CULTURE", value: card.stats.culture, color: "text-purple-600", icon: Theater },
            { label: "SCENIC", value: card.stats.scenic, color: "text-sky-600", icon: Camera },
            { label: "UNIQUENESS", value: card.stats.uniqueness, color: "text-rose-600", icon: Gem },
            { label: "FOOD", value: card.stats.food, color: "text-orange-600", icon: Utensils }
          ].map((stat) => {
            const StatIcon = stat.icon;
            return (
              <div key={stat.label} className="flex flex-col items-center justify-center px-0.5">
                <span className="text-[5.5px] font-mono font-bold text-slate-400 uppercase tracking-tight block scale-[0.85]">{stat.label}</span>
                <StatIcon className={`w-3.5 h-3.5 my-0.5 ${stat.color}`} />
                <span className={`text-[9.5px] font-mono font-black ${stat.color}`}>{stat.value}</span>
              </div>
            );
          })}
        </div>

        {/* 4. Textured Parchment Adventure & Moves Box */}
        <div className={`relative flex flex-col bg-amber-50/80 border border-amber-200/80 rounded-xl p-2 text-slate-800 shadow-[inset_0_1px_3px_rgba(0,0,0,0.05)] z-30 grow overflow-hidden my-1`}>
          {/* Elegant corner marks */}
          <div className="absolute top-1 left-1 w-1.5 h-1.5 border-t border-l border-amber-900/30" />
          <div className="absolute top-1 right-1 w-1.5 h-1.5 border-t border-r border-amber-900/30" />
          <div className="absolute bottom-1 left-1 w-1.5 h-1.5 border-b border-l border-amber-900/30" />
          <div className="absolute bottom-1 right-1 w-1.5 h-1.5 border-b border-r border-amber-900/30" />

          {/* Parchment Box Header */}
          <span className="text-[8.5px] font-mono font-black text-amber-900/80 text-center uppercase tracking-widest block mb-1.5 border-b border-amber-900/10 pb-0.5">
            ✦ TRAVEL ACTIONS & ABILITIES ✦
          </span>

          {/* Moves List */}
          <div className="flex flex-col gap-2 flex-1 justify-center">
            {moves.map((move, idx) => (
              <div key={idx} className="flex flex-col border-b border-dashed border-amber-900/10 last:border-0 pb-1.5 last:pb-0">
                {/* Move Name, Cost & Power */}
                <div className="flex items-center justify-between select-none">
                  {/* Cost + Name */}
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="flex gap-0.5 text-[8.5px] shrink-0">
                      {move.cost.map((symbol, sIdx) => (
                        <span key={sIdx} className="filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)]">{symbol}</span>
                      ))}
                    </div>
                    <span className="text-[10px] font-sans font-extrabold text-slate-900 uppercase tracking-tight truncate">
                      {move.name}
                    </span>
                  </div>

                  {/* Power/Damage value */}
                  <span className="text-[10px] font-mono font-black text-amber-850 flex items-center gap-0.5 shrink-0 ml-1">
                    {typeof move.damage === "number" ? `${move.damage} DMG` : move.damage}
                  </span>
                </div>

                {/* Move description */}
                <p className="text-[8px] leading-relaxed text-slate-600 font-serif italic mt-0.5 pl-[28px] line-clamp-2">
                  {move.description}
                </p>
              </div>
            ))}
          </div>

          {/* Circular Red Ink Passport Stamp */}
          <div className="absolute right-1 bottom-1 w-10 h-10 rounded-full border-[1.5px] border-red-500/20 flex flex-col items-center justify-center rotate-[15deg] pointer-events-none scale-[0.85] z-10">
            <div className="absolute inset-[1px] rounded-full border border-dashed border-red-500/15" />
            <span className="text-[4px] font-mono font-bold text-red-500/25 uppercase tracking-widest leading-none">
              {card.city ? card.city.substring(0, 7) : "FIELD"}
            </span>
            <span className="text-[5.5px] font-serif font-black text-red-500/25 uppercase tracking-tight leading-none mt-0.5">
              PASSED
            </span>
          </div>
        </div>

        {/* 5. Footer Strip & Metadata */}
        <div className="flex flex-col gap-1 z-30 shrink-0 select-none">
          {/* Quote Italicized */}
          <div className="px-4" onClick={(e) => e.stopPropagation()}>
            {isEditing && onUpdate ? (
              <input
                type="text"
                value={card.flavorText}
                onChange={(e) => onUpdate({ flavorText: e.target.value })}
                className="w-full text-[8.5px] text-slate-600 italic text-center bg-transparent border-b border-indigo-200 focus:outline-none py-0"
                placeholder="QUOTE / FLAVOR TEXT"
              />
            ) : (
              <p className="text-[8.5px] text-slate-500 italic text-center tracking-wide truncate">
                "{card.flavorText}"
              </p>
            )}
          </div>

          {/* Dynamic Stat Modifier */}
          <span className="text-[8px] font-mono font-black text-pink-500 text-center uppercase tracking-widest leading-none mb-0.5">
            {getStatModifier(rarity)}
          </span>

          {/* Metadata Footer Grid */}
          <div className="grid grid-cols-4 items-center text-[7.5px] font-mono border-t border-indigo-100 pt-1 text-slate-400 uppercase leading-none">
            <div className="flex flex-col">
              <span className="text-slate-400 font-bold scale-90 origin-left">Collection</span>
              <span className="text-indigo-650 font-black mt-0.5 truncate flex items-center gap-0.5">
                <Globe className="w-2.5 h-2.5 text-indigo-500 shrink-0" />
                <span>WONDERS</span>
              </span>
            </div>

            <div className="flex justify-center">
              <Sun className="w-4 h-4 text-amber-500 animate-spin-slow" />
            </div>

            <div className="flex flex-col text-right">
              <span className="text-slate-400 font-bold scale-90 origin-right">Rarity</span>
              <span className="text-pink-500 font-black mt-0.5 truncate">{rarity}</span>
            </div>

            <div className="flex justify-end pl-2">
              <div className="w-5 h-5 border border-indigo-100 rounded bg-indigo-50 flex items-center justify-center text-indigo-550 shadow-inner">
                <QrCode className="w-3.5 h-3.5 opacity-70" />
              </div>
            </div>
          </div>
        </div>

        {/* Floating click prompt overlay */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-1 text-[7.5px] font-mono text-slate-400 z-30 pointer-events-none tracking-wider uppercase font-bold">
          <BookOpen className="w-2.5 h-2.5 text-indigo-400" />
          <span>Tap to Flip Notebook</span>
        </div>
      </div>

      {/* BACK SIDE (Explorer's Journal Notes) */}
      <div 
        className="absolute inset-[8px] p-4 flex flex-col justify-between backface-hidden rounded-[16px] overflow-hidden bg-white border border-slate-200 z-10 shadow-inner"
        style={{ transform: "rotateY(180deg)" }}
      >
        {/* Blurred background image representing the uploaded photo as the background */}
        {card.imageUrl && (
          <div 
            className="absolute inset-0 pointer-events-none opacity-[0.09] blur-md z-0"
            style={{
              backgroundImage: `url(${card.imageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        )}
        <div className="flex flex-col gap-3 flex-1 overflow-y-auto no-scrollbar z-30 relative">
          
          {/* Header */}
          <div className="border-b border-rose-100 pb-2.5 flex justify-between items-center shrink-0">
            <div>
              <h3 className="font-serif font-black text-md text-indigo-650 flex items-center gap-1.5 uppercase tracking-wide">
                <span>{getSceneIcon(card.sceneType)}</span>
                <span className="truncate max-w-[170px]">{card.landmark}</span>
              </h3>
              <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5 font-mono">
                <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                <span>{card.city}, {card.country}</span>
              </p>
            </div>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(false);
              }}
              className="action-btn p-1.5 rounded-full bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors shadow-sm cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Notebook Textlines Styling (Research Diary) */}
          <div className="flex flex-col bg-[#FDFBF7] rounded-xl p-3 border border-amber-100 relative overflow-hidden shrink-0" onClick={(e) => e.stopPropagation()}>
            <span className="font-bold text-amber-600 block text-[9px] uppercase font-mono tracking-widest mb-1.5">Research Journal</span>
            <div className="relative leading-relaxed text-slate-700 font-serif text-[11px] p-2 bg-white rounded-lg border border-amber-100/50">
              {isEditing && onUpdate ? (
                <textarea
                  rows={2}
                  value={card.description}
                  onChange={(e) => onUpdate({ description: e.target.value })}
                  className="w-full bg-transparent text-slate-700 font-serif text-[11px] focus:outline-none resize-none border-b border-amber-200"
                  placeholder="Journal description..."
                />
              ) : (
                <p className="italic text-justify text-slate-700">
                  "{card.description}"
                </p>
              )}
            </div>
          </div>

          {/* Interactive Did You Know Box */}
          <div className="flex flex-col bg-purple-50 rounded-xl p-3 border border-purple-100 shrink-0" onClick={(e) => e.stopPropagation()}>
            <span className="font-bold text-purple-600 block text-[9px] uppercase font-mono tracking-widest mb-1.5">Did You Know?</span>
            {isEditing && onUpdate ? (
              <textarea
                rows={2}
                value={card.funFact}
                onChange={(e) => onUpdate({ funFact: e.target.value })}
                className="w-full bg-transparent text-purple-800 font-serif text-[11px] focus:outline-none resize-none border-b border-purple-200"
                placeholder="Fun facts..."
              />
            ) : (
              <p className="text-[11px] text-purple-800 font-serif leading-relaxed italic">
                {card.funFact}
              </p>
            )}
          </div>

          {/* Travel Tip Box */}
          <div className="flex flex-col bg-indigo-50 rounded-xl p-3 border border-indigo-100 shrink-0" onClick={(e) => e.stopPropagation()}>
            <span className="font-bold text-indigo-600 block text-[9px] uppercase font-mono tracking-widest mb-1.5">Insider Travel Tip</span>
            {isEditing && onUpdate ? (
              <textarea
                rows={2}
                value={card.travelTip}
                onChange={(e) => onUpdate({ travelTip: e.target.value })}
                className="w-full bg-transparent text-indigo-800 text-[11px] focus:outline-none resize-none border-b border-indigo-200"
                placeholder="Travel tip..."
              />
            ) : (
              <p className="text-[11px] text-indigo-800 leading-relaxed font-sans">
                {card.travelTip}
              </p>
            )}
          </div>

          {/* Coordinates & Date metadata */}
          <div className="grid grid-cols-2 gap-2 text-[9px] font-mono text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 shrink-0 mt-1 font-bold">
            <div className="flex flex-col">
              <span className="text-slate-400 font-black uppercase text-[7.5px] tracking-wider">Coordinates</span>
              <span className="truncate text-indigo-600 mt-0.5">{card.coordinates}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-400 font-black uppercase text-[7.5px] tracking-wider">Visited Date</span>
              <span className="text-pink-600 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3 h-3 text-pink-500 shrink-0" />
                <span>{card.dateVisited || "JULY 2026"}</span>
              </span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 shrink-0 mt-1" onClick={(e) => e.stopPropagation()}>
            {isEditing && onUpdate ? (
              <input
                type="text"
                value={card.tags.join(", ")}
                onChange={(e) => onUpdate({ tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })}
                className="w-full text-[8.5px] font-mono px-2 py-1 rounded bg-pink-50 border border-pink-200 text-pink-600 font-bold focus:outline-none"
                placeholder="TAGS (COMMA SEPARATED)"
              />
            ) : (
              card.tags.map(tag => (
                <span key={tag} className="text-[8.5px] font-mono px-2 py-0.5 rounded bg-pink-50 border border-pink-100 text-pink-600 font-bold">
                  #{tag.toUpperCase()}
                </span>
              ))
            )}
          </div>
        </div>

        {/* Action button row */}
        <div className="border-t border-slate-100 pt-3 flex justify-between gap-2.5 z-30 shrink-0">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (onFavoriteToggle) onFavoriteToggle(card.id);
            }}
            className={`action-btn flex-1 py-2.5 px-3 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold transition-all duration-200 cursor-pointer ${
              card.favorite 
                ? "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100" 
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <Heart className={`w-4 h-4 ${card.favorite ? "fill-rose-500 text-rose-500 animate-pulse" : "text-slate-400"}`} />
            <span>{card.favorite ? "Favourited" : "Favourite"}</span>
          </button>

          {onDelete && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteConfirm(true);
              }}
              className="action-btn px-3 py-2.5 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 border border-slate-200 hover:border-rose-200 transition-all duration-200 cursor-pointer"
              title="Delete Card"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Global In-App Delete Confirmation Modal Overlay */}
      {showDeleteConfirm && (
        <div 
          className="absolute inset-0 bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-50 rounded-[24px] animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-3 bg-rose-500/10 rounded-full border border-rose-500/20 text-rose-500 mb-4 animate-bounce">
            <Trash2 className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-white text-sm">Disintegrate Artifact?</h4>
          <p className="text-[10px] text-slate-400 mt-1.5 max-w-[220px] leading-relaxed">
            Are you sure you want to permanently erase <strong>{card.landmark}</strong>? This action is irreversible.
          </p>
          <div className="flex gap-2 w-full mt-6">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteConfirm(false);
              }}
              className="flex-grow py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              Keep Card
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onDelete) onDelete(card.id);
                setShowDeleteConfirm(false);
              }}
              className="flex-grow py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-900/30 cursor-pointer transition-colors"
            >
              Erase Forever
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
