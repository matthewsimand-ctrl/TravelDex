/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { 
  Camera, Upload, Sparkles, Image as ImageIcon, MapPin, Check, 
  RefreshCw, FolderOpen, ArrowLeft, RotateCw, Compass, FileText, 
  BookOpen, Eye, Info, Sliders, Edit3, Zap
} from "lucide-react";
import { TRAVEL_PRESETS, TravelPreset } from "../presets.js";
import { TradingCard, CardRarity, UserProfile } from "../types.js";
import HolographicCard from "./HolographicCard.tsx";

interface ExploreViewProps {
  profile: UserProfile | null;
  onCardGenerated: (card: Partial<TradingCard>) => Promise<void>;
  collections: { id: string; name: string; iconName: string }[];
  initialTab?: "presets" | "upload" | "camera" | "manual";
  onTogglePremium: (isPremium: boolean) => Promise<void>;
}

export default function ExploreView({ profile, onCardGenerated, collections, initialTab, onTogglePremium }: ExploreViewProps) {
  const [activeTab, setActiveTab] = useState<"presets" | "upload" | "camera" | "manual">("presets");
  const [dragActive, setDragActive] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Sync activeTab if initialTab prop changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Manual creation form states
  const [manualTitle, setManualTitle] = useState("");
  const [manualLandmark, setManualLandmark] = useState("");
  const [manualCity, setManualCity] = useState("");
  const [manualCountry, setManualCountry] = useState("");
  const [manualRarity, setManualRarity] = useState<CardRarity>(CardRarity.COMMON);
  const [manualSceneType, setManualSceneType] = useState("Nature");
  const [manualCoordinates, setManualCoordinates] = useState("");
  const [manualDescription, setManualDescription] = useState("");
  const [manualFunFact, setManualFunFact] = useState("");
  const [manualTravelTip, setManualTravelTip] = useState("");
  const [manualFlavorText, setManualFlavorText] = useState("");
  const [manualTags, setManualTags] = useState("");
  const [manualCollectionId, setManualCollectionId] = useState("col-world-wonders");
  const [manualStats, setManualStats] = useState({
    adventure: 75,
    beauty: 80,
    history: 65,
    culture: 70,
    food: 60,
    scenic: 85,
    uniqueness: 75
  });
  
  // Camera variables
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Review & Confirmation Draft State
  const [draftCard, setDraftCard] = useState<TradingCard | null>(null);
  // Active subsection of manual form/editor: "info", "stats", "journal"
  const [editorSubTab, setEditorSubTab] = useState<"info" | "stats" | "journal">("info");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Loading quotes for the scan state
  const loadingQuotes = [
    "Establishing global GPS coordinates...",
    "Analyzing landmark architecture & textures...",
    "Scanning color palettes and time of day...",
    "Extracting historical significance database...",
    "Generating fun trivia facts and travel tips...",
    "Determining card rarity coefficient...",
    "Engraving holographic overlays..."
  ];

  const triggerLoadingSequence = () => {
    setIsGenerating(true);
    setLoadingStep(0);
    const interval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev >= loadingQuotes.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 1800);
    return interval;
  };

  // Preset Generator
  const handlePresetSelect = async (preset: TravelPreset) => {
    const interval = triggerLoadingSequence();
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: preset.imageUrl,
          landmarkHint: preset.landmark
        })
      });
      const data = await response.json();
      if (data.card) {
        setDraftCard({
          ...data.card,
          id: `draft-${Date.now()}`,
          imageUrl: preset.imageUrl,
          favorite: false,
          collectionId: data.card.collectionId || "col-world-wonders"
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      clearInterval(interval);
      setIsGenerating(false);
    }
  };

  // File Upload Handlers
  const processFile = (file: File) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setCapturedImage(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Real Camera Controls
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: 640, height: 480 }
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error("Camera access denied:", err);
      setCameraError("Camera access denied or unavailable. Please use photo upload instead.");
      setActiveTab("upload");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const handleGenerateFromUploadOrCamera = async () => {
    if (!capturedImage) return;

    const interval = triggerLoadingSequence();
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: capturedImage,
          mimeType: "image/jpeg"
        })
      });
      const data = await response.json();
      if (data.card) {
        setDraftCard({
          ...data.card,
          id: `draft-${Date.now()}`,
          imageUrl: capturedImage,
          favorite: false,
          collectionId: data.card.collectionId || "col-world-wonders"
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      clearInterval(interval);
      setIsGenerating(false);
    }
  };

  // Save the Draft Card to local collection
  const handleConfirmSave = async () => {
    if (!draftCard) return;
    try {
      await onCardGenerated(draftCard);
      // Reset State
      setDraftCard(null);
      setCapturedImage(null);
      setSelectedFile(null);
      // Reset manual fields
      setManualLandmark("");
      setManualTitle("");
      setManualCity("");
      setManualCountry("");
      setManualCoordinates("");
      setManualFlavorText("");
      setManualDescription("");
      setManualFunFact("");
      setManualTravelTip("");
      setManualTags("");
    } catch (e) {
      console.error(e);
    }
  };

  // Update Draft Card Fields (Live Reactive Binding!)
  const updateDraftCard = (fields: Partial<TradingCard>) => {
    setDraftCard(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        ...fields
      };
    });
  };

  // Update Draft Card Stats (Live Slider Binding!)
  const updateDraftCardStat = (statName: string, val: number) => {
    setDraftCard(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        stats: {
          ...prev.stats,
          [statName]: val
        }
      };
    });
  };

  // Manual Draft Card Live Preview Generator Object
  const manualDraftMockCard: TradingCard = {
    id: "manual-draft-id",
    landmark: manualLandmark || "Grand Sanctuary",
    title: manualTitle || "Elysian Heights",
    city: manualCity || "Eldoria",
    country: manualCountry || "Terra Nova",
    imageUrl: capturedImage || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80",
    sceneType: manualSceneType || "Nature",
    coordinates: manualCoordinates || "34.0522° N, 118.2437° W",
    rarity: manualRarity || CardRarity.COMMON,
    dateVisited: "JULY 2026",
    cardNumber: "DEX-999",
    stats: {
      adventure: manualStats.adventure,
      beauty: manualStats.beauty,
      history: manualStats.history,
      culture: manualStats.culture,
      food: manualStats.food,
      scenic: manualStats.scenic,
      uniqueness: manualStats.uniqueness,
    },
    description: manualDescription || "A beautiful manual blueprint ready for printing. Fill out the details on the form to engrave your custom travel card.",
    funFact: manualFunFact || "Manual cards let you craft your own custom landmarks, ratings, and diary reflections.",
    travelTip: manualTravelTip || "Keep documenting your beautiful journeys across the planet!",
    flavorText: manualFlavorText || "A hand-crafted keepsake of a beautiful memory.",
    tags: manualTags ? manualTags.split(",").map(t => t.trim()).filter(Boolean) : ["Explorer", "Custom"],
    collectionId: manualCollectionId,
    favorite: false,
    photoQualityScore: 95
  };

  // Upload/Camera Live Preview Generator Object
  const uploadDraftMockCard: TradingCard = {
    id: "upload-draft-id",
    landmark: "Uploaded Snapshot",
    title: "AI Analysis Pending",
    city: "Scanning Location...",
    country: "World",
    imageUrl: capturedImage || "",
    sceneType: "Nature",
    coordinates: "Calculating GPS...",
    rarity: CardRarity.COMMON,
    dateVisited: "JULY 2026",
    cardNumber: "DEX-???",
    stats: {
      adventure: 50,
      beauty: 50,
      history: 50,
      culture: 50,
      food: 50,
      scenic: 50,
      uniqueness: 50
    },
    description: "Your travel snapshot has been uploaded successfully! Click the 'Analyze & Generate AI Card' button below to trigger Gemini's multimodal scanner. Gemini will analyze the landscape architecture, calculate coordinates, and formulate a highly customized, double-sided holographic card complete with fun facts, travel tips, and specialized stats.",
    funFact: "Did you know? Gemini can analyze textures, colors, and key landforms in your travel photos to pinpoint historical sites and wonders.",
    travelTip: "Press the button below to initialize AI-assisted card printing.",
    flavorText: "A snapshot of a beautiful journey.",
    tags: ["Upload", "Pending"],
    collectionId: "col-world-wonders",
    favorite: false,
    photoQualityScore: 90
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto p-4 no-scrollbar pb-24">
      
      {/* 1. Loading AI Scanning Screen */}
      {isGenerating && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-lg z-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="relative mb-8">
            <div className="w-24 h-24 rounded-full border-4 border-pink-200 border-t-pink-500 border-r-pink-500 animate-spin" />
            <div className="absolute inset-2 rounded-full border border-dashed border-pink-300 animate-pulse flex items-center justify-center">
              <Compass className="w-10 h-10 text-pink-500 animate-spin-slow" />
            </div>
            <div className="absolute top-0 inset-x-0 h-0.5 bg-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.8)] animate-bounce" />
          </div>

          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-2 justify-center">
            <Sparkles className="w-5 h-5 text-pink-500 animate-pulse" />
            <span>AI Landmark Analyst</span>
          </h3>
          
          <div className="h-10 text-sm text-indigo-600 font-mono max-w-sm px-4">
            {loadingQuotes[loadingStep]}
          </div>

          <p className="text-xs text-slate-400 mt-12 max-w-[280px]">
            Please hold on while Gemini processes your travel photo, estimates GPS coordinates, and prints your holographic trading card...
          </p>
        </div>
      )}

      {/* 2. Unified Live Card Editor & Review Screen */}
      {draftCard ? (
        <div className="flex-grow flex flex-col gap-4 animate-fade-in">
          
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-rose-100 pb-3">
            <button 
              onClick={() => setDraftCard(null)}
              className="p-1.5 rounded-full bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h3 className="font-extrabold text-slate-800 text-md flex items-center gap-1.5">
                <Edit3 className="w-4.5 h-4.5 text-indigo-500" />
                <span>TravelDex Live Engraver</span>
              </h3>
              <p className="text-[11px] text-slate-500">Tweak stats, descriptions, or name in real time before printing</p>
            </div>
          </div>

          {/* TWO COLUMN LIVE CARD EDITOR LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* COLUMN A: Dynamic Holographic Card Live Preview Area (3D, Flipped, Glowing) */}
            <div className="lg:col-span-5 flex flex-col items-center gap-3.5 lg:sticky lg:top-4 relative z-20 py-2">
              <div className="text-center">
                <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full flex items-center gap-1.5 justify-center">
                  <Sparkles className="w-3 h-3 text-pink-500 animate-pulse" />
                  <span>Interactive Card Face</span>
                </span>
              </div>

              {/* Holographic Interactive Card Component */}
              <div className="active:scale-95 transition-transform duration-200 shadow-xl">
                <HolographicCard 
                  card={draftCard} 
                  isEditing={true}
                  onUpdate={(fields) => updateDraftCard(fields)}
                />
              </div>

              <div className="text-center text-[10px] text-slate-400 font-mono mt-1">
                <span>💡 Hover to see holo shine • Tap card to view Journal back</span>
              </div>
            </div>

            {/* COLUMN B: Complete Real-Time Parameters Control Panel */}
            <div className="lg:col-span-7 flex flex-col gap-4 bg-white border border-indigo-100 rounded-2xl p-4 md:p-5 shadow-sm">
              
              {/* Tabs for sections */}
              <div className="grid grid-cols-3 bg-slate-100 p-1 rounded-xl border border-slate-200 select-none text-[11px] font-mono">
                <button
                  onClick={() => setEditorSubTab("info")}
                  className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    editorSubTab === "info" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>Blueprint</span>
                </button>
                <button
                  onClick={() => setEditorSubTab("stats")}
                  className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    editorSubTab === "stats" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Stats</span>
                </button>
                <button
                  onClick={() => setEditorSubTab("journal")}
                  className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    editorSubTab === "journal" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Journal</span>
                </button>
              </div>

              {/* Tab 1: Blueprint Info */}
              {editorSubTab === "info" && (
                <div className="flex flex-col gap-4 animate-fade-in text-xs">
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono text-indigo-600 uppercase tracking-wider font-bold">Landmark Name</label>
                      <input 
                        type="text" 
                        value={draftCard.landmark}
                        onChange={(e) => updateDraftCard({ landmark: e.target.value })}
                        className="w-full bg-white border border-indigo-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-850 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="e.g. Santorini"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono text-indigo-600 uppercase tracking-wider font-bold">Card Tagline/Title</label>
                      <input 
                        type="text" 
                        value={draftCard.title}
                        onChange={(e) => updateDraftCard({ title: e.target.value })}
                        className="w-full bg-white border border-indigo-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-850 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="e.g. Jewel of the Aegean"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono text-indigo-600 uppercase tracking-wider font-bold">City</label>
                      <input 
                        type="text" 
                        value={draftCard.city}
                        onChange={(e) => updateDraftCard({ city: e.target.value })}
                        className="w-full bg-white border border-indigo-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-850 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="e.g. Oia"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono text-indigo-600 uppercase tracking-wider font-bold">Country</label>
                      <input 
                        type="text" 
                        value={draftCard.country}
                        onChange={(e) => updateDraftCard({ country: e.target.value })}
                        className="w-full bg-white border border-indigo-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-850 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="e.g. Greece"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono text-indigo-600 uppercase tracking-wider font-bold">Card Rarity</label>
                      <select 
                        value={draftCard.rarity}
                        onChange={(e) => updateDraftCard({ rarity: e.target.value as CardRarity })}
                        className="w-full bg-white border border-indigo-200 rounded-xl px-3 py-2.5 text-xs text-slate-850 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                      >
                        {Object.values(CardRarity).map(rar => (
                          <option key={rar} value={rar}>{rar}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono text-indigo-600 uppercase tracking-wider font-bold">Scene Theme</label>
                      <select 
                        value={draftCard.sceneType}
                        onChange={(e) => updateDraftCard({ sceneType: e.target.value })}
                        className="w-full bg-white border border-indigo-200 rounded-xl px-3 py-2.5 text-xs text-slate-850 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                      >
                        <option value="World Wonders">World Wonders</option>
                        <option value="Mountains">Mountains</option>
                        <option value="Historic Site">Historic Site</option>
                        <option value="Beaches & Lakes">Beaches & Lakes</option>
                        <option value="Metropolitan">Metropolitan</option>
                        <option value="Wildlife Safari">Wildlife Safari</option>
                        <option value="Sunset">Sunset</option>
                        <option value="Nature">Nature</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono text-indigo-600 uppercase tracking-wider font-bold">GPS Coordinates</label>
                      <input 
                        type="text" 
                        value={draftCard.coordinates}
                        onChange={(e) => updateDraftCard({ coordinates: e.target.value })}
                        className="w-full bg-white border border-indigo-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-850 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="e.g. 36.418° N, 25.435° E"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono text-indigo-600 uppercase tracking-wider font-bold">Target Binder Album</label>
                      <select 
                        value={draftCard.collectionId}
                        onChange={(e) => updateDraftCard({ collectionId: e.target.value })}
                        className="w-full bg-white border border-indigo-200 rounded-xl px-3 py-2.5 text-xs text-slate-850 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                      >
                        {collections.map(col => (
                          <option key={col.id} value={col.id}>{col.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono text-indigo-600 uppercase tracking-wider font-bold">Card Number Tag</label>
                    <input 
                      type="text" 
                      value={draftCard.cardNumber}
                      onChange={(e) => updateDraftCard({ cardNumber: e.target.value })}
                      className="w-full bg-white border border-indigo-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-850 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g. 124/900"
                    />
                  </div>
                </div>
              )}

              {/* Tab 2: Sliders for Card Stats */}
              {editorSubTab === "stats" && (
                <div className="flex flex-col gap-4 animate-fade-in text-xs">
                  <h4 className="text-[10px] font-mono text-indigo-600 uppercase tracking-wider border-b border-indigo-100 pb-1 font-extrabold">Ratings & Stats Coefficients</h4>
                  <div className="grid grid-cols-1 gap-3.5">
                    {Object.keys(draftCard.stats || {}).map((statKey) => {
                      const statVal = (draftCard.stats as any)[statKey] || 50;
                      return (
                        <div key={statKey} className="flex flex-col gap-1">
                          <div className="flex justify-between items-center text-[11px] font-mono">
                            <span className="text-slate-700 capitalize font-bold">{statKey} rating</span>
                            <span className="text-indigo-600 font-extrabold text-xs">{statVal} / 100</span>
                          </div>
                          <input 
                            type="range" 
                            min="10" 
                            max="100"
                            value={statVal}
                            onChange={(e) => updateDraftCardStat(statKey, Number(e.target.value))}
                            className="w-full accent-indigo-600 bg-indigo-50 h-2 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab 3: Detailed Journal Narrative, Quotes, Tips */}
              {editorSubTab === "journal" && (
                <div className="flex flex-col gap-4 animate-fade-in text-xs">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono text-indigo-600 uppercase tracking-wider font-bold">Italicized Quote / Flavor Text</label>
                    <input 
                      type="text" 
                      value={draftCard.flavorText}
                      onChange={(e) => updateDraftCard({ flavorText: e.target.value })}
                      className="w-full bg-white border border-indigo-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-850 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g. Where the sky kisses the sea..."
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono text-indigo-600 uppercase tracking-wider font-bold">Research Journal Description</label>
                    <textarea 
                      rows={3}
                      value={draftCard.description}
                      onChange={(e) => updateDraftCard({ description: e.target.value })}
                      className="w-full bg-white border border-indigo-200 rounded-xl px-3.5 py-2 text-xs text-slate-850 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Provide a detailed description of the landmark..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono text-indigo-600 uppercase tracking-wider font-bold">Fun Trivia Fact</label>
                      <textarea 
                        rows={3}
                        value={draftCard.funFact}
                        onChange={(e) => updateDraftCard({ funFact: e.target.value })}
                        className="w-full bg-white border border-indigo-200 rounded-xl px-3.5 py-2 text-xs text-slate-850 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="A did-you-know fact..."
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono text-indigo-600 uppercase tracking-wider font-bold">Insider Travel Tip</label>
                      <textarea 
                        rows={3}
                        value={draftCard.travelTip}
                        onChange={(e) => updateDraftCard({ travelTip: e.target.value })}
                        className="w-full bg-white border border-indigo-200 rounded-xl px-3.5 py-2 text-xs text-slate-850 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Insider visitor recommendation..."
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono text-indigo-600 uppercase tracking-wider font-bold">Tags (comma separated)</label>
                    <input 
                      type="text" 
                      value={draftCard.tags.join(", ")}
                      onChange={(e) => updateDraftCard({ tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })}
                      className="w-full bg-white border border-indigo-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-850 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g. Greece, Sunset, Dome"
                    />
                  </div>
                </div>
              )}

              {/* Confirmation Buttons */}
              <div className="border-t border-rose-100 pt-4 mt-2 flex flex-col gap-2">
                <button
                  onClick={handleConfirmSave}
                  className="w-full bg-gradient-to-r from-pink-500 to-indigo-600 hover:opacity-95 text-white py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-xs shadow-md shadow-indigo-100 cursor-pointer"
                >
                  <Check className="w-4 h-4 text-white stroke-[3]" />
                  <span>Engrave to TravelDex Collection</span>
                </button>
                
                <button
                  onClick={() => setDraftCard(null)}
                  className="w-full bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200 py-3 rounded-xl text-xs font-medium cursor-pointer transition-colors"
                >
                  Discard and Try Another Photo
                </button>
              </div>

            </div>

          </div>

        </div>
      ) : (
        /* 3. Standard Uploader Screen */
        <div className="flex-grow flex flex-col">
          
          {/* Header */}
          <div className="mb-5 shrink-0">
            {activeTab === "manual" ? (
              <>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                  <FileText className="w-6 h-6 text-emerald-500" />
                  <span>Custom Hand-Engraver</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Design and print a custom travel card manually with instant live previews.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-pink-500 animate-spin-slow" />
                  <span>AI Card Creator</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Transform your travel photos into premium collectible trading cards.
                </p>
              </>
            )}
          </div>

          {/* Tab Navigation Controls */}
          <div className="grid grid-cols-4 bg-slate-100 p-1 rounded-xl mb-5 border border-slate-200 shrink-0 select-none">
            {[
              { id: "presets", label: "Presets", icon: ImageIcon },
              { id: "upload", label: "Upload", icon: Upload },
              { id: "camera", label: "Camera", icon: Camera },
              { id: "manual", label: "Manual", icon: FileText }
            ].map(tab => {
              const IconComp = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    if (tab.id === "camera") {
                      startCamera();
                    } else {
                      stopCamera();
                    }
                    if (tab.id !== "camera") {
                      setCapturedImage(null);
                    }
                  }}
                  className={`flex flex-col items-center justify-center gap-1.5 py-2 rounded-lg text-[9px] sm:text-[10px] md:text-xs font-bold transition-all cursor-pointer ${
                    isSelected 
                      ? "bg-gradient-to-r from-pink-400 to-indigo-500 text-white shadow-sm" 
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Conditional Premium Lock Screen */}
          {!profile?.isPremium && activeTab !== "manual" ? (
            <div className="flex-grow flex flex-col items-center justify-center p-6 text-center bg-white/70 backdrop-blur-md rounded-2xl border border-pink-200 shadow-sm relative overflow-hidden animate-fade-in my-4">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-pink-300/20 blur-[30px] rounded-full pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-300/20 blur-[30px] rounded-full pointer-events-none" />
              
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-500 to-indigo-600 p-[1.5px] shadow-[0_0_25px_rgba(236,72,153,0.25)] mb-4 animate-bounce">
                <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-pink-500" />
                </div>
              </div>

              <span className="text-[10px] font-mono font-bold bg-pink-500 text-white px-2 py-0.5 rounded-full uppercase tracking-widest shadow-sm">
                Premium Feature
              </span>
              
              <h3 className="font-black text-slate-800 text-lg mt-3 tracking-tight">
                Unlock AI Expedition Scan
              </h3>
              
              <p className="text-xs text-slate-500 mt-2 max-w-[280px] leading-relaxed">
                Let Gemini AI scan your travel snapshots to auto-detect coordinates, country, town, historical fun facts, and forge exotic holographic cards!
              </p>

              <div className="my-5 w-full max-w-[260px] bg-indigo-50/50 border border-indigo-100/60 rounded-xl p-3 text-left space-y-2 select-none">
                <div className="flex items-center gap-2 text-[11px] text-slate-600 font-medium">
                  <div className="w-4 h-4 rounded bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold shrink-0 text-[10px]">✓</div>
                  <span>Gemini AI Photo Landscape Scan</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-600 font-medium">
                  <div className="w-4 h-4 rounded bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold shrink-0 text-[10px]">✓</div>
                  <span>Smart Coordinates & History Detection</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-600 font-medium">
                  <div className="w-4 h-4 rounded bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold shrink-0 text-[10px]">✓</div>
                  <span>Mythic & Legendary Holographic Themes</span>
                </div>
              </div>

              <button
                id="paywall-unlock-btn"
                onClick={() => onTogglePremium(true)}
                className="w-full max-w-[260px] bg-gradient-to-r from-pink-500 to-indigo-600 hover:opacity-95 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md shadow-pink-100 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Upgrade Now (Simulate Pay)</span>
              </button>

              <span className="text-[9px] font-mono text-slate-400 mt-2 block">
                Free trial testing mode • Instant activation
              </span>
            </div>
          ) : (
            <>
              {/* Preset Tab Content */}
              {activeTab === "presets" && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <h3 className="text-xs font-mono uppercase text-slate-400 mb-3 block font-bold">Choose a Travel Destination</h3>
              <div className="flex-1 overflow-y-auto no-scrollbar grid grid-cols-2 gap-3.5 pr-0.5">
                {TRAVEL_PRESETS.map((preset) => (
                  <div 
                    key={preset.id}
                    onClick={() => handlePresetSelect(preset)}
                    className="group relative h-36 sm:h-40 rounded-2xl overflow-hidden border border-indigo-100 bg-white cursor-pointer hover:border-pink-400 hover:shadow-md transition-all active:scale-95 shadow-sm"
                  >
                    <img 
                      src={preset.imageUrl} 
                      alt={preset.landmark} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-slate-900/10 to-transparent" />
                    
                    <div className="absolute bottom-3 inset-x-3 flex flex-col">
                      <span className="text-[10px] font-bold text-slate-100 font-serif leading-tight truncate">{preset.landmark}</span>
                      <span className="text-[8px] font-mono text-pink-300 uppercase tracking-widest mt-0.5 font-extrabold">{preset.country}</span>
                    </div>

                    {/* Choose Badge */}
                    <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-pink-400 to-indigo-500 text-white rounded-full p-1.5 transition-opacity">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* File Upload Tab Content */}
          {activeTab === "upload" && (
            <div className="flex-grow flex flex-col items-center justify-center py-6">
              {capturedImage ? (
                <div className="w-full max-w-md flex flex-col items-center gap-5">
                  <div className="active:scale-95 transition-transform duration-200 shadow-xl">
                    <HolographicCard card={uploadDraftMockCard} />
                  </div>
                  
                  <p className="text-[10px] text-slate-400 font-mono text-center">
                    💡 Hover to test holographic reflection • Tap card to preview reverse Journal details
                  </p>

                  <div className="flex gap-3 w-full max-w-[360px]">
                    <button
                      onClick={() => {
                        setCapturedImage(null);
                        setSelectedFile(null);
                      }}
                      className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200 py-3 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Change Photo
                    </button>
                    
                    <button
                      onClick={handleGenerateFromUploadOrCamera}
                      className="flex-[2] bg-gradient-to-r from-pink-400 to-indigo-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-1.5 text-xs shadow-md shadow-pink-100 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-pink-100 fill-pink-100/20 animate-pulse" />
                      <span>Analyze & Generate AI Card</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full max-w-sm aspect-[4/3] rounded-2xl border border-dashed flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all ${
                    dragActive 
                      ? "border-pink-400 bg-pink-50/20" 
                      : "border-indigo-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/10 shadow-sm"
                  }`}
                >
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange}
                    className="hidden" 
                  />
                  <div className="p-4 bg-indigo-50 rounded-full border border-indigo-100 mb-4 text-indigo-500">
                    <Upload className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-700 text-sm">Upload Travel Snapshot</h4>
                  <p className="text-xs text-slate-400 mt-2 max-w-[220px] mx-auto leading-relaxed">
                    Drag & drop your travel photo or click to browse. We'll scan details using Gemini!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Camera Scan Tab Content */}
          {activeTab === "camera" && (
            <div className="flex-grow flex flex-col items-center justify-center py-6">
              {cameraError ? (
                <div className="bg-red-50 border border-red-200 text-red-500 p-4 rounded-xl text-xs max-w-sm text-center">
                  <p>{cameraError}</p>
                </div>
              ) : capturedImage ? (
                <div className="w-full max-w-md flex flex-col items-center gap-5">
                  <div className="active:scale-95 transition-transform duration-200 shadow-xl">
                    <HolographicCard card={{ ...uploadDraftMockCard, id: "camera-draft-id", landmark: "Captured Snapshot", description: "Your camera snapshot is ready! Click the 'Analyze & Generate AI Card' button below to trigger Gemini's landmark analysis scanner and print your card." }} />
                  </div>

                  <p className="text-[10px] text-slate-400 font-mono text-center">
                    💡 Hover to test holographic reflection • Tap card to preview reverse Journal details
                  </p>

                  <div className="flex gap-3 w-full max-w-[360px]">
                    <button
                      onClick={() => {
                        setCapturedImage(null);
                        startCamera();
                      }}
                      className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200 py-3 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Retake Photo
                    </button>

                    <button
                      onClick={handleGenerateFromUploadOrCamera}
                      className="flex-[2] bg-gradient-to-r from-pink-400 to-indigo-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-1.5 text-xs shadow-md shadow-pink-100 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-4.5 h-4.5 text-pink-100 fill-pink-100/20" />
                      <span>Analyze & Generate AI Card</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full max-w-sm flex flex-col gap-4">
                  <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-indigo-100 bg-slate-900 shadow-inner flex items-center justify-center">
                    <video 
                      ref={videoRef}
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 border border-dashed border-pink-400 rounded-2xl pointer-events-none m-3 animate-pulse" />
                  </div>

                  <div className="flex gap-2.5">
                    <button
                      onClick={capturePhoto}
                      className="flex-1 bg-gradient-to-r from-pink-400 to-indigo-500 text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-opacity hover:opacity-95 cursor-pointer"
                    >
                      <Camera className="w-4.5 h-4.5 text-white" />
                      <span>Snap Photo</span>
                    </button>
                    <button
                      onClick={() => {
                        stopCamera();
                        setActiveTab("upload");
                      }}
                      className="w-full bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-500 py-3 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Switch to File Upload
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Manual Tab Content with Requisite Questionnaire Wizard */}
          {activeTab === "manual" && (
            <div className="flex-grow flex flex-col items-center justify-center py-2">
              <div className="w-full max-w-lg bg-white border border-indigo-100 p-6 rounded-2xl shadow-sm flex flex-col gap-5">
                
                <div className="border-b border-rose-100 pb-4">
                  <h3 className="text-sm font-mono uppercase tracking-wider text-indigo-600 font-bold flex items-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    <span>Custom Blueprint Creator</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Please provide the fundamental details below. Once initialized, we will open the dynamic card editor for full real-time customization of all stats, facts, and texts.
                  </p>
                </div>

                {/* 1. Image Upload zone */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono text-indigo-600 uppercase tracking-wider font-bold">
                    Card Artwork Image *
                  </label>
                  {capturedImage ? (
                    <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden border border-indigo-100 bg-slate-50 group">
                      <img src={capturedImage} alt="Manual preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button 
                          onClick={() => {
                            setCapturedImage(null);
                            setSelectedFile(null);
                          }}
                          className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-lg"
                        >
                          Remove Photo
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`w-full aspect-[16/10] rounded-xl border border-dashed flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all ${
                        dragActive 
                          ? "border-pink-400 bg-pink-50/10" 
                          : "border-indigo-200 bg-slate-50/50 hover:border-indigo-400 hover:bg-indigo-50/10"
                      }`}
                    >
                      <input 
                        ref={fileInputRef}
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange}
                        className="hidden" 
                      />
                      <div className="p-2.5 bg-indigo-50 rounded-full border border-indigo-100 mb-2 text-indigo-500">
                        <Upload className="w-4.5 h-4.5" />
                      </div>
                      <h4 className="font-bold text-slate-700 text-xs">Upload Custom Landscape *</h4>
                      <p className="text-[9.5px] text-slate-400 mt-1 max-w-[200px] leading-relaxed">
                        Drag & drop your travel photo or click to browse.
                      </p>
                    </div>
                  )}
                </div>

                {/* 2. Landmark Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono text-indigo-600 uppercase tracking-wider font-bold">Landmark Name *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Kyoto Golden Pavilion"
                    value={manualLandmark}
                    onChange={(e) => setManualLandmark(e.target.value)}
                    className="w-full bg-white border border-indigo-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                {/* 3. City and Country */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono text-indigo-600 uppercase tracking-wider font-bold">City *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Kyoto"
                      value={manualCity}
                      onChange={(e) => setManualCity(e.target.value)}
                      className="w-full bg-white border border-indigo-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono text-indigo-600 uppercase tracking-wider font-bold">Country *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Japan"
                      value={manualCountry}
                      onChange={(e) => setManualCountry(e.target.value)}
                      className="w-full bg-white border border-indigo-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* 4. Rarity and Theme */}
                <div className="grid grid-cols-2 gap-3.5 border-t border-rose-100 pt-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono text-indigo-600 uppercase tracking-wider font-bold">Card Rarity</label>
                    <select 
                      value={manualRarity}
                      onChange={(e) => setManualRarity(e.target.value as CardRarity)}
                      className="w-full bg-white border border-indigo-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    >
                      {Object.values(CardRarity).map(rar => (
                        <option key={rar} value={rar}>{rar}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono text-indigo-600 uppercase tracking-wider font-bold">Scene Theme</label>
                    <select 
                      value={manualSceneType}
                      onChange={(e) => setManualSceneType(e.target.value)}
                      className="w-full bg-white border border-indigo-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="World Wonders">World Wonders</option>
                      <option value="Mountains">Mountains</option>
                      <option value="Historic Site">Historic Site</option>
                      <option value="Beaches & Lakes">Beaches & Lakes</option>
                      <option value="Metropolitan">Metropolitan</option>
                      <option value="Wildlife Safari">Wildlife Safari</option>
                      <option value="Sunset">Sunset</option>
                      <option value="Nature">Nature</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!capturedImage) {
                      alert("Please upload a custom Card Artwork image to proceed.");
                      return;
                    }
                    if (!manualLandmark.trim()) {
                      alert("Please enter a Landmark Name.");
                      return;
                    }
                    if (!manualCity.trim()) {
                      alert("Please enter a City.");
                      return;
                    }
                    if (!manualCountry.trim()) {
                      alert("Please enter a Country.");
                      return;
                    }
                    
                    // Generate draftCard with manual values
                    const generatedCard: TradingCard = {
                      ...manualDraftMockCard,
                      id: `manual-${Date.now()}`
                    };
                    setDraftCard(generatedCard);
                  }}
                  className="w-full bg-gradient-to-r from-pink-400 to-indigo-500 hover:opacity-95 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 text-xs shadow-md shadow-pink-100 transition-all mt-2 cursor-pointer"
                >
                  <FileText className="w-4.5 h-4.5 text-pink-100" />
                  <span>Generate Custom Card & Open Live Engraver</span>
                </button>

              </div>
            </div>
          )}
          </>
          )}
        </div>
      )}
    </div>
  );
}
