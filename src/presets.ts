/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TravelPreset {
  id: string;
  landmark: string;
  city: string;
  country: string;
  imageUrl: string;
  sceneType: string;
  coordinates: string;
  samplePrompt: string;
}

export const TRAVEL_PRESETS: TravelPreset[] = [
  {
    id: "preset-fuji",
    landmark: "Mount Fuji",
    city: "Shizuoka",
    country: "Japan",
    imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop&q=80",
    sceneType: "Mountain",
    coordinates: "35.3606° N, 138.7274° E",
    samplePrompt: "A majestic volcanic peak capped with pristine white snow, framed by soft pink cherry blossoms in the spring sun."
  },
  {
    id: "preset-eiffel",
    landmark: "Eiffel Tower",
    city: "Paris",
    country: "France",
    imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop&q=80",
    sceneType: "Architecture",
    coordinates: "48.8584° N, 2.2945° E",
    samplePrompt: "The iconic iron spire of the Eiffel Tower stretching into a warm golden hour sky over Paris, seen from the Champ de Mars."
  },
  {
    id: "preset-colosseum",
    landmark: "Colosseum",
    city: "Rome",
    country: "Italy",
    imageUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&auto=format&fit=crop&q=80",
    sceneType: "Historic Site",
    coordinates: "41.8902° N, 12.4922° E",
    samplePrompt: "The sunbathed stone arches of the ancient Colosseum, capturing the immense history of classical Rome under a crystal blue sky."
  },
  {
    id: "preset-taj",
    landmark: "Taj Mahal",
    city: "Agra",
    country: "India",
    imageUrl: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&auto=format&fit=crop&q=80",
    sceneType: "World Wonders",
    coordinates: "27.1751° N, 78.0421° E",
    samplePrompt: "The ethereal white marble dome of the Taj Mahal reflecting perfectly in the serene, still waters of the lotus pool at sunrise."
  },
  {
    id: "preset-machu",
    landmark: "Machu Picchu",
    city: "Cusco",
    country: "Peru",
    imageUrl: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800&auto=format&fit=crop&q=80",
    sceneType: "UNESCO Sites",
    coordinates: "13.1631° S, 72.5450° W",
    samplePrompt: "Ancient stone ruins nestled high in the green Andean mountains, enveloped in soft morning clouds and mystery."
  },
  {
    id: "preset-safari",
    landmark: "Serengeti National Park",
    city: "Serengeti",
    country: "Tanzania",
    imageUrl: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&auto=format&fit=crop&q=80",
    sceneType: "Wildlife",
    coordinates: "2.1540° S, 34.6857° E",
    samplePrompt: "A magnificent male lion standing tall on a rocky kopje, surveying the vast golden African savannah under a blazing midday sun."
  },
  {
    id: "preset-santorini",
    landmark: "Oia Cliffs",
    city: "Santorini",
    country: "Greece",
    imageUrl: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&auto=format&fit=crop&q=80",
    sceneType: "Sunset",
    coordinates: "36.4618° N, 25.3753° E",
    samplePrompt: "Whitewashed houses with signature brilliant blue domes clinging to dark caldera cliffs, bathed in an epic magenta sunset."
  },
  {
    id: "preset-grandcanyon",
    landmark: "Mather Point",
    city: "Grand Canyon",
    country: "USA",
    imageUrl: "https://images.unsplash.com/photo-1615551043360-33de8b5f410c?w=800&auto=format&fit=crop&q=80",
    sceneType: "Nature",
    coordinates: "36.0573° N, 112.1215° W",
    samplePrompt: "The dramatic, deep red-rock layers of the Grand Canyon stretching out to the horizon under a vast and wild Arizona sky."
  }
];
