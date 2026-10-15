import type { Destination } from "@/types/destination";

export const destinations: Destination[] = [
  {
    id: "mount-fuji",
    name: "Mount Fuji",
    country: "Japan",
    countryCode: "JP",
    city: "Fujikawaguchiko",
    description:
      "Japan's iconic mountain surrounded by lakes, nature, and unforgettable views.",
    category: ["mountain", "nature", "adventure"],
    bestTimeToVisit: "March – May and October – November",
    recommendedDays: {
      min: 2,
      max: 3,
    },
    imageUrl:
      "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=1200&q=85",
    featured: true,
  },

  {
    id: "tokyo",
    name: "Tokyo",
    country: "Japan",
    countryCode: "JP",
    city: "Tokyo",
    description:
      "A vibrant mix of futuristic technology, traditional culture, food, shopping, and nightlife.",
    category: ["city", "culture", "food", "shopping"],
    bestTimeToVisit: "March – May and October – November",
    recommendedDays: {
      min: 3,
      max: 5,
    },
    imageUrl:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=85",
    featured: true,
  },

  {
    id: "dubai",
    name: "Dubai",
    country: "United Arab Emirates",
    countryCode: "AE",
    city: "Dubai",
    description:
      "A modern destination known for architecture, luxury experiences, shopping, beaches, and desert adventures.",
    category: ["city", "shopping", "desert", "adventure"],
    bestTimeToVisit: "November – March",
    recommendedDays: {
      min: 3,
      max: 5,
    },
    imageUrl:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=85",
    featured: true,
  },

  {
    id: "switzerland",
    name: "Swiss Alps",
    country: "Switzerland",
    countryCode: "CH",
    city: "Interlaken",
    description:
      "Mountain landscapes, alpine villages, crystal-clear lakes, and outdoor adventures.",
    category: ["mountain", "nature", "adventure", "ski"],
    bestTimeToVisit: "June – September",
    recommendedDays: {
      min: 4,
      max: 7,
    },
    imageUrl:
      "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=85",
    featured: true,
  },

  {
    id: "bali",
    name: "Bali",
    country: "Indonesia",
    countryCode: "ID",
    city: "Ubud",
    description:
      "Tropical beaches, rice terraces, temples, wellness experiences, and rich local culture.",
    category: ["island", "beach", "nature", "culture", "wellness"],
    bestTimeToVisit: "April – October",
    recommendedDays: {
      min: 4,
      max: 7,
    },
    imageUrl:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=85",
    featured: true,
  },

  {
    id: "paris",
    name: "Paris",
    country: "France",
    countryCode: "FR",
    city: "Paris",
    description:
      "A cultural capital known for art, architecture, history, food, fashion, and iconic landmarks.",
    category: ["city", "culture", "history", "food", "shopping"],
    bestTimeToVisit: "April – June and September – October",
    recommendedDays: {
      min: 3,
      max: 5,
    },
    imageUrl:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=85",
    featured: true,
  },
];