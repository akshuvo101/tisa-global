
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Image as ImageIcon, MapPin } from "lucide-react";

type DestinationCoverProps = {
  city: string | null;
  country: string | null;
  variation?: number;
};

type ImageResult = {
  imageUrl: string;
  alt: string;
  photographer: string;
  photographerUrl: string | null;
  photoUrl: string;
};

const destinationPhotoRequests = new Map<string, Promise<ImageResult>>();

function fetchDestinationPhoto(
  city: string | null,
  country: string | null,
  variation: number,
) {
  const cacheKey = [city, country]
    .map((value) => value?.trim().toLocaleLowerCase() ?? "")
    .concat(String(variation))
    .join("|");
  const cached = destinationPhotoRequests.get(cacheKey);
  if (cached) return cached;

  const params = new URLSearchParams({
    city: city ?? "",
    country: country ?? "",
    variation: String(variation),
  });
  const request = fetch(`/api/destination-image?${params.toString()}`)
    .then(async (response) => {
      if (!response.ok) throw new Error("Image unavailable");
      const result = (await response.json()) as ImageResult;
      if (!result.imageUrl) throw new Error("Image unavailable");
      return result;
    })
    .catch((error: unknown) => {
      destinationPhotoRequests.delete(cacheKey);
      throw error;
    });

  destinationPhotoRequests.set(cacheKey, request);
  if (destinationPhotoRequests.size > 64) {
    const oldestKey = destinationPhotoRequests.keys().next().value;
    if (oldestKey) destinationPhotoRequests.delete(oldestKey);
  }
  return request;
}

export default function DestinationCover({
  city,
  country,
  variation = 0,
}: DestinationCoverProps) {
  const [photo, setPhoto] = useState<ImageResult | null>(null);
  const [failed, setFailed] = useState(false);
  const hasDestination = Boolean(city?.trim() || country?.trim());

  useEffect(() => {
    let active = true;

    async function loadPhoto() {
      setPhoto(null);
      setFailed(false);

      try {
        const result = await fetchDestinationPhoto(city, country, variation);
        if (active) setPhoto(result);
      } catch {
        if (active) setFailed(true);
      }
    }

    if (city?.trim() || country?.trim()) {
      void loadPhoto();
    }

    return () => {
      active = false;
    };
  }, [city, country, variation]);

  const destination = [city?.trim(), country?.trim()].filter(Boolean).join(", ");

  return (
    <div className="destination-cover">
      {photo ? (
        <Image
          src={photo.imageUrl}
          alt={photo.alt}
          fill
          sizes="(max-width: 679px) 100vw, (max-width: 1159px) 50vw, 33vw"
          loading="lazy"
          decoding="async"
          unoptimized
          className="destination-cover__image"
          onError={() => {
            setPhoto(null);
            setFailed(true);
          }}
        />
      ) : (
        <div
          className="destination-cover__fallback"
          aria-label={
            failed || !hasDestination
              ? `Destination image unavailable for ${destination || "this request"}`
              : `Loading destination image for ${destination}`
          }
          role="img"
        >
          <div className="destination-cover__glow" />
          <MapPin className="destination-cover__pin" aria-hidden="true" />
        </div>
      )}

      <div className="destination-cover__overlay" />

      {photo && (
        <div className="destination-cover__credit">
          <ImageIcon className="h-3 w-3" aria-hidden="true" />
          Photo by{" "}
          {photo.photographerUrl ? (
            <a
              href={`${photo.photographerUrl}?utm_source=tisa_global&utm_medium=referral`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(event) => event.stopPropagation()}
            >
              {photo.photographer}
            </a>
          ) : (
            photo.photographer
          )}
          {" · "}
          <a
            href={`${photo.photoUrl}?utm_source=tisa_global&utm_medium=referral`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => event.stopPropagation()}
          >
            Unsplash
          </a>
        </div>
      )}
    </div>
  );
}
