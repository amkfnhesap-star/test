"use client";

import { motion } from "framer-motion";
import { Smartphone, Bell, MapPin, Star, CheckCircle } from "lucide-react";

const features = [
  { icon: Bell, text: "Notificări instant de rezervare" },
  { icon: MapPin, text: "Urmărire meșteri în timp real" },
  { icon: Star, text: "Lasă recenzii din aplicație" },
  { icon: CheckCircle, text: "Actualizări progres lucrare" },
];

export function AppPromo() {
  return (
    <section className="py-20 md:py-28 bg-zinc-950 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/50 to-violet-900/30" />
        <div className="absolute inset-0 bg-grid opacity-20" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/20 border border-brand-500/30 text-brand-300 text-xs font-medium mb-6">
              <Smartphone className="h-3.5 w-3.5" />
              Aplicație mobilă în curând
            </div>

            <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-5">
              Rezervă din mers.{" "}
              <span className="bg-gradient-to-r from-brand-300 to-violet-300 bg-clip-text text-transparent">
                Oriunde, oricând.
              </span>
            </h2>
            <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
              Aplicația MesteRO îți pune 250.000+ meșteri la îndemână.
              Rezervă, urmărește și evaluează din telefon în câteva secunde.
            </p>

            {/* Features */}
            <ul className="space-y-3 mb-10">
              {features.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-brand-500/20 border border-brand-500/30 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-4 w-4 text-brand-400" />
                  </div>
                  <span className="text-zinc-300 text-sm">{text}</span>
                </li>
              ))}
            </ul>

            {/* App store buttons */}
            <div className="flex flex-wrap gap-3">
              <button className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors backdrop-blur-sm">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <div className="text-left">
                  <div className="text-[9px] text-white/60 uppercase tracking-wider">Descarcă pe</div>
                  <div className="text-sm font-semibold">App Store</div>
                </div>
              </button>

              <button className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors backdrop-blur-sm">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.18 23.9c.24.14.5.1.8-.06L16.2 16.9 12.5 12.9 3.18 23.9zm18.64-8.3L18.5 13.7l-4.05 4.1 3.54 3.6c.2.18.4.23.6.13l2.72-1.55c.8-.45.8-1.18.01-1.38zM3 2.37c-.1.2-.16.44-.16.7V20.9c0 .27.06.5.16.7L12.1 12l-9.1-9.63zm9.5 9.26l3.83-3.9-4.64-2.63L3 2.15 12.5 11.63z" />
                </svg>
                <div className="text-left">
                  <div className="text-[9px] text-white/60 uppercase tracking-wider">Disponibil pe</div>
                  <div className="text-sm font-semibold">Google Play</div>
                </div>
              </button>
            </div>

            <p className="text-zinc-600 text-xs mt-4">
              Alătură-te a 50.000+ utilizatori pe lista de așteptare. Acces timpuriu în curând.
            </p>
          </motion.div>

          {/* Phone mockup */}
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative">
              {/* Glow */}
              <div className="absolute inset-0 bg-brand-500/30 blur-3xl rounded-full scale-75" />

              {/* Phone frame */}
              <div className="relative w-56 h-[460px] rounded-[36px] border-2 border-zinc-700 bg-zinc-900 shadow-2xl overflow-hidden">
                {/* Screen */}
                <div className="absolute inset-1 rounded-[32px] bg-zinc-900 overflow-hidden">
                  {/* Status bar */}
                  <div className="flex items-center justify-between px-5 pt-3 pb-2">
                    <span className="text-white text-[10px] font-medium">9:41</span>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-1.5 rounded-sm bg-white/80" />
                      <div className="w-0.5 h-1.5 bg-white/40" />
                    </div>
                  </div>

                  {/* App header */}
                  <div className="px-4 py-3 bg-gradient-to-r from-brand-600 to-violet-700">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-6 w-6 rounded-md bg-white/20 flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold">S</span>
                      </div>
                      <span className="text-white text-sm font-semibold">MesteRO</span>
                    </div>
                    <div className="bg-white/15 rounded-xl px-3 py-2 flex items-center gap-2">
                      <div className="h-3 w-3 bg-white/50 rounded-sm" />
                      <span className="text-white/70 text-[10px]">Caută servicii...</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="px-3 py-3 space-y-2">
                    {[
                      { name: "Marcus J.", cat: "Reparații gen.", rating: "4.9", price: "65 RON/oră", color: "from-red-500 to-rose-600" },
                      { name: "Sophia C.", cat: "Curățenie", rating: "4.95", price: "120 RON", color: "from-blue-500 to-cyan-600" },
                      { name: "Emma W.", cat: "Îngrijire animale", rating: "4.98", price: "35 RON/oră", color: "from-pink-500 to-rose-600" },
                    ].map((p) => (
                      <div
                        key={p.name}
                        className="flex items-center gap-2.5 p-2.5 rounded-xl bg-zinc-800 border border-zinc-700"
                      >
                        <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${p.color} flex items-center justify-center`}>
                          <span className="text-white text-xs font-bold">{p.name[0]}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white text-[11px] font-medium">{p.name}</div>
                          <div className="text-zinc-400 text-[9px]">{p.cat}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-amber-400 text-[10px]">★ {p.rating}</div>
                          <div className="text-zinc-300 text-[10px]">{p.price}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Home indicator */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 rounded-full bg-white/30" />
              </div>

              {/* Floating notification */}
              <motion.div
                className="absolute -right-8 top-20 bg-white dark:bg-zinc-800 rounded-xl shadow-xl p-2.5 flex items-center gap-2 border border-zinc-100 dark:border-zinc-700"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <CheckCircle className="h-3.5 w-3.5 text-white" />
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-zinc-900 dark:text-white">Lucrare finalizată!</div>
                  <div className="text-[9px] text-zinc-400">Marcus vine spre tine</div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
