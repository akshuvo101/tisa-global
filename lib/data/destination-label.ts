import { destinations } from "@/lib/data/destination";

const countryAliases: Record<string, string> = {
  switz: "CH",
};

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function getDestinationCountryLabel(
  value: string | null | undefined,
): string | null {
  if (!value?.trim()) return null;

  const normalized = normalize(value);
  const aliasCountryCode = countryAliases[normalized];
  if (aliasCountryCode) {
    const aliasedCountry = destinations.find(
      (destination) => destination.countryCode === aliasCountryCode,
    )?.country;
    if (aliasedCountry) return aliasedCountry;
  }

  const destination = destinations.find(
    (item) =>
      normalize(item.country) === normalized ||
      normalize(item.countryCode) === normalized ||
      normalize(item.id) === normalized,
  );

  return destination?.country ?? value.trim();
}

export function getDestinationLabel(
  city: string | null | undefined,
  country: string | null | undefined,
  fallback = "International travel assistance",
): string {
  const cityValue = city?.trim();
  const countryValue = country?.trim();
  const normalizedCity = cityValue ? normalize(cityValue) : "";

  if (cityValue) {
    const aliasCountryCode = countryAliases[normalizedCity];
    if (aliasCountryCode) {
      const country = destinations.find(
        (destination) => destination.countryCode === aliasCountryCode,
      )?.country;
      if (country) return country;
    }

    const knownCity = destinations.find(
      (destination) =>
        normalize(destination.city ?? "") === normalizedCity,
    );
    if (knownCity?.city) {
      return knownCity.city;
    }

    const knownName = destinations.find(
      (destination) => normalize(destination.name) === normalizedCity,
    );
    if (knownName) return knownName.name;
  }

  return getDestinationCountryLabel(countryValue) ?? cityValue ?? fallback;
}
