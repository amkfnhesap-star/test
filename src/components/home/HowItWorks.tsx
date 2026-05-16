"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const steps = [
  {
    number: 1,
    title: "Descrie lucrarea",
    description:
      "Spune-ne ce ai nevoie în cuvinte simple. AI-ul nostru te potrivește instant cu cei mai buni meșteri disponibili din zona ta.",
    highlight: "Potrivire AI",
    highlightColor: "from-brand-500 to-violet-600",
    fallbackGradient: "from-violet-600 to-violet-900",
    photoUrl:
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=600&fit=crop&q=80",
  },
  {
    number: 2,
    title: "Alege meșterul și programează",
    description:
      "Compară meșteri verificați după evaluare, preț și disponibilitate. Rezervă instant sau solicită o ofertă personalizată — în câteva minute.",
    highlight: "Rezervare instant",
    highlightColor: "from-emerald-500 to-teal-600",
    fallbackGradient: "from-emerald-600 to-teal-900",
    photoUrl:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=600&fit=crop&q=80",
  },
  {
    number: 3,
    title: "Treaba e gata, în siguranță",
    description:
      "Plata este reținută în siguranță până la finalizarea lucrării. Evaluează meșterul, iar banii sunt eliberați — mereu protejaţi de garanția noastră.",
    highlight: "Garanție 1M$",
    highlightColor: "from-amber-500 to-orange-600",
    fallbackGradient: "from-amber-500 to-orange-900",
    photoUrl:
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=600&fit=crop&q=80",
  },
];

type Step = (typeof steps)[number];

function StepCard({ step, index }: { step: Step; index: number }) {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className={index === 2 ? "md:col-span-2 lg:col-span-1" : ""}
    >
      <div className="rounded-3xl overflow-hidden ring-1 ring-white/5 bg-slate-900 h-full">
        {/* Photo */}
        <div className="relative aspect-[4/3]">
          {!imgError ? (
            <img
              src={step.photoUrl}
              loading="lazy"
              alt={step.title}
              onError={() => setImgError(true)}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div
              className={`absolute inset-0 bg-gradient-to-br ${step.fallbackGradient}`}
            />
          )}

          {/* Bottom gradient so pill text is always readable */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

          {/* Step number badge */}
          <div className="absolute top-4 right-4 h-9 w-9 rounded-full bg-white shadow-md flex items-center justify-center">
            <span className="text-zinc-900 text-sm font-bold leading-none">
              {step.number}
            </span>
          </div>

          {/* Highlight pill */}
          <div className="absolute bottom-4 left-4">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${step.highlightColor}`}
            >
              {step.highlight}
            </span>
          </div>
        </div>

        {/* Text content */}
        <div className="p-6">
          <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
          <p className="text-slate-400 leading-relaxed">{step.description}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-20 md:py-28 bg-zinc-50 dark:bg-zinc-900/50 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-dots opacity-50 dark:opacity-20" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-brand-500 font-semibold text-sm uppercase tracking-wider mb-3">
            Cum funcționează
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-zinc-900 dark:text-white mb-4">
            De la idee la realitate,{" "}
            <span className="gradient-text">în câteva minute</span>
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-2xl mx-auto">
            Cea mai rapidă cale de a rezolva orice, cu un meșter de încredere.
            Fără apeluri, fără bătăi de cap — doar rezultate.
          </p>
        </motion.div>

        {/* Step cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <StepCard key={step.number} step={step} index={i} />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-500 to-violet-600 text-white font-semibold text-base hover:shadow-glow hover:scale-105 transition-all duration-200"
          >
            Găsește un meșter acum
            <ArrowRight className="h-5 w-5" />
          </Link>
          <p className="mt-3 text-sm text-zinc-400">
            Fără card · Gratuit de explorat
          </p>
        </motion.div>
      </div>
    </section>
  );
}
