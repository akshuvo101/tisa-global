import { TravelPackage } from "@/types/packages";


export const travelPackages: TravelPackage[] = [
  {
    id: "dubai-explorer",
    title: "Dubai Explorer",
    destination: "Dubai",
    destinationId: "dubai",
    country: "United Arab Emirates",
    imageUrl:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80",

    durationDays: 5,
    durationNights: 4,
    departureCity: "Dhaka",

    travelStyle: "budget",

    price: 85000,
    currency: "BDT",
    pricePerPerson: true,

    description:
      "A budget-friendly Dubai experience covering modern landmarks, Old Dubai, Marina, and a desert safari.",

    featured: true,

    inclusions: [
      "4 nights hotel accommodation",
      "Airport transfer",
      "Daily breakfast",
      "Dubai city tour",
      "Desert safari with BBQ dinner",
      "Dubai Marina visit",
    ],

    exclusions: [
      "International airfare",
      "Tourist visa fee",
      "Personal expenses",
      "Travel insurance",
      "Optional activities",
    ],

    itinerary: [
      {
        day: 1,
        title: "Arrival & Old Dubai",
        activities: [
          "Airport pickup",
          "Hotel check-in",
          "Explore Deira and Dubai Creek",
        ],
      },
      {
        day: 2,
        title: "Modern Dubai",
        activities: [
          "Dubai Mall",
          "Burj Khalifa area",
          "Dubai Fountain",
        ],
      },
      {
        day: 3,
        title: "Dubai Marina & Beach",
        activities: [
          "JBR Beach",
          "Dubai Marina Walk",
          "Marina sightseeing",
        ],
      },
      {
        day: 4,
        title: "Desert Safari",
        activities: [
          "Dune bashing",
          "Sandboarding",
          "BBQ dinner and cultural show",
        ],
      },
      {
        day: 5,
        title: "Shopping & Departure",
        activities: [
          "Souvenir shopping",
          "Hotel checkout",
          "Airport transfer",
        ],
      },
    ],

    accommodation: {
      name: "3-Star Hotel",
      nights: 4,
      roomType: "Standard room",
    },

    transportation: [
      "Airport transfer",
      "Shared tour transportation",
    ],

    visaAssistance: true,

    cancellationPolicy:
      "Cancellation terms depend on the selected package and service providers.",

    agency: {
      name: "TISA Partner Travel",
      description:
        "Sample partner profile for the TISA package marketplace.",
    },

    availability: "Available",
  },

  {
    id: "japan-essentials",
    title: "Japan Essentials",
    destination: "Tokyo",
    destinationId: "tokyo",
    country: "Japan",
    imageUrl:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80",

    durationDays: 7,
    durationNights: 6,
    departureCity: "Dhaka",

    travelStyle: "balanced",

    price: 165000,
    currency: "BDT",
    pricePerPerson: true,

    description:
      "Explore Tokyo's iconic neighborhoods, cultural landmarks, food streets, and modern city life with a balanced travel plan.",

    featured: true,

    inclusions: [
      "6 nights hotel accommodation",
      "Daily breakfast",
      "Airport transfer",
      "Tokyo city tour",
      "Selected local transportation",
      "Travel assistance",
    ],

    exclusions: [
      "International airfare",
      "Visa fees",
      "Travel insurance",
      "Personal expenses",
      "Optional attractions",
    ],

    itinerary: [
      {
        day: 1,
        title: "Arrival in Tokyo",
        activities: [
          "Airport arrival",
          "Hotel check-in",
          "Evening neighborhood walk",
        ],
      },
      {
        day: 2,
        title: "Modern Tokyo",
        activities: [
          "Shibuya Crossing",
          "Harajuku",
          "Meiji Shrine",
        ],
      },
      {
        day: 3,
        title: "Traditional Tokyo",
        activities: [
          "Asakusa",
          "Senso-ji Temple",
          "Ueno area",
        ],
      },
      {
        day: 4,
        title: "Tokyo Culture & Food",
        activities: [
          "Tsukiji outer market",
          "Ginza",
          "Local food experience",
        ],
      },
      {
        day: 5,
        title: "Mount Fuji Day Trip",
        activities: [
          "Fuji Five Lakes area",
          "Scenic viewpoints",
          "Return to Tokyo",
        ],
      },
      {
        day: 6,
        title: "Free Exploration",
        activities: [
          "Shopping",
          "Akihabara",
          "Free time",
        ],
      },
      {
        day: 7,
        title: "Departure",
        activities: [
          "Hotel checkout",
          "Final shopping",
          "Airport transfer",
        ],
      },
    ],

    accommodation: {
      name: "3-Star Tokyo Hotel",
      nights: 6,
      roomType: "Standard room",
    },

    transportation: [
      "Airport transfer",
      "Selected local transportation",
      "Fuji day-trip transportation",
    ],

    visaAssistance: true,

    cancellationPolicy:
      "Cancellation terms depend on the selected services and booking conditions.",

    agency: {
      name: "TISA Partner Travel",
      description:
        "Sample partner profile for the TISA package marketplace.",
    },

    availability: "Available",
  },

  {
    id: "mount-fuji-escape",
    title: "Mount Fuji Escape",
    destination: "Mount Fuji",
    destinationId: "mount-fuji",
    country: "Japan",
    imageUrl:
      "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=1200&q=80",

    durationDays: 6,
    durationNights: 5,
    departureCity: "Dhaka",

    travelStyle: "balanced",

    price: 145000,
    currency: "BDT",
    pricePerPerson: true,

    description:
      "A scenic Japan journey focused on Mount Fuji, lakeside views, nature, and a relaxed Tokyo experience.",

    featured: true,

    inclusions: [
      "5 nights accommodation",
      "Daily breakfast",
      "Airport transfer",
      "Mount Fuji day trip",
      "Selected local transportation",
      "Travel assistance",
    ],

    exclusions: [
      "International airfare",
      "Visa fees",
      "Travel insurance",
      "Personal expenses",
      "Optional activities",
    ],

    itinerary: [
      {
        day: 1,
        title: "Arrival in Tokyo",
        activities: [
          "Airport arrival",
          "Hotel check-in",
          "Relax and explore nearby area",
        ],
      },
      {
        day: 2,
        title: "Tokyo Highlights",
        activities: [
          "Shibuya",
          "Harajuku",
          "Meiji Shrine",
        ],
      },
      {
        day: 3,
        title: "Mount Fuji",
        activities: [
          "Fuji Five Lakes",
          "Lake Kawaguchi",
          "Mount Fuji viewpoints",
        ],
      },
      {
        day: 4,
        title: "Nature & Culture",
        activities: [
          "Oshino Hakkai",
          "Local sightseeing",
          "Traditional Japanese experience",
        ],
      },
      {
        day: 5,
        title: "Tokyo Free Day",
        activities: [
          "Shopping",
          "Local neighborhoods",
          "Free exploration",
        ],
      },
      {
        day: 6,
        title: "Departure",
        activities: [
          "Hotel checkout",
          "Airport transfer",
        ],
      },
    ],

    accommodation: {
      name: "3-Star Hotel",
      nights: 5,
      roomType: "Standard room",
    },

    transportation: [
      "Airport transfer",
      "Mount Fuji day-trip transportation",
      "Selected local transportation",
    ],

    visaAssistance: true,

    cancellationPolicy:
      "Cancellation terms depend on the selected services and booking conditions.",

    agency: {
      name: "TISA Partner Travel",
      description:
        "Sample partner profile for the TISA package marketplace.",
    },

    availability: "Available",
  },

  {
    id: "bali-escape",
    title: "Bali Escape",
    destination: "Bali",
    destinationId: "bali",
    country: "Indonesia",
    imageUrl:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",

    durationDays: 6,
    durationNights: 5,
    departureCity: "Dhaka",

    travelStyle: "comfort",

    price: 95000,
    currency: "BDT",
    pricePerPerson: true,

    description:
      "A relaxed Bali getaway combining beaches, Ubud culture, nature, and island experiences.",

    featured: true,

    inclusions: [
      "5 nights accommodation",
      "Daily breakfast",
      "Airport transfer",
      "Selected sightseeing tours",
      "Private tour transportation",
      "Travel assistance",
    ],

    exclusions: [
      "International airfare",
      "Visa or entry fees",
      "Travel insurance",
      "Personal expenses",
      "Optional activities",
    ],

    itinerary: [
      {
        day: 1,
        title: "Arrival in Bali",
        activities: [
          "Airport pickup",
          "Hotel check-in",
          "Relax at the hotel",
        ],
      },
      {
        day: 2,
        title: "Ubud & Culture",
        activities: [
          "Ubud center",
          "Rice terrace",
          "Local cultural experience",
        ],
      },
      {
        day: 3,
        title: "Beach Day",
        activities: [
          "Seminyak or Kuta Beach",
          "Beachside lunch",
          "Sunset experience",
        ],
      },
      {
        day: 4,
        title: "Nature & Temples",
        activities: [
          "Water temple",
          "Scenic viewpoints",
          "Local villages",
        ],
      },
      {
        day: 5,
        title: "Free Day",
        activities: [
          "Spa or wellness activity",
          "Shopping",
          "Free exploration",
        ],
      },
      {
        day: 6,
        title: "Departure",
        activities: [
          "Hotel checkout",
          "Airport transfer",
        ],
      },
    ],

    accommodation: {
      name: "4-Star Bali Resort",
      nights: 5,
      roomType: "Deluxe room",
    },

    transportation: [
      "Airport transfer",
      "Private sightseeing transportation",
    ],

    visaAssistance: true,

    cancellationPolicy:
      "Cancellation terms depend on the selected services and booking conditions.",

    agency: {
      name: "TISA Partner Travel",
      description:
        "Sample partner profile for the TISA package marketplace.",
    },

    availability: "Available",
  },

  {
    id: "swiss-alps-adventure",
    title: "Swiss Alps Adventure",
    destination: "Swiss Alps",
    destinationId: "switzerland",
    country: "Switzerland",
    imageUrl:
      "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1200&q=80",

    durationDays: 7,
    durationNights: 6,
    departureCity: "Dhaka",

    travelStyle: "comfort",

    price: 210000,
    currency: "BDT",
    pricePerPerson: true,

    description:
      "A scenic Switzerland experience featuring alpine villages, mountain views, lakes, and outdoor exploration.",

    featured: true,

    inclusions: [
      "6 nights accommodation",
      "Daily breakfast",
      "Selected local transportation",
      "Mountain sightseeing",
      "Travel assistance",
    ],

    exclusions: [
      "International airfare",
      "Visa fees",
      "Travel insurance",
      "Personal expenses",
      "Optional mountain activities",
    ],

    itinerary: [
      {
        day: 1,
        title: "Arrival",
        activities: [
          "Airport arrival",
          "Transfer to hotel",
          "Rest and local walk",
        ],
      },
      {
        day: 2,
        title: "Interlaken",
        activities: [
          "Interlaken town",
          "Lake views",
          "Local sightseeing",
        ],
      },
      {
        day: 3,
        title: "Mountain Experience",
        activities: [
          "Alpine mountain excursion",
          "Scenic viewpoints",
          "Mountain village",
        ],
      },
      {
        day: 4,
        title: "Lauterbrunnen Valley",
        activities: [
          "Valley sightseeing",
          "Waterfalls",
          "Village exploration",
        ],
      },
      {
        day: 5,
        title: "Lake & Nature",
        activities: [
          "Lake excursion",
          "Nature walk",
          "Photography",
        ],
      },
      {
        day: 6,
        title: "Free Exploration",
        activities: [
          "Shopping",
          "Local cafes",
          "Free sightseeing",
        ],
      },
      {
        day: 7,
        title: "Departure",
        activities: [
          "Hotel checkout",
          "Airport transfer",
        ],
      },
    ],

    accommodation: {
      name: "3-Star Alpine Hotel",
      nights: 6,
      roomType: "Standard room",
    },

    transportation: [
      "Airport transfer",
      "Selected train transportation",
      "Mountain excursion transportation",
    ],

    visaAssistance: true,

    cancellationPolicy:
      "Cancellation terms depend on the selected services and booking conditions.",

    agency: {
      name: "TISA Partner Travel",
      description:
        "Sample partner profile for the TISA package marketplace.",
    },

    availability: "Available",
  },

  {
    id: "paris-highlights",
    title: "Paris Highlights",
    destination: "Paris",
    destinationId: "paris",
    country: "France",
    imageUrl:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",

    durationDays: 5,
    durationNights: 4,
    departureCity: "Dhaka",

    travelStyle: "balanced",

    price: 155000,
    currency: "BDT",
    pricePerPerson: true,

    description:
      "Discover Paris through its famous landmarks, historic neighborhoods, museums, food, and riverside views.",

    featured: false,

    inclusions: [
      "4 nights accommodation",
      "Daily breakfast",
      "Airport transfer",
      "Paris city sightseeing",
      "Selected local transportation",
      "Travel assistance",
    ],

    exclusions: [
      "International airfare",
      "Schengen visa fee",
      "Travel insurance",
      "Personal expenses",
      "Optional attraction tickets",
    ],

    itinerary: [
      {
        day: 1,
        title: "Arrival in Paris",
        activities: [
          "Airport arrival",
          "Hotel check-in",
          "Evening walk",
        ],
      },
      {
        day: 2,
        title: "Classic Paris",
        activities: [
          "Eiffel Tower area",
          "Champs-Élysées",
          "Arc de Triomphe",
        ],
      },
      {
        day: 3,
        title: "Historic Paris",
        activities: [
          "Louvre area",
          "Notre-Dame area",
          "Latin Quarter",
        ],
      },
      {
        day: 4,
        title: "Culture & Food",
        activities: [
          "Montmartre",
          "Local cafes",
          "Seine riverside",
        ],
      },
      {
        day: 5,
        title: "Departure",
        activities: [
          "Final shopping",
          "Hotel checkout",
          "Airport transfer",
        ],
      },
    ],

    accommodation: {
      name: "3-Star Paris Hotel",
      nights: 4,
      roomType: "Standard room",
    },

    transportation: [
      "Airport transfer",
      "Selected metro transportation",
    ],

    visaAssistance: true,

    cancellationPolicy:
      "Cancellation terms depend on the selected services and booking conditions.",

    agency: {
      name: "TISA Partner Travel",
      description:
        "Sample partner profile for the TISA package marketplace.",
    },

    availability: "Available",
  },
];

export function getPackageById(id: string) {
  return travelPackages.find((travelPackage) => travelPackage.id === id);
}