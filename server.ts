/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import {
  getDB,
  saveDB,
  addCard,
  deleteCard,
  toggleFavorite,
  createCollection,
  getPresetCollections,
  resetDB
} from "./server_db.js";
import { CardRarity, TradingCard } from "./src/types.js";

// Load environment variables
dotenv.config();

const PORT = 3000;
const app = express();

// Set high limits for base64 photo uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Initialize Gemini API client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  console.log("Initializing Gemini client with API Key...");
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
} else {
  console.warn("GEMINI_API_KEY environment variable is missing or placeholder. Running in demo fallback mode.");
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// Get complete database (cards, collections, profile, achievements)
app.get("/api/db", async (req, res) => {
  try {
    const db = await getDB();
    const defaultCollections = getPresetCollections();
    res.json({
      ...db,
      presetCollections: defaultCollections
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to read database", message: error.message });
  }
});

// Create custom collection
app.post("/api/collections", async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Collection name is required" });
  }
  try {
    const db = await createCollection(name);
    res.json(db);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to create collection", message: error.message });
  }
});

// Save trading card to collection
app.post("/api/cards", async (req, res) => {
  const cardData: Partial<TradingCard> = req.body;
  
  if (!cardData.landmark || !cardData.imageUrl) {
    return res.status(400).json({ error: "Landmark name and image URL are required" });
  }

  try {
    const db = await getDB();
    // Assign unique card number and ID
    const paddedNum = String(db.cards.length + 1).padStart(3, "0");
    const newCard: TradingCard = {
      id: cardData.id || `card-${Date.now()}`,
      title: cardData.title || `${cardData.landmark} Expedition`,
      landmark: cardData.landmark,
      city: cardData.city || "Unknown City",
      country: cardData.country || "Unknown Country",
      imageUrl: cardData.imageUrl,
      sceneType: cardData.sceneType || "Nature",
      coordinates: cardData.coordinates || "0.0000° N, 0.0000° E",
      rarity: cardData.rarity || CardRarity.COMMON,
      dateVisited: cardData.dateVisited || new Date().toISOString().split("T")[0],
      cardNumber: `TD-${paddedNum}`,
      stats: {
        adventure: cardData.stats?.adventure ?? Math.floor(Math.random() * 40) + 50,
        beauty: cardData.stats?.beauty ?? Math.floor(Math.random() * 40) + 50,
        history: cardData.stats?.history ?? Math.floor(Math.random() * 40) + 50,
        culture: cardData.stats?.culture ?? Math.floor(Math.random() * 40) + 50,
        food: cardData.stats?.food ?? Math.floor(Math.random() * 40) + 50,
        scenic: cardData.stats?.scenic ?? Math.floor(Math.random() * 40) + 50,
        uniqueness: cardData.stats?.uniqueness ?? Math.floor(Math.random() * 40) + 50,
      },
      description: cardData.description || "No description provided.",
      funFact: cardData.funFact || "A beautiful spot waiting to be fully researched.",
      travelTip: cardData.travelTip || "Respect the local environment and culture.",
      flavorText: cardData.flavorText || "A keepsake of a unique moment in space and time.",
      tags: cardData.tags || ["Travel", "Memory"],
      collectionId: cardData.collectionId || "col-world-wonders",
      favorite: cardData.favorite || false,
      photoQualityScore: cardData.photoQualityScore || Math.floor(Math.random() * 20) + 80
    };

    const updatedDB = await addCard(newCard);
    res.json(updatedDB);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to save card", message: error.message });
  }
});

// Delete card from collection
app.delete("/api/cards/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const updatedDB = await deleteCard(id);
    res.json(updatedDB);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to delete card", message: error.message });
  }
});

// Toggle favorite state of card
app.post("/api/cards/:id/favorite", async (req, res) => {
  const { id } = req.params;
  try {
    const updatedDB = await toggleFavorite(id);
    res.json(updatedDB);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to toggle favorite", message: error.message });
  }
});

// Update profile premium status
app.post("/api/profile/premium", async (req, res) => {
  const { isPremium } = req.body;
  try {
    const db = await getDB();
    db.profile.isPremium = !!isPremium;
    await saveDB(db);
    res.json(db);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update premium status", message: error.message });
  }
});

// Reset database route (mainly for debugging/cleaning up)
app.post("/api/reset", async (req, res) => {
  try {
    const DB_FILE = path.join(process.cwd(), "travel_dex_db.json");
    if (fs.existsSync(DB_FILE)) {
      fs.unlinkSync(DB_FILE);
    }
    const db = await resetDB();
    res.json(db);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to reset database", message: error.message });
  }
});

// AI Analyze Photo and Generate Trading Card details
app.post("/api/generate", async (req, res) => {
  const { image, mimeType, landmarkHint } = req.body;

  if (!image) {
    return res.status(400).json({ error: "Image data (base64 or URL) is required" });
  }

  // Fallback demo generation if AI is not available or fails
  const makeFallbackCard = (landmarkName = "Majestic Lookout") => {
    const rarities = [CardRarity.COMMON, CardRarity.UNCOMMON, CardRarity.RARE, CardRarity.EPIC, CardRarity.LEGENDARY];
    const pickedRarity = rarities[Math.floor(Math.random() * rarities.length)];
    const types = ["Mountain", "Beach", "City", "Historic Site", "Architecture", "Nature"];
    const pickedScene = types[Math.floor(Math.random() * types.length)];
    return {
      title: `Grand ${landmarkName}`,
      landmark: landmarkName,
      city: "Scenic Valley",
      country: "Earthland",
      sceneType: pickedScene,
      coordinates: `${(Math.random() * 180 - 90).toFixed(4)}° N, ${(Math.random() * 360 - 180).toFixed(4)}° E`,
      rarity: pickedRarity,
      stats: {
        adventure: Math.floor(Math.random() * 40) + 60,
        beauty: Math.floor(Math.random() * 30) + 70,
        history: Math.floor(Math.random() * 60) + 40,
        culture: Math.floor(Math.random() * 50) + 50,
        food: Math.floor(Math.random() * 50) + 40,
        scenic: Math.floor(Math.random() * 20) + 80,
        uniqueness: Math.floor(Math.random() * 50) + 50,
      },
      description: `A stunning photograph showcasing the epic atmosphere of ${landmarkName}. The rich lighting captures the pristine essence of this scenic spot, making it a perfect collectible memory.`,
      funFact: `This region hosts over 100 species of rare flora and fauna, and has been visited by explorers for generations.`,
      travelTip: `Be sure to arrive just before sunset to capture the legendary golden lighting which cascades over the peaks.`,
      flavorText: `A timeless snapshot of nature's raw majesty. Grants +15 Wanderlust.`,
      tags: [pickedScene, "Adventure", "Vibrant"],
      collectionId: pickedScene === "Mountain" ? "col-mountains" : pickedScene === "Historic Site" ? "col-historic" : "col-world-wonders",
      photoQualityScore: Math.floor(Math.random() * 15) + 85
    };
  };

  // If Gemini API is not available, return mock card details instantly
  if (!ai) {
    console.log("No Gemini client initialized. Serving high-fidelity fallback card.");
    return res.json({ card: makeFallbackCard(landmarkHint) });
  }

  try {
    let responseText = "";

    // If it's a web URL (like preset unsplash links), we can instruct Gemini to analyze the landmark
    // Alternatively, if it is a base64 string, we pass it as inlineData
    const isBase64 = image.startsWith("data:") || !image.startsWith("http");
    
    let contents: any[] = [];
    if (isBase64) {
      // Clean up base64 header if present
      const base64DataOnly = image.replace(/^data:image\/\w+;base64,/, "");
      const cleanMimeType = mimeType || "image/jpeg";
      
      contents = [
        {
          inlineData: {
            mimeType: cleanMimeType,
            data: base64DataOnly
          }
        },
        {
          text: `You are looking at a travel photo.
Identify the landmark, city, and country. If you cannot identify a specific landmark, make a creative best guess or describe the scenery beautifully (e.g. "Alpine Ridge" or "Sun-Kissed Shore").
Optional user hint: "${landmarkHint || ''}".

Generate a complete JSON object matching this TypeScript structure:
{
  "title": "Evocative, short trading card name (e.g., 'Gladiator\\'s Echo' or 'Golden Pagoda')",
  "landmark": "The specific landmark name",
  "city": "The city or region",
  "country": "The country name",
  "sceneType": "One of: Beach, Mountain, City, Museum, Food, Nature, Historic Site, Architecture, Wildlife, Sunset, Adventure",
  "coordinates": "Estimated GPS coordinates as a string (e.g., '35.3606° N, 138.7274° E')",
  "rarity": "One of: Common, Uncommon, Rare, Epic, Legendary, Mythic (World wonders and high-scoring photos tend Legendary/Mythic. Hidden gems Epic. Standard scenes Common/Rare. Remote places increase rarity)",
  "stats": {
    "adventure": 1-100 score,
    "beauty": 1-100 score,
    "history": 1-100 score,
    "culture": 1-100 score,
    "food": 1-100 score,
    "scenic": 1-100 score,
    "uniqueness": 1-100 score
  },
  "description": "A poetic, detailed paragraph summarizing the historic, natural or cultural significance of this scene (3-4 sentences).",
  "funFact": "A highly interesting and surprising historical, geographical or cultural trivia fact about this place.",
  "travelTip": "An insider travel tip for someone visiting this spot (e.g. best time to visit, secret spot).",
  "flavorText": "RPG trading card style flavor text (e.g. 'Among the quiet ruins, the old gods whispers still. Grants +10 Focus.')",
  "tags": ["3 to 5 lowercase tags related to the scenery and vibe"],
  "collectionId": "Pick the most matching ID from: 'col-world-wonders', 'col-mountains', 'col-historic', 'col-beaches', 'col-cities', 'col-wildlife'. Default to 'col-world-wonders' if unsure.",
  "photoQualityScore": 1-100 score evaluating this composition
}

Output ONLY the raw JSON. Do not include markdown wraps or triple backticks.`
        }
      ];
    } else {
      // For web image URLs, we can fetch or let Gemini analyze using general knowledge of the landmark
      contents = [
        {
          text: `Analyze the famous travel destination: "${landmarkHint || 'Eiffel Tower'}" located at ${image}.
Generate a complete JSON object representing a beautiful Travel Trading Card. Matches this TypeScript structure:
{
  "title": "Evocative, short trading card name (e.g. 'Crown of the Andes')",
  "landmark": "The specific landmark name",
  "city": "The city or region",
  "country": "The country",
  "sceneType": "One of: Beach, Mountain, City, Museum, Food, Nature, Historic Site, Architecture, Wildlife, Sunset, Adventure",
  "coordinates": "Estimated GPS coordinates as string (e.g., '13.1631° S, 72.5450° W')",
  "rarity": "One of: Common, Uncommon, Rare, Epic, Legendary, Mythic",
  "stats": {
    "adventure": 1-100,
    "beauty": 1-100,
    "history": 1-100,
    "culture": 1-100,
    "food": 1-100,
    "scenic": 1-100,
    "uniqueness": 1-100
  },
  "description": "A captivating, beautiful description of this spot (3-4 sentences).",
  "funFact": "An interesting, true trivia fact.",
  "travelTip": "An insider tip for visiting.",
  "flavorText": "Collectible card style flavor text.",
  "tags": ["3 to 5 tags"],
  "collectionId": "Matching collection ID: 'col-world-wonders', 'col-mountains', 'col-historic', 'col-beaches', 'col-cities', 'col-wildlife'"
}
Output ONLY the raw JSON. Do not wrap in markdown.`
        }
      ];
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        responseMimeType: "application/json",
      },
    });

    responseText = response.text || "";
    
    // Clean up potential markdown formatting block
    let cleanJsonStr = responseText.trim();
    if (cleanJsonStr.startsWith("```json")) {
      cleanJsonStr = cleanJsonStr.substring(7);
    }
    if (cleanJsonStr.endsWith("```")) {
      cleanJsonStr = cleanJsonStr.substring(0, cleanJsonStr.length - 3);
    }
    cleanJsonStr = cleanJsonStr.trim();

    const parsedCard = JSON.parse(cleanJsonStr);
    
    // Ensure photo quality score exists
    if (!parsedCard.photoQualityScore) {
      parsedCard.photoQualityScore = Math.floor(Math.random() * 15) + 85;
    }

    res.json({ card: parsedCard });
  } catch (error: any) {
    console.error("Gemini Card Generation failed:", error);
    // Return a beautiful fallback card rather than failing the experience
    const mockLandmark = landmarkHint || "Stunning Discovery";
    res.json({
      card: makeFallbackCard(mockLandmark),
      warning: "AI generation failed. Fallback card was generated."
    });
  }
});

// ----------------------------------------------------
// VITE OR STATIC FILE SERVING
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TravelDex custom server running at http://localhost:${PORT}`);
  });
}

startServer();
