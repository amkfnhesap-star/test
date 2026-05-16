"use client";

import { motion } from "framer-motion";
import {
  Lock,
  ShieldCheck,
  MapPin,
  Heart,
  Ban,
  MessageCircle,
} from "lucide-react";

const cards = [
  {
    title: "Gratuit, complet gratuit",
    description:
      "Fără comisioane, fără taxe ascunse. Postezi lucrarea, alegi meșterul, vorbiți direct.",
    photo:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=300&h=400&fit=crop&q=80",
    accent: "emerald",
  },
  {
    title: "Construit în România",
    description:
      "Făcut de români, pentru români. Înțelegem piața locală și nevoile reale ale clienților și meșterilor.",
    photo:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=300&h=400&fit=crop&q=80",
    accent: "amber",
  },
  {
    title: "Contact direct cu meșterul",
    description:
      "Vorbești direct cu meșterul prin chat, telefon sau WhatsApp. Fără intermediari, fără bătăi de cap.",
    photo:
      "https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=300&h=400&fit=crop&q=80",
    accent: "violet",
  },
  {
    title: "Date protejate (GDPR)",
    description:
      "Datele tale sunt criptate și protejate conform GDPR. Servere în Uniunea Europeană, conexiune securizată SSL.",
    photo:
      "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=300&h=400&fit=crop&q=80",
    accent: "cyan",
  },
  {
    title: "Recenzii reale",
    description:
      "Doar clienți reali pot lăsa recenzii, după o lucrare finalizată. Fără recenzii false sau cumpărate.",
    photo:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=300&h=400&fit=crop&q=80",
    accent: "pink",
  },
  {
    title: "Toate categoriile, într-un singur loc",
    description:
      "De la curățenie și instalații sanitare până la design grafic și servicii AI — un singur cont pentru orice ai nevoie.",
    photo:
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=300&h=400&fit=crop&q=80",
    accent: "violet",
  },
];

const accentDot: Record<string, string> = {
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  violet: "bg-violet-500",
  cyan: "bg-cyan-500",
  pink: "bg-pink-500",
};

const accentFallback: Record<string, string> = {
  emerald: "bg-emerald-900",
  amber: "bg-amber-900",
  violet: "bg-violet-900",
  cyan: "bg-cyan-900",
  pink: "bg-pink-900",
};

const trustSignals = [
  { icon: Lock, label: "SSL securizat" },
  { icon: ShieldCheck, label: "Conform GDPR" },
  { icon: MapPin, label: "Servere în UE" },
  { icon: Heart, label: "Construit în România" },
  { icon: Ban, label: "Fără comisioane" },
  { icon: MessageCircle, label: "Suport în limba română" },
];

function initials(title: string) {
  return title
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function BenefitCard({
  card,
  index,
}: {
  card: (typeof cards)[number];
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.07 }}
      className="group flex flex-row rounded-2xl overflow-hidden bg-slate-900/60 ring-1 ring-white/5 hover:bg-slate-900/80 transition-colors"
    >
      {/* Photo strip */}
      <div className="w-32 md:w-40 flex-shrink-0 overflow-hidden relative">
        <img
          src={card.photo}
          alt={card.title}
          loading="lazy"
          onError={(e) => {
            const target = e.currentTarget;
            target.style.display = "none";
            const fallback = target.nextElementSibling as HTMLElement | null;
            if (fallback) fallback.style.display = "flex";
          }}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div
          className={`absolute inset-0 ${accentFallback[card.accent]} hidden items-center justify-center text-white font-bold text-lg`}
        >
          {initials(card.title)}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 flex flex-col justify-center">
        <span
          className={`inline-block h-2 w-2 rounded-full ${accentDot[card.accent]} mb-3`}
        />
        <h3 className="text-base font-bold text-white leading-snug">
          {card.title}
        </h3>
        <p className="text-sm text-slate-400 leading-relaxed mt-2">
          {card.description}
        </p>
      </div>
    </motion.div>
  );
}

export function TrustSection() {
  return (
    <section className="py-20 md:py-28 bg-zinc-950 relative overflow-hidden">
      <div className="absolute inset-0 mesh-bg opacity-30" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-brand-500 font-semibold text-sm uppercase tracking-wider mb-3">
            De ce MesteRO
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Tot ce ai nevoie,{" "}
            <span className="gradient-text">fără bătăi de cap</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Construim MesteRO ca o platformă simplă, onestă și ușor de folosit — fără comisioane, fără promisiuni goale, doar serviciile de care ai nevoie.
          </p>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {cards.map((card, i) => (
            <BenefitCard key={card.title} card={card} index={i} />
          ))}
        </div>

        {/* Trust signal strip */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-6">
            Bazat pe principii reale
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {trustSignals.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm">{label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
