
import { NextRequest, NextResponse } from "next/server";

export const revalidate = 3600;

type UnsplashPhoto = {
  urls?: {
    raw?: string;
    regular?: string;
  };
  width?: number;
  height?: number;
  alt_description?: string | null;
  description?: string | null;
  links?: {
    html?: string;
  };
  user?: {
    name?: string;
    links?: {
      html?: string;
    };
  };
};

const countryAttractions: Record<string, string> = {
  france: "Eiffel Tower Louvre French Riviera Mont Saint Michel",
  japan: "Mount Fuji Kyoto temples Tokyo landmarks cherry blossoms",
  italy: "Colosseum Venice canals Amalfi Coast Florence architecture",
  "united arab emirates": "Burj Khalifa Dubai skyline Abu Dhabi Sheikh Zayed Mosque",
  uae: "Burj Khalifa Dubai skyline Abu Dhabi Sheikh Zayed Mosque",
  thailand: "Phuket tropical islands Bangkok temples limestone coast",
  switzerland: "Swiss Alps scenic mountain villages lakes",
  turkey: "Cappadocia hot air balloons Istanbul Hagia Sophia",
  bangladesh: "Cox's Bazar Sundarbans Sajek Valley",
  "saudi arabia": "AlUla sandstone landscapes Jeddah waterfront Madinah",
  "united states": "Grand Canyon Statue of Liberty Yosemite National Park",
  "united kingdom": "Big Ben Tower Bridge Scottish Highlands",
  india: "Taj Mahal Rajasthan palaces Kerala backwaters",
  indonesia: "Bali temples rice terraces Komodo islands",
  greece: "Santorini white villages Acropolis Greek islands",
  egypt: "Giza pyramids Nile temples Luxor",
  australia: "Sydney Opera House Great Barrier Reef Uluru",
  "south korea": "Seoul palaces Jeju Island Busan coastline",
  nepal: "Himalayas Mount Everest Kathmandu temples",
  "south africa": "Table Mountain Cape Town coastline safari",
};

const cityAttractions: Record<string, string> = {
  paris: "Eiffel Tower Louvre",
  tokyo: "Tokyo Tower Shibuya skyline Senso ji",
  kyoto: "Fushimi Inari Kiyomizu dera",
  rome: "Colosseum Roman Forum",
  venice: "Venice Grand Canal Rialto Bridge",
  dubai: "Burj Khalifa Dubai Marina",
  bangkok: "Wat Arun Grand Palace",
  istanbul: "Hagia Sophia Blue Mosque Bosphorus",
  cappadocia: "Cappadocia hot air balloons",
  zurich: "Swiss Alps Lake Zurich",
  "cox s bazar": "Cox's Bazar beach",
  "cox bazar": "Cox's Bazar beach",
  alula: "AlUla Hegra Saudi Arabia",
  "abu dhabi": "Sheikh Zayed Grand Mosque",
  singapore: "Marina Bay Sands Gardens by the Bay",
  marrakech: "Marrakech medina Koutoubia Mosque",
  "new york": "Statue of Liberty Manhattan skyline",
};

function normalizeDestination(value: string) {
  return value.toLocaleLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function getAttractionTerms(city: string, country: string) {
  const cityTerms = cityAttractions[normalizeDestination(city)];
  const countryTerms = countryAttractions[normalizeDestination(country)];
  return [cityTerms, countryTerms].filter(Boolean).join(" ");
}

function photoRelevance(
  photo: UnsplashPhoto,
  city: string,
  country: string,
  attractionTerms: string,
) {
  const dimensionsScore =
    photo.width && photo.height
      ? Math.min(photo.width / photo.height, 2) * 2
      : 0;
  const searchableText = normalizeDestination(
    `${photo.alt_description ?? ""} ${photo.description ?? ""}`,
  );
  const searchableWords = new Set(searchableText.split(" "));
  const matchingScore = (value: string, weight: number) =>
    normalizeDestination(value)
      .split(" ")
      .filter((word) => word.length > 2 && searchableWords.has(word))
      .reduce((score) => score + weight, 0);
  const textScore =
    matchingScore(city, 8) +
    matchingScore(country, 5) +
    matchingScore(attractionTerms, 2);

  return dimensionsScore + textScore;
}

export async function GET(request: NextRequest) {
  const city = request.nextUrl.searchParams.get("city")?.trim() ?? "";
  const country = request.nextUrl.searchParams.get("country")?.trim() ?? "";
  const variationValue = request.nextUrl.searchParams.get("variation");
  const variation = variationValue === null ? 0 : Number(variationValue);

  if (!city && !country) {
    return NextResponse.json(
      { error: "A city or country is required." },
      { status: 400 },
    );
  }

  if (city.length > 100 || country.length > 100) {
    return NextResponse.json(
      { error: "Destination is too long." },
      { status: 400 },
    );
  }

  if (!Number.isInteger(variation) || variation < 0 || variation > 4) {
    return NextResponse.json(
      { error: "Image variation must be between 0 and 4." },
      { status: 400 },
    );
  }

  const accessKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!accessKey) {
    return NextResponse.json(
      { error: "Destination image service is not configured." },
      { status: 503 },
    );
  }

  const destination = [city, country].filter(Boolean).join(", ");
  const attractionTerms = getAttractionTerms(city, country);
  const cityTerms = cityAttractions[normalizeDestination(city)];
  const countryTerms = countryAttractions[normalizeDestination(country)];
  const queries = [
    city
      ? [city, country, cityTerms ?? countryTerms].filter(Boolean).join(" ")
      : [country, countryTerms].filter(Boolean).join(" "),
    [city, country, "landmark landscape"].filter(Boolean).join(" "),
  ].filter((query, index, all) => all.indexOf(query) === index);

  try {
    let photos: UnsplashPhoto[] = [];

    for (const query of queries) {
      const apiUrl = new URL("https://api.unsplash.com/search/photos");
      apiUrl.searchParams.set("query", query);
      apiUrl.searchParams.set("per_page", "10");
      apiUrl.searchParams.set("page", String(variation + 1));
      apiUrl.searchParams.set("orientation", "landscape");
      apiUrl.searchParams.set("content_filter", "high");
      apiUrl.searchParams.set("order_by", "relevant");

      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
          "Accept-Version": "v1",
        },
        next: { revalidate: 86400 },
      });

      if (!response.ok) {
        return NextResponse.json(
          { error: "Unable to find a destination image." },
          {
            status: 502,
            headers: {
              "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
            },
          },
        );
      }

      const result = (await response.json()) as {
        results?: UnsplashPhoto[];
      };
      photos = result.results ?? [];
      if (photos.some((photo) => photo.urls?.raw || photo.urls?.regular)) break;
    }

    const photo = photos
      ?.filter((item) => item.urls?.raw || item.urls?.regular)
      .sort(
        (first, second) =>
          photoRelevance(second, city, country, attractionTerms) -
          photoRelevance(first, city, country, attractionTerms),
      )[0];
    const imageUrl = photo?.urls?.raw
      ? (() => {
          const url = new URL(photo.urls.raw);
          url.searchParams.set("w", "1400");
          url.searchParams.set("h", "900");
          url.searchParams.set("fit", "crop");
          url.searchParams.set("crop", "entropy");
          url.searchParams.set("auto", "format");
          url.searchParams.set("q", "85");
          return url.toString();
        })()
      : photo?.urls?.regular;

    if (!photo || !imageUrl) {
      return NextResponse.json(
        { error: "No destination image found." },
        {
          status: 404,
          headers: {
            "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=86400",
          },
        },
      );
    }

    return NextResponse.json(
      {
        imageUrl,
        alt:
          photo.alt_description ||
          photo.description ||
          `Travel destination: ${destination}`,
        photographer: photo.user?.name ?? "Unsplash photographer",
        photographerUrl: photo.user?.links?.html ?? null,
        photoUrl: photo.links?.html ?? "https://unsplash.com/",
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
        },
      },
    );
  } catch {
    return NextResponse.json(
      { error: "Destination image service is temporarily unavailable." },
      {
        status: 502,
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      },
    );
  }
}
