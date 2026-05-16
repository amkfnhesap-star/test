"use client";

import { useState } from "react";
import Link from "next/link";
import { formatNumber } from "@/lib/utils";

const FALLBACK_GRADIENTS = [
  "from-violet-600 to-violet-900",
  "from-cyan-600 to-cyan-900",
  "from-emerald-600 to-emerald-900",
  "from-amber-500 to-amber-800",
  "from-pink-600 to-pink-900",
  "from-slate-600 to-slate-900",
];

function slugHash(slug: string): number {
  let h = 0;
  for (const c of slug) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return h % FALLBACK_GRADIENTS.length;
}

interface Props {
  name: string;
  slug: string;
  count: number;
  photoUrl?: string;
}

export function CategoryCard({ name, slug, count, photoUrl }: Props) {
  const [imgError, setImgError] = useState(false);
  const showPhoto = Boolean(photoUrl) && !imgError;

  return (
    <Link
      href={`/search?category=${slug}`}
      className="group relative block aspect-[4/5] overflow-hidden rounded-2xl ring-1 ring-white/10 cursor-pointer transition-transform duration-300 hover:-translate-y-0.5"
    >
      {showPhoto ? (
        <img
          src={photoUrl}
          loading="lazy"
          alt={name}
          onError={() => setImgError(true)}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div
          className={`absolute inset-0 bg-gradient-to-br ${FALLBACK_GRADIENTS[slugHash(slug)]}`}
        />
      )}

      {/* Gradient overlay keeps text readable over any background */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 group-hover:from-black/65" />

      {/* Text */}
      <div className="absolute bottom-0 left-0 p-3 md:p-4">
        <p className="text-lg md:text-xl lg:text-2xl font-bold text-white leading-tight drop-shadow-sm">
          {name}
        </p>
        <p className="text-xs md:text-sm text-white/70 mt-0.5">
          {formatNumber(count)}+ meșteri
        </p>
      </div>
    </Link>
  );
}
