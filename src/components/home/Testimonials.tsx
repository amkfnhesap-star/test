"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Star, Quote } from "lucide-react";
import { testimonials } from "@/data/dummy";

export function Testimonials() {
  const doubled = [...testimonials, ...testimonials];

  return (
    <section className="py-20 md:py-28 bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-12">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-brand-600 font-semibold text-sm uppercase tracking-wider mb-3">
            Testimoniale
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
            Iubit de{" "}
            <span className="gradient-text">1,2M+ clienți</span>
          </h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            Povești reale de la oameni care și-au găsit meșterul perfect pe MesteRO.
          </p>
        </motion.div>
      </div>

      {/* Auto-scrolling rows */}
      <div className="space-y-4">
        {/* Row 1 — scrolling left */}
        <div className="relative flex overflow-hidden">
          <motion.div
            className="flex gap-4 pr-4"
            animate={{ x: [0, "-50%"] }}
            transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
          >
            {doubled.map((t, i) => (
              <TestimonialCard key={`${t.id}-${i}`} testimonial={t} />
            ))}
          </motion.div>
        </div>

        {/* Row 2 — scrolling right */}
        <div className="relative flex overflow-hidden">
          <motion.div
            className="flex gap-4 pr-4"
            animate={{ x: ["-50%", 0] }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          >
            {[...doubled].reverse().map((t, i) => (
              <TestimonialCard key={`${t.id}-rev-${i}`} testimonial={t} />
            ))}
          </motion.div>
        </div>
      </div>

      {/* Trust stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-16">
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ staggerChildren: 0.1 }}
        >
          {[
            { value: "4.9/5", label: "Evaluare medie", sub: "Din 2M+ recenzii" },
            { value: "98%", label: "Rată de satisfacție", sub: "Garanție rambursare" },
            { value: "< 4h", label: "Timp mediu răspuns", sub: "Cei mai mulți sub 1h" },
            { value: "2M+", label: "Lucrări finalizate", sub: "Și crește" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="text-center p-6 rounded-2xl bg-white border border-slate-100"
            >
              <div className="text-2xl md:text-3xl font-bold gradient-text mb-1">
                {stat.value}
              </div>
              <div className="text-sm font-semibold text-slate-800">
                {stat.label}
              </div>
              <div className="text-xs text-zinc-400 mt-0.5">{stat.sub}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function TestimonialCard({ testimonial }: { testimonial: typeof testimonials[0] }) {
  return (
    <div className="flex-shrink-0 w-72 md:w-80 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Image
            src={testimonial.avatar}
            alt={testimonial.name}
            width={36}
            height={36}
            className="h-9 w-9 rounded-full object-cover"
          />
          <div>
            <p className="text-sm font-semibold text-slate-900 leading-none">
              {testimonial.name}
            </p>
            <p className="text-[10px] text-zinc-400 mt-0.5">{testimonial.role}</p>
          </div>
        </div>
        <Quote className="h-5 w-5 text-brand-300 flex-shrink-0" />
      </div>

      <div className="flex gap-0.5 mb-3">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star key={i} className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
        ))}
      </div>

      <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
        {testimonial.text}
      </p>

      <p className="text-xs text-zinc-400 mt-3">{testimonial.location}</p>
    </div>
  );
}
