"use client";

import Image from "next/image";
import { useState } from "react";
import {
  isOptimizableArticleImage,
  isSecureArticleImage,
} from "@/lib/articles/images";

const fallbackImage =
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1800&q=85";

export default function ArticleCoverImage({
  src,
  title,
  category,
  sizes,
  priority = false,
  className = "",
}: {
  src: string | null;
  title: string;
  category: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const secureSrc = isSecureArticleImage(src) ? src : null;
  const requestedSrc = !failed && secureSrc ? secureSrc : fallbackImage;
  const optimized = isOptimizableArticleImage(requestedSrc);

  return (
    <div
      className={`relative isolate overflow-hidden bg-[linear-gradient(135deg,#123044,#08111b)] ${className}`}
    >
      <Image
        src={requestedSrc}
        alt={
          failed || !secureSrc
            ? "Travel planning with a world map"
            : `${title} — ${category} travel guide cover`
        }
        fill
        sizes={sizes}
        preload={priority}
        unoptimized={!optimized}
        onError={() => setFailed(true)}
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-white/[0.04]"
      />
    </div>
  );
}
