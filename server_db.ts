/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from "fs";
import path from "path";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { TradingCard, TravelCollection, Achievement, UserProfile, CardRarity } from "./src/types.js";

// Load configuration for the Firebase database ID and Project ID
const configPath = path.join(process.cwd(), "firebase-applet-config.json");
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));

if (!getApps().length) {
  initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

// Initialize Firestore targeting the specific named database instance
const firestoreDb = getFirestore(firebaseConfig.firestoreDatabaseId);

export interface LocalDB {
  cards: TradingCard[];
  customCollections: TravelCollection[];
  profile: UserProfile;
  achievements: Achievement[];
}

const DEFAULT_COLLECTIONS: TravelCollection[] = [
  { id: "col-world-wonders", name: "World Wonders", iconName: "Globe", description: "Collect the greatest monuments built by humankind.", isCustom: false },
  { id: "col-mountains", name: "Mountains", iconName: "Mountain", description: "Climb high and collect the world's most dramatic peaks.", isCustom: false },
  { id: "col-historic", name: "Historic Sites", iconName: "Castle", description: "Trace the footsteps of ancient civilisations.", isCustom: false },
  { id: "col-beaches", name: "Beaches & Lakes", iconName: "Waves", description: "Sun-kissed shores and tranquil turquoise waters.", isCustom: false },
  { id: "col-cities", name: "Metropolitan", iconName: "Building2", description: "Skyscrapers, neon lights, and buzzing urban lanes.", isCustom: false },
  { id: "col-wildlife", name: "Wildlife Safari", iconName: "Compass", description: "Encounter majestic creatures in their natural habitat.", isCustom: false }
];

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: "ach-first-step", title: "First Expedition", description: "Generate your very first travel trading card.", unlockedAt: "2026-07-03T10:00:00.000Z", iconName: "Compass", badgeColor: "from-blue-400 to-blue-600" },
  { id: "ach-trio", title: "Trio Explorer", description: "Collect 3 trading cards.", unlockedAt: "2026-07-03T10:15:00.000Z", iconName: "Award", badgeColor: "from-green-400 to-green-600" },
  { id: "ach-legend", title: "Mythic Dreamer", description: "Collect a Legendary or Mythic rarity card.", unlockedAt: null, iconName: "Sparkles", badgeColor: "from-amber-400 to-amber-600" },
  { id: "ach-multi-country", title: "Globetrotter", description: "Collect cards from 3 different countries.", unlockedAt: "2026-07-03T10:20:00.000Z", iconName: "Map", badgeColor: "from-purple-400 to-purple-600" },
  { id: "ach-beach-master", title: "Beach Bum", description: "Collect 3 water-themed destinations.", unlockedAt: null, iconName: "Waves", badgeColor: "from-cyan-400 to-cyan-600" }
];

const DEFAULT_CARDS: TradingCard[] = [
  {
    id: "card-fuji-init",
    title: "Sacred Snows of Fuji",
    landmark: "Mount Fuji",
    city: "Shizuoka",
    country: "Japan",
    imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop&q=80",
    sceneType: "Mountain",
    coordinates: "35.3606° N, 138.7274° E",
    rarity: CardRarity.LEGENDARY,
    dateVisited: "2026-04-12",
    cardNumber: "TD-001",
    stats: {
      adventure: 88,
      beauty: 97,
      history: 92,
      culture: 95,
      food: 76,
      scenic: 99,
      uniqueness: 89
    },
    description: "An awe-inspiring volcanic peak capped with white snow, standing proudly against a spring sky. For centuries, Mount Fuji has been worshipped as a sacred mountain and has inspired artists and pilgrims alike.",
    funFact: "Mount Fuji is actually an active volcano, though it hasn't erupted since 1707.",
    travelTip: "For the most reliable clear views, visit in the early morning during winter or late autumn.",
    flavorText: "Rising above the clouds, this sacred crown grants +20 Focus and +15 Serenity to true wanderers.",
    tags: ["Volcano", "Snow", "Sacred", "Hiking"],
    collectionId: "col-mountains",
    favorite: true,
    photoQualityScore: 92
  },
  {
    id: "card-colosseum-init",
    title: "Gladiator's Echo",
    landmark: "Colosseum",
    city: "Rome",
    country: "Italy",
    imageUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&auto=format&fit=crop&q=80",
    sceneType: "Historic Site",
    coordinates: "41.8902° N, 12.4922° E",
    rarity: CardRarity.RARE,
    dateVisited: "2025-09-18",
    cardNumber: "TD-002",
    stats: {
      adventure: 62,
      beauty: 85,
      history: 99,
      culture: 90,
      food: 88,
      scenic: 82,
      uniqueness: 85
    },
    description: "The grand travertine amphitheatre in the heart of Rome. Once filled with the roars of gladiators and 50,000 spectators, it remains an eternal testament to Roman engineering and the theatricality of ancient blood sports.",
    funFact: "The Colosseum could be flooded to host mock sea battles (naumachiae) with real warships.",
    travelTip: "Book an underground tour to walk beneath the arena floor where gladiators and beasts once stood.",
    flavorText: "Whispers of ancient battles echo through stone. Grants +12 Might to historical preservationists.",
    tags: ["Ancient Rome", "Amphitheatre", "Ruins", "UNESCO"],
    collectionId: "col-historic",
    favorite: false,
    photoQualityScore: 84
  },
  {
    id: "card-santorini-init",
    title: "Sunset Over Blue Caldera",
    landmark: "Oia Cliffs",
    city: "Santorini",
    country: "Greece",
    imageUrl: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&auto=format&fit=crop&q=80",
    sceneType: "Sunset",
    coordinates: "36.4618° N, 25.3753° E",
    rarity: CardRarity.EPIC,
    dateVisited: "2026-06-25",
    cardNumber: "TD-003",
    stats: {
      adventure: 55,
      beauty: 98,
      history: 70,
      culture: 80,
      food: 94,
      scenic: 100,
      uniqueness: 91
    },
    description: "Cascading whitewashed houses with deep blue domes cling dramatically to ancient volcanic cliffs, framing a sunset of unmatched crimson and violet hues reflecting on the Aegean Sea.",
    funFact: "Santorini's unique crescent shape is the result of one of the largest volcanic eruptions in recorded history.",
    travelTip: "Skip the crowded sunset point in Oia and book an evening catamaran cruise for a better vantage point.",
    flavorText: "Hidden among cliff-sides, this legendary twilight grants +10 Serenity and +15 Wanderlust.",
    tags: ["Cyclades", "Aegean", "Caldera", "Romantic"],
    collectionId: "col-beaches",
    favorite: true,
    photoQualityScore: 96
  }
];

const INITIAL_PROFILE: UserProfile = {
  username: "Matthew Explorer",
  email: "matthew.simand@gmail.com",
  avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
  level: 4,
  xp: 1350,
  xpToNextLevel: 2000,
  streak: 5,
  favoriteDestination: "Oia Cliffs, Greece",
  mostCollectedCategory: "Historic Sites",
  isPremium: false
};

/**
 * Helper to delete all documents in a collection (useful during DB reset)
 */
async function deleteCollection(collectionPath: string) {
  const collectionRef = firestoreDb.collection(collectionPath);
  const snapshot = await collectionRef.get();
  const batch = firestoreDb.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
}

export async function getDB(): Promise<LocalDB> {
  try {
    const profileDocRef = firestoreDb.collection("profile").doc("main_profile");
    const profileDoc = await profileDocRef.get();
    
    let profile = profileDoc.exists ? (profileDoc.data() as UserProfile) : null;

    // Seeding Firestore on cold start if no profile doc is present
    if (!profile) {
      profile = INITIAL_PROFILE;
      await profileDocRef.set(INITIAL_PROFILE);
      
      // Seed default achievements
      for (const ach of DEFAULT_ACHIEVEMENTS) {
        await firestoreDb.collection("achievements").doc(ach.id).set(ach);
      }
      
      // Seed default cards
      for (const card of DEFAULT_CARDS) {
        await firestoreDb.collection("cards").doc(card.id).set(card);
      }
    }

    // Load cards
    const cardsSnapshot = await firestoreDb.collection("cards").get();
    const cards: TradingCard[] = [];
    cardsSnapshot.forEach((doc) => {
      cards.push(doc.data() as TradingCard);
    });

    // Sort cards so that user-generated / newly created cards appear at the top
    cards.sort((a, b) => {
      const aIsInit = a.id.includes("init");
      const bIsInit = b.id.includes("init");
      if (aIsInit && !bIsInit) return 1;
      if (!aIsInit && bIsInit) return -1;
      return b.id.localeCompare(a.id);
    });

    // Load custom collections
    const collectionsSnapshot = await firestoreDb.collection("collections").get();
    const customCollections: TravelCollection[] = [];
    collectionsSnapshot.forEach((doc) => {
      customCollections.push(doc.data() as TravelCollection);
    });

    // Load achievements
    const achievementsSnapshot = await firestoreDb.collection("achievements").get();
    const achievements: Achievement[] = [];
    achievementsSnapshot.forEach((doc) => {
      achievements.push(doc.data() as Achievement);
    });
    
    // Sort achievements according to the predefined order
    const achOrder = ["ach-first-step", "ach-trio", "ach-legend", "ach-multi-country", "ach-beach-master"];
    achievements.sort((a, b) => achOrder.indexOf(a.id) - achOrder.indexOf(b.id));

    return {
      cards,
      customCollections,
      profile,
      achievements
    };
  } catch (error) {
    console.error("Error reading Firestore:", error);
    // Fallback in case of temporary Firestore connection failures
    return {
      cards: DEFAULT_CARDS,
      customCollections: [],
      profile: INITIAL_PROFILE,
      achievements: DEFAULT_ACHIEVEMENTS
    };
  }
}

export async function saveDB(dbState: LocalDB): Promise<void> {
  try {
    await firestoreDb.collection("profile").doc("main_profile").set(dbState.profile);
    
    // Sync custom collections
    for (const col of dbState.customCollections) {
      await firestoreDb.collection("collections").doc(col.id).set(col);
    }
    
    // Sync achievements
    for (const ach of dbState.achievements) {
      await firestoreDb.collection("achievements").doc(ach.id).set(ach);
    }
  } catch (error) {
    console.error("Error saving DB to Firestore:", error);
  }
}

export async function addCard(card: TradingCard): Promise<LocalDB> {
  try {
    // Add new card doc
    await firestoreDb.collection("cards").doc(card.id).set(card);

    const db = await getDB();
    
    // Recalculate XP rewards
    let xpEarned = 300;
    if (card.rarity === CardRarity.EPIC) xpEarned += 100;
    if (card.rarity === CardRarity.LEGENDARY) xpEarned += 250;
    if (card.rarity === CardRarity.MYTHIC) xpEarned += 500;

    db.profile.xp += xpEarned;
    
    // Level progress check
    while (db.profile.xp >= db.profile.xpToNextLevel) {
      db.profile.xp -= db.profile.xpToNextLevel;
      db.profile.level += 1;
      db.profile.xpToNextLevel = Math.floor(db.profile.xpToNextLevel * 1.25);
    }

    const uniqueCountries = Array.from(new Set(db.cards.map(c => c.country)));
    
    // Achievement checks
    db.achievements = db.achievements.map(ach => {
      if (ach.unlockedAt) return ach;

      let unlock = false;
      if (ach.id === "ach-first-step" && db.cards.length >= 1) unlock = true;
      if (ach.id === "ach-trio" && db.cards.length >= 3) unlock = true;
      if (ach.id === "ach-legend" && (card.rarity === CardRarity.LEGENDARY || card.rarity === CardRarity.MYTHIC)) unlock = true;
      if (ach.id === "ach-multi-country" && uniqueCountries.length >= 3) unlock = true;
      
      if (ach.id === "ach-beach-master") {
        const waterCards = db.cards.filter(c => 
          c.sceneType.toLowerCase().includes("beach") || 
          c.sceneType.toLowerCase().includes("sunset") || 
          c.sceneType.toLowerCase().includes("lake")
        );
        if (waterCards.length >= 3) unlock = true;
      }

      if (unlock) {
        return { ...ach, unlockedAt: new Date().toISOString() };
      }
      return ach;
    });

    // Calculate scene category counts
    const categories = db.cards.map(c => c.sceneType);
    const counts: { [key: string]: number } = {};
    let maxCat = "";
    let maxCount = 0;
    categories.forEach(cat => {
      counts[cat] = (counts[cat] || 0) + 1;
      if (counts[cat] > maxCount) {
        maxCount = counts[cat];
        maxCat = cat;
      }
    });
    if (maxCat) {
      db.profile.mostCollectedCategory = maxCat;
    }

    // Persist profile & achievements updates back to Firestore
    await firestoreDb.collection("profile").doc("main_profile").set(db.profile);
    for (const ach of db.achievements) {
      await firestoreDb.collection("achievements").doc(ach.id).set(ach);
    }

    return getDB();
  } catch (error) {
    console.error("Failed to add card in Firestore:", error);
    return getDB();
  }
}

export async function deleteCard(id: string): Promise<LocalDB> {
  try {
    await firestoreDb.collection("cards").doc(id).delete();
  } catch (error) {
    console.error("Failed to delete card in Firestore:", error);
  }
  return getDB();
}

export async function toggleFavorite(id: string): Promise<LocalDB> {
  try {
    const cardRef = firestoreDb.collection("cards").doc(id);
    const cardDoc = await cardRef.get();
    if (cardDoc.exists) {
      const cardData = cardDoc.data() as TradingCard;
      await cardRef.update({ favorite: !cardData.favorite });
    }
  } catch (error) {
    console.error("Failed to toggle favorite in Firestore:", error);
  }
  return getDB();
}

export async function createCollection(collectionName: string): Promise<LocalDB> {
  try {
    const id = `col-custom-${Date.now()}`;
    const newCol: TravelCollection = {
      id,
      name: collectionName,
      iconName: "FolderHeart",
      description: "A custom curated explorer collection.",
      isCustom: true
    };
    await firestoreDb.collection("collections").doc(id).set(newCol);
  } catch (error) {
    console.error("Failed to create custom collection in Firestore:", error);
  }
  return getDB();
}

export async function resetDB(): Promise<LocalDB> {
  try {
    await deleteCollection("cards");
    await deleteCollection("collections");
    await deleteCollection("profile");
    await deleteCollection("achievements");
  } catch (error) {
    console.error("Failed to clear Firestore collections during reset:", error);
  }
  return getDB();
}

export function getPresetCollections(): TravelCollection[] {
  return DEFAULT_COLLECTIONS;
}
