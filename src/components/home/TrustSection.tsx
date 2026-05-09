"use client";

import { motion } from "framer-motion";
import {
  ShieldCheck,
  Lock,
  BadgeCheck,
  Headphones,
  CreditCard,
  Users,
} from "lucide-react";

const trustFeatures = [
  {
    icon: ShieldCheck,
    title: "$1M Liability Coverage",
    description:
      "Every booking is backed by our $1 million liability insurance. Your home and belongings are always protected.",
    color: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50 dark:bg-emerald-900/10",
  },
  {
    icon: BadgeCheck,
    title: "Background Checked Pros",
    description:
      "Every provider goes through ID verification, criminal background checks, and reference validation before joining.",
    color: "from-brand-500 to-violet-600",
    bg: "bg-brand-50 dark:bg-brand-900/10",
  },
  {
    icon: Lock,
    title: "Secure Payments",
    description:
      "Stripe-powered payments with 256-bit SSL encryption. Your payment is held in escrow until the job is done.",
    color: "from-blue-500 to-sky-600",
    bg: "bg-blue-50 dark:bg-blue-900/10",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description:
      "Real humans available around the clock via chat, phone, or email. We resolve disputes within 24 hours.",
    color: "from-amber-500 to-orange-600",
    bg: "bg-amber-50 dark:bg-amber-900/10",
  },
  {
    icon: CreditCard,
    title: "Satisfaction Guarantee",
    description:
      "Not happy with the result? We'll send another pro or give you a full refund. No questions asked.",
    color: "from-pink-500 to-rose-600",
    bg: "bg-pink-50 dark:bg-pink-900/10",
  },
  {
    icon: Users,
    title: "Verified Reviews Only",
    description:
      "Every review is from a real, completed booking. No fake reviews or paid testimonials — ever.",
    color: "from-violet-500 to-purple-600",
    bg: "bg-violet-50 dark:bg-violet-900/10",
  },
];

const partnerLogos = [
  { name: "TechCrunch", text: "TC" },
  { name: "Forbes", text: "Forbes" },
  { name: "Wired", text: "WIRED" },
  { name: "The Verge", text: "The Verge" },
  { name: "Business Insider", text: "BI" },
  { name: "Fast Company", text: "FC" },
];

export function TrustSection() {
  return (
    <section className="py-20 md:py-28 bg-white dark:bg-zinc-950 relative overflow-hidden">
      <div className="absolute inset-0 mesh-bg opacity-50" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-brand-500 font-semibold text-sm uppercase tracking-wider mb-3">
            Why SkillSeekers
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-zinc-900 dark:text-white mb-4">
            Your safety is our{" "}
            <span className="gradient-text">top priority</span>
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-2xl mx-auto">
            We set the gold standard for marketplace trust and safety. Every professional
            is vetted, every payment is protected, and every job is guaranteed.
          </p>
        </motion.div>

        {/* Trust grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-20">
          {trustFeatures.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex gap-4 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:shadow-md transition-shadow"
            >
              <div
                className={`h-11 w-11 rounded-xl ${feature.bg} flex items-center justify-center flex-shrink-0`}
              >
                <feature.icon
                  className={`h-5 w-5 bg-gradient-to-br ${feature.color} bg-clip-text`}
                  style={{ WebkitBackgroundClip: "text", color: "transparent" }}
                />
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-white text-sm mb-1">
                  {feature.title}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* As seen in */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-widest mb-6">
            As featured in
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {partnerLogos.map((logo) => (
              <div
                key={logo.name}
                className="text-zinc-300 dark:text-zinc-600 font-bold text-lg md:text-xl hover:text-zinc-500 dark:hover:text-zinc-400 transition-colors cursor-pointer"
              >
                {logo.text}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
