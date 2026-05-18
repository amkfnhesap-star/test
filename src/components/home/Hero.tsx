"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Search, MapPin, ChevronDown, Sparkles, Star, Shield, Zap } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import Image from "next/image";
import { Avatar } from "@/components/ui/Avatar";
import { platformStats } from "@/data/dummy";

const searchPlaceholders = [
  "Curățenie casă în București…",
  "Asamblare mobilier lângă mine…",
  "Automatizare flux de lucru AI…",
  "Dog walker în Cluj-Napoca…",
  "Reparații electrice azi…",
  "Designer logo brand…",
];

const popularSearches = [
  "Curățenie",
  "Reparații generale",
  "Ajutor la mutare",
  "Servicii AI",
  "Îngrijire animale",
  "Fotografie",
];

const floatingProviders = [
  { name: "Marcus J.", avatar: "https://i.pravatar.cc/60?img=12", rating: 4.9, role: "Reparații gen.", offset: { x: -340, y: -80 } },
  { name: "Sophia C.", avatar: "https://i.pravatar.cc/60?img=47", rating: 4.95, role: "Curățenie", offset: { x: 340, y: -100 } },
  { name: "James P.", avatar: "https://i.pravatar.cc/60?img=57", rating: 4.97, role: "Expert AI", offset: { x: -380, y: 80 } },
  { name: "Emma W.", avatar: "https://i.pravatar.cc/60?img=9", rating: 4.98, role: "Îngrijire animale", offset: { x: 360, y: 60 } },
];

const stats = [
  { label: "Meșteri verificați", value: formatNumber(platformStats.total_providers), icon: Shield },
  { label: "Lucrări finalizate", value: formatNumber(platformStats.total_bookings), icon: Zap },
  { label: "Evaluare medie", value: `${platformStats.avg_rating}★`, icon: Star },
];

const HERO_PHOTO = "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1920&h=1080&fit=crop&q=80";

export function Hero() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    const target = searchPlaceholders[placeholderIndex];
    let i = 0;
    setIsTyping(true);
    setDisplayText("");

    const typeInterval = setInterval(() => {
      if (i < target.length) {
        setDisplayText(target.slice(0, i + 1));
        i++;
      } else {
        clearInterval(typeInterval);
        setIsTyping(false);
        setTimeout(() => {
          setPlaceholderIndex((prev) => (prev + 1) % searchPlaceholders.length);
        }, 2000);
      }
    }, 50);

    return () => clearInterval(typeInterval);
  }, [placeholderIndex]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (location) params.set("location", location);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background photo + gradient overlay */}
      <div className="absolute inset-0">
        <Image
          src={HERO_PHOTO}
          alt=""
          fill
          priority
          className="object-cover object-right"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/98 via-white/92 to-white/75 md:bg-gradient-to-r md:from-white/95 md:via-white/80 md:to-white/40" />
      </div>

      {/* Subtle green tint orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-brand-400/10 blur-[120px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-brand-300/10 blur-[120px]"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Floating provider cards */}
      {floatingProviders.map((provider, i) => (
        <motion.div
          key={provider.name}
          className="absolute hidden lg:flex items-center gap-2 bg-white border border-slate-200 shadow-xl rounded-2xl px-3 py-2"
          style={{
            left: `calc(50% + ${provider.offset.x}px)`,
            top: `calc(50% + ${provider.offset.y}px)`,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: [0, -8, 0] }}
          transition={{
            opacity: { delay: i * 0.2 + 0.5, duration: 0.6 },
            y: { delay: i * 0.2 + 0.5, duration: 4, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          <Avatar src={provider.avatar} name={provider.name} size="sm" />
          <div>
            <p className="text-slate-900 text-xs font-medium leading-none">{provider.name}</p>
            <p className="text-slate-500 text-[10px] mt-0.5">{provider.role}</p>
          </div>
          <div className="flex items-center gap-0.5 ml-1">
            <Star className="h-2.5 w-2.5 text-amber-400 fill-amber-400" />
            <span className="text-slate-700 text-xs font-medium">{provider.rating}</span>
          </div>
        </motion.div>
      ))}

      {/* Main content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center pt-24">
        {/* AI badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-sm font-medium mb-6"
        >
          <Sparkles className="h-3.5 w-3.5 text-brand-500" />
          Potrivire AI — Găsești meșterul potrivit instant
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="text-3xl sm:text-5xl md:text-7xl font-bold text-slate-900 leading-[1.05] tracking-tight mb-4 md:mb-6 text-balance"
          style={{ textShadow: '0 1px 3px rgba(255,255,255,0.8)' }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Găsește{" "}
          <span className="relative">
            <span className="bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent">
              meșteri de încredere
            </span>
            <motion.span
              className="absolute -bottom-1 left-0 right-0 h-0.5 bg-brand-500 rounded-full"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            />
          </span>
          <br />în zona ta
        </motion.h1>

        <motion.p
          className="text-sm sm:text-lg md:text-xl text-slate-600 mb-6 md:mb-10 max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Rezervă meșteri verificați și asigurați pentru 14+ servicii. Disponibilitate în aceeași zi,
          prețuri transparente și garanție de satisfacție de 1M$.
        </motion.p>

        {/* Search bar */}
        <motion.div
          className="relative max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex flex-col sm:flex-row gap-2 p-2 rounded-2xl bg-white border border-slate-200 shadow-lg">
            {/* Service search */}
            <div className="flex-1 flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
              <Search className="h-4 w-4 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder={isTyping ? displayText : displayText + "|"}
                className="flex-1 bg-transparent text-base text-slate-900 placeholder:text-slate-400 focus:outline-none min-w-0"
              />
              <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-brand-50">
                <Sparkles className="h-3 w-3 text-brand-500" />
                <span className="text-xs text-brand-600 font-medium">AI</span>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 sm:w-52">
              <MapPin className="h-4 w-4 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Oraș sau cod poștal"
                className="flex-1 bg-transparent text-base text-slate-900 placeholder:text-slate-400 focus:outline-none min-w-0"
              />
            </div>

            {/* Search button */}
            <button
              onClick={handleSearch}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold hover:shadow-glow active:scale-[0.98] transition-all duration-200 text-sm whitespace-nowrap"
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Caută</span>
              <span className="sm:hidden">Caută meșteri</span>
            </button>
          </div>

          {/* Popular searches — horizontal scroll on mobile */}
          <div className="flex overflow-x-auto no-scrollbar gap-2 mt-4 pb-1 items-center">
            <span className="flex-shrink-0 text-slate-500 text-xs">Popular:</span>
            {popularSearches.map((term) => (
              <button
                key={term}
                onClick={() => {
                  setQuery(term);
                  router.push(`/search?q=${encodeURIComponent(term)}`);
                }}
                className="flex-shrink-0 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs hover:bg-slate-200 hover:text-slate-900 transition-all duration-200"
              >
                {term}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mt-10 md:mt-14"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center">
                <Icon className="h-4 w-4 text-brand-600" />
              </div>
              <div className="text-left">
                <div className="text-lg font-bold text-slate-900 leading-none">{value}</div>
                <div className="text-slate-500 text-[11px] mt-0.5">{label}</div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="flex justify-center mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-1 text-slate-400 cursor-pointer"
          >
            <span className="text-xs">Derulează pentru a descoperi</span>
            <ChevronDown className="h-4 w-4" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
