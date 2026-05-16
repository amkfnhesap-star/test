"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "Cum sunt verificați meșterii pe MesteRO?",
    a: "Fiecare meșter trece printr-un proces de verificare riguros în 5 pași: verificare act de identitate, verificare licență profesională (unde este cazul), verificare antecedente penale, verificare asigurare și evaluare competențe. Doar aproximativ 20% dintre candidați trec procesul nostru de selecție.",
  },
  {
    q: "Ce se întâmplă dacă nu sunt mulțumit de lucrare?",
    a: "Oferim garanție de satisfacție 100%. Dacă nu ești mulțumit de rezultat, trimitem un alt meșter să refacă lucrarea gratuit sau îți oferim rambursare integrală. Contactează echipa de suport în 72 de ore de la finalizarea lucrării.",
  },
  {
    q: "Cum funcționează prețurile?",
    a: "Prețul depinde de serviciu și meșter. Unele servicii au preț fix, altele sunt cu ora. Vei vedea întotdeauna prețul complet înainte de rezervare — fără costuri ascunse. Percepem un comision de platformă de 10%, inclus în prețul afișat.",
  },
  {
    q: "Sunt datele mele de plată în siguranță?",
    a: "Absolut. Toate plățile sunt procesate prin Stripe cu criptare SSL pe 256 de biți. Nu stocăm niciodată datele cardului tău pe serverele noastre. Plata este reținută în escrow și eliberată meșterului abia când lucrarea este marcată finalizată.",
  },
  {
    q: "Pot anula sau reprograma o rezervare?",
    a: "Da. Anulările cu 24+ ore înainte de ora programată sunt rambursate integral. Anulările în mai puțin de 24 de ore pot fi supuse unui mic comision. Reprogramarea este întotdeauna gratuită și se poate face direct din dashboard.",
  },
  {
    q: "Ce este funcția de potrivire AI?",
    a: "AI-ul nostru analizează descrierea lucrării, locația, bugetul și preferințele anterioare pentru a te potrivi instant cu cei mai potriviți 3-5 meșteri. Învață din feedback-ul tău pentru a deveni mai precis cu fiecare rezervare.",
  },
  {
    q: "Cum devin meșter pe MesteRO?",
    a: "Apasă 'Devino meșter' și completează-ți profilul cu competențele, experiența și portofoliul. După trimiterea documentelor pentru verificare (durează 1-3 zile lucrătoare), vei fi activ pe platformă și vei începe să primești cereri de lucrări.",
  },
  {
    q: "În ce orașe activați?",
    a: "Operăm în prezent în 50+ orașe din România, inclusiv București, Cluj-Napoca, Timișoara, Iași, Brașov, Constanța, Craiova și altele. Ne extindem rapid — introdu codul poștal pentru a verifica disponibilitatea în zona ta.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 md:py-28 bg-zinc-50 dark:bg-zinc-900/50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-brand-500 font-semibold text-sm uppercase tracking-wider mb-3">
            Întrebări frecvente
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-4">
            Cele mai frecvente{" "}
            <span className="gradient-text">întrebări</span>
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400">
            Tot ce trebuie să știi despre MesteRO.
          </p>
        </motion.div>

        {/* Accordion */}
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={cn(
                "rounded-2xl border overflow-hidden transition-all duration-200",
                openIndex === i
                  ? "border-brand-200 dark:border-brand-800/50 bg-white dark:bg-zinc-900 shadow-sm"
                  : "border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900"
              )}
            >
              <button
                className="w-full flex items-center justify-between p-5 text-left"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <span
                  className={cn(
                    "font-medium text-sm pr-4 leading-snug",
                    openIndex === i
                      ? "text-brand-600 dark:text-brand-400"
                      : "text-zinc-900 dark:text-white"
                  )}
                >
                  {faq.q}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === i ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-colors",
                      openIndex === i
                        ? "text-brand-500"
                        : "text-zinc-400"
                    )}
                  />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  >
                    <div className="px-5 pb-5 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800 pt-4">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </motion.div>

        {/* Support link */}
        <motion.div
          className="mt-10 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            Ai în continuare întrebări?{" "}
            <a
              href="/contact"
              className="text-brand-600 dark:text-brand-400 font-medium hover:underline"
            >
              Contactează echipa de suport →
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
