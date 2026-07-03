/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum CardRarity {
  COMMON = "Common",
  UNCOMMON = "Uncommon",
  RARE = "Rare",
  EPIC = "Epic",
  LEGENDARY = "Legendary",
  MYTHIC = "Mythic"
}

export interface CardStats {
  adventure: number; // 1-100
  beauty: number;
  history: number;
  culture: number;
  food: number;
  scenic: number;
  uniqueness: number;
}

export interface TradingCard {
  id: string;
  title: string;
  landmark: string;
  city: string;
  country: string;
  imageUrl: string; // Base64 or preset URL
  sceneType: string;
  coordinates: string;
  rarity: CardRarity;
  dateVisited: string;
  cardNumber: string; // e.g., "TD-042"
  stats: CardStats;
  description: string;
  funFact: string;
  travelTip: string;
  flavorText: string;
  tags: string[];
  collectionId: string;
  favorite: boolean;
  photoQualityScore?: number;
}

export interface TravelCollection {
  id: string;
  name: string;
  iconName: string; // Lucide icon identifier
  description: string;
  isCustom: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlockedAt: string | null; // Date ISO string, null if locked
  iconName: string;
  badgeColor: string;
}

export interface UserProfile {
  username: string;
  email: string;
  avatarUrl: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  streak: number;
  favoriteDestination: string;
  mostCollectedCategory: string;
  isPremium?: boolean;
}
