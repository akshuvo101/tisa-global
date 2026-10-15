
"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const travelImages = [
  {
    src: "https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=2000&q=78",
    alt: "Alpine lake and mountain peaks",
  },
  {
    src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2000&q=78",
    alt: "Golden light over a sweeping travel landscape",
  },
  {
    src: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=2000&q=78",
    alt: "Colorful Italian coastal villages",
  },
  {
    src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=78",
    alt: "Tropical beach and turquoise water",
  },
  {
    src: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=2000&q=78",
    alt: "Mountain lake reflecting a forest",
  },
  {
    src: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=2000&q=78",
    alt: "Traditional streets of Kyoto",
  },
  {
    src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=78",
    alt: "Snow-covered mountain range",
  },
  {
    src: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=2000&q=78",
    alt: "Open countryside beneath a wide sky",
  },
  {
    src: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=2000&q=78",
    alt: "Northern lights above a winter landscape",
  },
  {
    src: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=2000&q=78",
    alt: "Wildlife on an African safari",
  },
];

const SLIDE_INTERVAL_MS = 10000;
const CROSSFADE_MS = 2200;

export default function GlobalTravelBackground() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState<number | null>(null);
  const [failedImages, setFailedImages] = useState<Set<number>>(
    () => new Set(),
  );

  const activeIndexRef = useRef(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      const nextIndex =
        (activeIndexRef.current + 1) % travelImages.length;

      setPreviousIndex(activeIndexRef.current);
      activeIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);
    }, SLIDE_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (previousIndex === null) return;

    const timeoutId = window.setTimeout(
      () => setPreviousIndex(null),
      CROSSFADE_MS,
    );

    return () => window.clearTimeout(timeoutId);
  }, [activeIndex, previousIndex]);

  const markImageFailed = (index: number) => {
    setFailedImages((current) => {
      if (current.has(index)) return current;

      const next = new Set(current);
      next.add(index);
      return next;
    });
  };

  const visibleIndices = [
    ...new Set(
      [
        previousIndex,
        activeIndex,
        (activeIndex + 1) % travelImages.length,
      ].filter((index): index is number => index !== null),
    ),
  ];

  return (
    <div
      aria-hidden="true"
      className="global-travel-background"
    >
      {visibleIndices.map((index) => {
        const isActive = index === activeIndex;
        const isPrevious = index === previousIndex;
        const shouldPreload =
          index === (activeIndex + 1) % travelImages.length;

        return (
          <div
            key={index}
            className={`global-travel-background__slide ${
              isActive
                ? "global-travel-background__slide--active"
                : isPrevious
                  ? "global-travel-background__slide--previous"
                  : "global-travel-background__slide--preload"
            }`}
          >
            {!failedImages.has(index) && (
              <Image
                src={travelImages[index].src}
                alt=""
                fill
                sizes="100vw"
                quality={75}
                preload={index === 0}
                loading={
                  index === 0
                    ? undefined
                    : shouldPreload
                      ? "eager"
                      : "lazy"
                }
                fetchPriority={shouldPreload ? "low" : "auto"}
                onError={() => markImageFailed(index)}
                className="global-travel-background__image"
              />
            )}
          </div>
        );
      })}

      <div className="global-travel-background__overlay" />
    </div>
  );
}