import type { Destination } from "@/types/destination";

export type DestinationCostRange = {
  currency: string;
  min: number;
  max: number;
  period: "per_day" | "per_trip";
};

export type DestinationTransportOption = {
  type: string;
  title: string;
  description: string;
  estimatedDuration?: string;
};

export type DestinationVisaGuidance = {
  status: "verify" | "likely_required" | "may_not_be_required";
  summary: string;
  documents: string[];
  note: string;
};

export type DestinationActivity = {
  title: string;
  description: string;
  category: string;
};

export type DestinationTravelTips = {
  title: string;
  description: string;
};

export type DestinationDetails = {
  destinationId: Destination["id"];

  overview: string;

  howToGetThere: {
    fromBangladesh: DestinationTransportOption[];
    localTransport: string;
  };

  bestTime: {
    summary: string;
    months: string[];
  };

  recommendedDuration: {
    min: number;
    max: number;
  };

  estimatedCost: {
    flight: DestinationCostRange;
    accommodation: DestinationCostRange;
    food: DestinationCostRange;
    transport: DestinationCostRange;
    activities: DestinationCostRange;
    visaAndFees: DestinationCostRange;
    insurance: DestinationCostRange;
    misc: DestinationCostRange;
    total: DestinationCostRange;
    note: string;
  };

  visaAndDocuments: DestinationVisaGuidance;

  thingsToDo: DestinationActivity[];

  travelTips: DestinationTravelTips[];
};

export const destinationDetails: DestinationDetails[] = [
  {
    destinationId: "mount-fuji",

    overview:
      "Mount Fuji is one of Japan's most iconic destinations, combining mountain scenery, lakes, traditional towns, and easy access from the Tokyo area.",

    howToGetThere: {
      fromBangladesh: [
        {
          type: "flight",
          title: "Fly from Dhaka to Tokyo",
          description:
            "Travelers from Bangladesh can generally reach the Tokyo area by international flight and continue by train or bus toward the Mount Fuji region.",
          estimatedDuration: "Around 10–15+ hours depending on the route",
        },
        {
          type: "train",
          title: "Tokyo to Mount Fuji area",
          description:
            "From Tokyo, travelers can continue toward Fujikawaguchiko using available rail and bus connections.",
          estimatedDuration: "Around 2–3 hours",
        },
      ],

      localTransport:
        "Buses, trains, taxis, and local sightseeing transport can be used depending on the selected area around Mount Fuji.",
    },

    bestTime: {
      summary:
        "Spring and autumn are popular periods for clear scenery and comfortable sightseeing conditions. Weather can change quickly around the mountain.",
      months: ["March", "April", "May", "October", "November"],
    },

    recommendedDuration: {
      min: 2,
      max: 3,
    },

    estimatedCost: {
      flight: {
        currency: "BDT",
        min: 70000,
        max: 120000,
        period: "per_trip",
      },
      accommodation: {
        currency: "BDT",
        min: 5000,
        max: 15000,
        period: "per_day",
      },
      food: {
        currency: "BDT",
        min: 2000,
        max: 5000,
        period: "per_day",
      },
      transport: {
        currency: "BDT",
        min: 1500,
        max: 5000,
        period: "per_day",
      },
      activities: {
        currency: "BDT",
        min: 1000,
        max: 5000,
        period: "per_day",
      },
      visaAndFees: {
        currency: "BDT",
        min: 0,
        max: 10000,
        period: "per_trip",
      },
      insurance: {
        currency: "BDT",
        min: 1500,
        max: 5000,
        period: "per_trip",
      },
      misc: {
        currency: "BDT",
        min: 2000,
        max: 5000,
        period: "per_trip",
      },
      total: {
        currency: "BDT",
        min: 95000,
        max: 180000,
        period: "per_trip",
      },
      note:
        "Illustrative planning range only. Actual airfare, accommodation, exchange rates, visa fees, and seasonal prices can vary significantly.",
    },

    visaAndDocuments: {
      status: "verify",
      summary:
        "Visa and entry requirements depend on the traveler's nationality, passport, travel dates, and current Japanese immigration rules.",
      documents: [
        "Valid passport",
        "Visa or applicable entry authorization, if required",
        "Flight or travel itinerary",
        "Accommodation information",
        "Financial supporting documents, if required",
        "Travel insurance, where appropriate",
      ],
      note:
        "Always verify current Japanese visa and entry requirements through official sources before booking.",
    },

    thingsToDo: [
      {
        title: "Lake Kawaguchi",
        description:
          "Enjoy views of Mount Fuji around one of the region's best-known lakes.",
        category: "nature",
      },
      {
        title: "Chureito Pagoda",
        description:
          "Visit the famous viewpoint known for its panoramic Mount Fuji scenery.",
        category: "culture",
      },
      {
        title: "Fuji Five Lakes",
        description:
          "Explore scenic lake areas surrounding Mount Fuji.",
        category: "nature",
      },
      {
        title: "Traditional Japanese Towns",
        description:
          "Experience local food, streets, shops, and cultural attractions around the Fuji region.",
        category: "culture",
      },
    ],

    travelTips: [
      {
        title: "Check the weather",
        description:
          "Clouds can hide Mount Fuji, so flexible planning can improve the chance of clear views.",
      },
      {
        title: "Plan transport early",
        description:
          "Popular routes and sightseeing buses can become busy during peak travel periods.",
      },
      {
        title: "Keep the itinerary flexible",
        description:
          "Weather conditions may affect mountain activities and viewpoints.",
      },
    ],
  },

  {
    destinationId: "tokyo",

    overview:
      "Tokyo combines modern city life, traditional Japanese culture, food, shopping, technology, entertainment, and efficient public transportation.",

    howToGetThere: {
      fromBangladesh: [
        {
          type: "flight",
          title: "Fly from Dhaka to Tokyo",
          description:
            "Travelers can reach Tokyo through available international flight routes from Dhaka.",
          estimatedDuration: "Around 10–15+ hours depending on the route",
        },
      ],

      localTransport:
        "Tokyo has extensive train and subway networks, with buses and taxis available for additional local travel.",
    },

    bestTime: {
      summary:
        "Spring and autumn are popular for comfortable weather and sightseeing. Summer is warmer and more humid, while winter is generally cooler.",
      months: ["March", "April", "May", "October", "November"],
    },

    recommendedDuration: {
      min: 3,
      max: 5,
    },

    estimatedCost: {
      flight: {
        currency: "BDT",
        min: 70000,
        max: 120000,
        period: "per_trip",
      },
      accommodation: {
        currency: "BDT",
        min: 6000,
        max: 18000,
        period: "per_day",
      },
      food: {
        currency: "BDT",
        min: 2500,
        max: 7000,
        period: "per_day",
      },
      transport: {
        currency: "BDT",
        min: 1500,
        max: 4000,
        period: "per_day",
      },
      activities: {
        currency: "BDT",
        min: 1500,
        max: 6000,
        period: "per_day",
      },
      visaAndFees: {
        currency: "BDT",
        min: 0,
        max: 10000,
        period: "per_trip",
      },
      insurance: {
        currency: "BDT",
        min: 1500,
        max: 5000,
        period: "per_trip",
      },
      misc: {
        currency: "BDT",
        min: 3000,
        max: 8000,
        period: "per_trip",
      },
      total: {
        currency: "BDT",
        min: 110000,
        max: 220000,
        period: "per_trip",
      },
      note:
        "Illustrative planning range only. Actual costs depend on season, accommodation level, airfare, activities, and exchange rates.",
    },

    visaAndDocuments: {
      status: "verify",
      summary:
        "Entry requirements for Japan depend on nationality and current immigration rules.",
      documents: [
        "Valid passport",
        "Visa or applicable entry authorization, if required",
        "Travel itinerary",
        "Accommodation information",
        "Financial documents, if required",
      ],
      note:
        "Verify current requirements through official Japanese immigration or embassy sources before travel.",
    },

    thingsToDo: [
      {
        title: "Shibuya",
        description:
          "Explore one of Tokyo's best-known districts for shopping, food, and city life.",
        category: "city",
      },
      {
        title: "Asakusa",
        description:
          "Experience traditional Tokyo around Senso-ji and the surrounding streets.",
        category: "culture",
      },
      {
        title: "Tokyo Skytree",
        description:
          "Enjoy panoramic views across the Tokyo metropolitan area.",
        category: "city",
      },
      {
        title: "Tsukiji Outer Market",
        description:
          "Explore Japanese food, seafood, snacks, and local market culture.",
        category: "food",
      },
    ],

    travelTips: [
      {
        title: "Use public transportation",
        description:
          "Tokyo's rail and subway systems make it possible to explore many areas without relying heavily on taxis.",
      },
      {
        title: "Group nearby attractions",
        description:
          "Planning by neighborhood can reduce unnecessary travel time.",
      },
      {
        title: "Book popular attractions early",
        description:
          "Some observation decks, experiences, and seasonal attractions may require advance reservations.",
      },
    ],
  },

  {
    destinationId: "dubai",

    overview:
      "Dubai is a modern destination known for skyscrapers, shopping, beaches, desert experiences, entertainment, and luxury hospitality.",

    howToGetThere: {
      fromBangladesh: [
        {
          type: "flight",
          title: "Fly from Dhaka to Dubai",
          description:
            "Dubai is accessible from Dhaka through international flight connections.",
          estimatedDuration: "Around 5–6 hours depending on the flight",
        },
      ],

      localTransport:
        "Metro, taxis, buses, and ride-hailing services are commonly useful for getting around Dubai.",
    },

    bestTime: {
      summary:
        "The cooler months are generally more comfortable for outdoor sightseeing and desert activities.",
      months: ["November", "December", "January", "February", "March"],
    },

    recommendedDuration: {
      min: 3,
      max: 5,
    },

    estimatedCost: {
      flight: {
        currency: "BDT",
        min: 30000,
        max: 70000,
        period: "per_trip",
      },
      accommodation: {
        currency: "BDT",
        min: 4000,
        max: 15000,
        period: "per_day",
      },
      food: {
        currency: "BDT",
        min: 1500,
        max: 5000,
        period: "per_day",
      },
      transport: {
        currency: "BDT",
        min: 1000,
        max: 3500,
        period: "per_day",
      },
      activities: {
        currency: "BDT",
        min: 2000,
        max: 8000,
        period: "per_day",
      },
      visaAndFees: {
        currency: "BDT",
        min: 5000,
        max: 15000,
        period: "per_trip",
      },
      insurance: {
        currency: "BDT",
        min: 1000,
        max: 4000,
        period: "per_trip",
      },
      misc: {
        currency: "BDT",
        min: 2000,
        max: 5000,
        period: "per_trip",
      },
      total: {
        currency: "BDT",
        min: 65000,
        max: 150000,
        period: "per_trip",
      },
      note:
        "Illustrative planning range only. Visa fees, airfare, hotels, activities, and exchange rates may change.",
    },

    visaAndDocuments: {
      status: "verify",
      summary:
        "Visa and entry requirements depend on nationality, passport, residence status, and current UAE immigration rules.",
      documents: [
        "Valid passport",
        "Appropriate UAE visa or entry authorization",
        "Travel itinerary",
        "Accommodation information",
        "Supporting financial documents where applicable",
      ],
      note:
        "Verify current UAE entry and visa requirements before booking.",
    },

    thingsToDo: [
      {
        title: "Burj Khalifa",
        description:
          "Visit one of Dubai's most recognizable landmarks and observation experiences.",
        category: "city",
      },
      {
        title: "Dubai Mall",
        description:
          "Explore one of the city's major shopping and entertainment destinations.",
        category: "shopping",
      },
      {
        title: "Desert Safari",
        description:
          "Experience desert landscapes, activities, and traditional-style entertainment.",
        category: "adventure",
      },
      {
        title: "Dubai Marina",
        description:
          "Walk around the waterfront area and explore restaurants and city views.",
        category: "city",
      },
    ],

    travelTips: [
      {
        title: "Plan outdoor activities carefully",
        description:
          "Temperature can strongly affect outdoor experiences, especially during hotter months.",
      },
      {
        title: "Use the metro where practical",
        description:
          "The metro can be a convenient option for several major tourist areas.",
      },
      {
        title: "Check attraction tickets",
        description:
          "Popular attractions may have timed-entry systems or advance booking requirements.",
      },
    ],
  },

  {
    destinationId: "switzerland",

    overview:
      "Switzerland offers alpine scenery, lakes, villages, scenic rail journeys, hiking, winter sports, and mountain experiences.",

    howToGetThere: {
      fromBangladesh: [
        {
          type: "flight",
          title: "Fly from Dhaka to Switzerland",
          description:
            "Travelers can reach Switzerland through international flights to major Swiss airports, followed by train connections.",
          estimatedDuration: "Around 11–16+ hours depending on the route",
        },
        {
          type: "train",
          title: "Continue to Interlaken",
          description:
            "Interlaken is connected to major Swiss cities through the country's extensive rail network.",
          estimatedDuration: "Varies by arrival airport and route",
        },
      ],

      localTransport:
        "Trains, buses, boats, cable cars, and regional transport are important parts of travel around Switzerland.",
    },

    bestTime: {
      summary:
        "Summer is popular for hiking and mountain sightseeing, while winter is suitable for snow and ski experiences.",
      months: ["June", "July", "August", "September"],
    },

    recommendedDuration: {
      min: 4,
      max: 7,
    },

    estimatedCost: {
      flight: {
        currency: "BDT",
        min: 80000,
        max: 140000,
        period: "per_trip",
      },
      accommodation: {
        currency: "BDT",
        min: 10000,
        max: 30000,
        period: "per_day",
      },
      food: {
        currency: "BDT",
        min: 3500,
        max: 9000,
        period: "per_day",
      },
      transport: {
        currency: "BDT",
        min: 3000,
        max: 9000,
        period: "per_day",
      },
      activities: {
        currency: "BDT",
        min: 3000,
        max: 12000,
        period: "per_day",
      },
      visaAndFees: {
        currency: "BDT",
        min: 10000,
        max: 20000,
        period: "per_trip",
      },
      insurance: {
        currency: "BDT",
        min: 2000,
        max: 6000,
        period: "per_trip",
      },
      misc: {
        currency: "BDT",
        min: 3000,
        max: 8000,
        period: "per_trip",
      },
      total: {
        currency: "BDT",
        min: 150000,
        max: 300000,
        period: "per_trip",
      },
      note:
        "Illustrative planning range only. Swiss travel costs can vary substantially depending on transport, accommodation, season, and mountain activities.",
    },

    visaAndDocuments: {
      status: "verify",
      summary:
        "Visa and entry requirements depend on nationality and the applicable Schengen rules.",
      documents: [
        "Valid passport",
        "Appropriate Schengen visa or entry authorization, if required",
        "Travel itinerary",
        "Accommodation proof",
        "Financial supporting documents",
        "Travel insurance where required",
      ],
      note:
        "Verify current Schengen and Swiss entry requirements through official sources.",
    },

    thingsToDo: [
      {
        title: "Jungfraujoch",
        description:
          "Experience one of the region's famous high-altitude mountain destinations.",
        category: "mountain",
      },
      {
        title: "Lake Interlaken",
        description:
          "Enjoy scenic lake views and outdoor activities around the Interlaken region.",
        category: "nature",
      },
      {
        title: "Lauterbrunnen Valley",
        description:
          "Explore dramatic alpine scenery, waterfalls, and mountain villages.",
        category: "nature",
      },
      {
        title: "Scenic Train Journeys",
        description:
          "Travel through Switzerland's mountain landscapes by rail.",
        category: "adventure",
      },
    ],

    travelTips: [
      {
        title: "Budget carefully",
        description:
          "Switzerland can be expensive, so accommodation and transport choices have a major effect on total cost.",
      },
      {
        title: "Check mountain conditions",
        description:
          "Weather and seasonal conditions can affect cable cars, trails, and mountain attractions.",
      },
      {
        title: "Use rail connections",
        description:
          "Rail travel is particularly useful for connecting major Swiss destinations.",
      },
    ],
  },

  {
    destinationId: "bali",

    overview:
      "Bali combines beaches, temples, rice terraces, waterfalls, local culture, food, wellness experiences, and tropical landscapes.",

    howToGetThere: {
      fromBangladesh: [
        {
          type: "flight",
          title: "Fly from Dhaka to Bali",
          description:
            "Travelers can reach Bali through international flight connections to Ngurah Rai International Airport.",
          estimatedDuration: "Around 7–12+ hours depending on connections",
        },
      ],

      localTransport:
        "Private drivers, taxis, ride-hailing services, scooters where legally and safely appropriate, and local transfers are commonly used.",
    },

    bestTime: {
      summary:
        "The dry season is generally popular for beach activities, outdoor exploration, and sightseeing.",
      months: ["April", "May", "June", "July", "August", "September", "October"],
    },

    recommendedDuration: {
      min: 4,
      max: 7,
    },

    estimatedCost: {
      flight: {
        currency: "BDT",
        min: 40000,
        max: 80000,
        period: "per_trip",
      },
      accommodation: {
        currency: "BDT",
        min: 3000,
        max: 12000,
        period: "per_day",
      },
      food: {
        currency: "BDT",
        min: 1000,
        max: 3500,
        period: "per_day",
      },
      transport: {
        currency: "BDT",
        min: 1000,
        max: 3500,
        period: "per_day",
      },
      activities: {
        currency: "BDT",
        min: 1500,
        max: 6000,
        period: "per_day",
      },
      visaAndFees: {
        currency: "BDT",
        min: 0,
        max: 10000,
        period: "per_trip",
      },
      insurance: {
        currency: "BDT",
        min: 1000,
        max: 4000,
        period: "per_trip",
      },
      misc: {
        currency: "BDT",
        min: 2000,
        max: 5000,
        period: "per_trip",
      },
      total: {
        currency: "BDT",
        min: 80000,
        max: 170000,
        period: "per_trip",
      },
      note:
        "Illustrative planning range only. Entry rules, airfare, accommodation, activities, and exchange rates may change.",
    },

    visaAndDocuments: {
      status: "verify",
      summary:
        "Indonesia's entry requirements depend on nationality, passport, travel purpose, and current immigration rules.",
      documents: [
        "Valid passport",
        "Applicable visa or entry authorization, if required",
        "Travel itinerary",
        "Accommodation information",
        "Return or onward travel information where applicable",
      ],
      note:
        "Verify current Indonesian immigration and visa requirements before travel.",
    },

    thingsToDo: [
      {
        title: "Ubud",
        description:
          "Explore rice terraces, local culture, art, food, and wellness experiences.",
        category: "culture",
      },
      {
        title: "Seminyak",
        description:
          "Enjoy beaches, restaurants, cafes, and a lively coastal atmosphere.",
        category: "beach",
      },
      {
        title: "Waterfalls",
        description:
          "Discover tropical waterfalls and surrounding natural landscapes.",
        category: "nature",
      },
      {
        title: "Balinese Temples",
        description:
          "Experience Bali's distinctive religious and cultural heritage.",
        category: "culture",
      },
    ],

    travelTips: [
      {
        title: "Allow travel time between areas",
        description:
          "Traffic can make journeys between different parts of Bali longer than expected.",
      },
      {
        title: "Respect local customs",
        description:
          "Dress and behavior expectations can differ at temples and religious sites.",
      },
      {
        title: "Plan outdoor activities around weather",
        description:
          "Rain and local weather conditions can affect outdoor experiences.",
      },
    ],
  },

  {
    destinationId: "paris",

    overview:
      "Paris is a major cultural and historical destination known for museums, architecture, food, fashion, landmarks, and neighborhood exploration.",

    howToGetThere: {
      fromBangladesh: [
        {
          type: "flight",
          title: "Fly from Dhaka to Paris",
          description:
            "Travelers can reach Paris through international flight connections to Paris airports.",
          estimatedDuration: "Around 11–16+ hours depending on the route",
        },
      ],

      localTransport:
        "Metro, trains, buses, walking, taxis, and ride-hailing services can be used throughout Paris.",
    },

    bestTime: {
      summary:
        "Spring and early autumn are popular for sightseeing, with generally comfortable conditions and a wide range of cultural activities.",
      months: ["April", "May", "June", "September", "October"],
    },

    recommendedDuration: {
      min: 3,
      max: 5,
    },

    estimatedCost: {
      flight: {
        currency: "BDT",
        min: 80000,
        max: 140000,
        period: "per_trip",
      },
      accommodation: {
        currency: "BDT",
        min: 8000,
        max: 25000,
        period: "per_day",
      },
      food: {
        currency: "BDT",
        min: 2500,
        max: 7000,
        period: "per_day",
      },
      transport: {
        currency: "BDT",
        min: 1200,
        max: 3500,
        period: "per_day",
      },
      activities: {
        currency: "BDT",
        min: 2000,
        max: 7000,
        period: "per_day",
      },
      visaAndFees: {
        currency: "BDT",
        min: 10000,
        max: 20000,
        period: "per_trip",
      },
      insurance: {
        currency: "BDT",
        min: 2000,
        max: 6000,
        period: "per_trip",
      },
      misc: {
        currency: "BDT",
        min: 3000,
        max: 8000,
        period: "per_trip",
      },
      total: {
        currency: "BDT",
        min: 150000,
        max: 280000,
        period: "per_trip",
      },
      note:
        "Illustrative planning range only. Actual costs depend on airfare, accommodation, season, exchange rates, attractions, and dining choices.",
    },

    visaAndDocuments: {
      status: "verify",
      summary:
        "Travelers may need a Schengen visa depending on nationality and current European entry rules.",
      documents: [
        "Valid passport",
        "Appropriate Schengen visa or entry authorization, if required",
        "Accommodation proof",
        "Travel itinerary",
        "Financial supporting documents",
        "Travel insurance where required",
      ],
      note:
        "Verify current French and Schengen visa requirements through official sources before travel.",
    },

    thingsToDo: [
      {
        title: "Eiffel Tower",
        description:
          "Visit Paris's most recognizable landmark and surrounding areas.",
        category: "city",
      },
      {
        title: "Louvre Museum",
        description:
          "Explore one of the world's best-known museums and its extensive collections.",
        category: "culture",
      },
      {
        title: "Montmartre",
        description:
          "Walk through historic streets, viewpoints, cafes, and artistic landmarks.",
        category: "culture",
      },
      {
        title: "Seine River",
        description:
          "Explore Paris along the river through walks, viewpoints, or cruises.",
        category: "nature",
      },
    ],

    travelTips: [
      {
        title: "Use public transportation",
        description:
          "Paris's metro and public transport network can make city exploration efficient.",
      },
      {
        title: "Group attractions by neighborhood",
        description:
          "Planning nearby attractions together can reduce unnecessary travel time.",
      },
      {
        title: "Book major attractions ahead",
        description:
          "Popular museums and landmarks may have timed-entry or reservation systems.",
      },
    ],
  },
];

export function getDestinationDetails(
  destinationId: string,
): DestinationDetails | null {
  return (
    destinationDetails.find(
      (destination) => destination.destinationId === destinationId,
    ) ?? null
  );
}