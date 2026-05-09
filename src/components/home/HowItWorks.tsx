"use client";

import { motion } from "framer-motion";
import { Search, CalendarCheck, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Describe your job",
    description:
      "Tell us what you need in plain language. Our AI instantly matches you with the best available professionals in your area.",
    color: "from-brand-500 to-violet-600",
    highlight: "AI Matching",
  },
  {
    number: "02",
    icon: CalendarCheck,
    title: "Pick your pro & schedule",
    description:
      "Compare verified pros by rating, price, and availability. Book instantly or request a custom quote — all within minutes.",
    color: "from-emerald-500 to-teal-600",
    highlight: "Instant Booking",
  },
  {
    number: "03",
    icon: CheckCircle2,
    title: "Get it done, securely",
    description:
      "Payment is held securely until the job is complete. Rate your pro, and your money is released — always protected by our guarantee.",
    color: "from-amber-500 to-orange-600",
    highlight: "$1M Guarantee",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-20 md:py-28 bg-zinc-50 dark:bg-zinc-900/50 relative overflow-hidden"
    >
      {/* Background dots */}
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
            How It Works
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-zinc-900 dark:text-white mb-4">
            From need to done{" "}
            <span className="gradient-text">in minutes</span>
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-2xl mx-auto">
            The fastest way to get any task done by a trusted professional.
            No calls, no hassle — just results.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 relative">
          {/* Connecting line (desktop) */}
          <div className="absolute top-16 left-[calc(16.67%-24px)] right-[calc(16.67%-24px)] h-px bg-gradient-to-r from-brand-500/50 via-emerald-500/50 to-amber-500/50 hidden md:block" />

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative flex flex-col items-center text-center"
            >
              {/* Number + Icon */}
              <div className="relative mb-6">
                {/* Outer ring */}
                <div
                  className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${step.color} p-0.5 shadow-lg`}
                >
                  <div className="h-full w-full rounded-[14px] bg-white dark:bg-zinc-900 flex items-center justify-center">
                    <step.icon
                      className={`h-6 w-6 bg-gradient-to-br ${step.color} bg-clip-text`}
                      style={{
                        WebkitBackgroundClip: "text",
                        color: "transparent",
                      }}
                    />
                  </div>
                </div>
                {/* Step number */}
                <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[10px] font-bold flex items-center justify-center">
                  {i + 1}
                </span>
              </div>

              {/* Badge */}
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${step.color} mb-3`}
              >
                {step.highlight}
              </span>

              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">
                {step.title}
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed text-sm">
                {step.description}
              </p>

              {/* Arrow between steps */}
              {i < steps.length - 1 && (
                <div className="flex md:hidden justify-center mt-6">
                  <ArrowRight className="h-5 w-5 text-zinc-300 dark:text-zinc-600 rotate-90" />
                </div>
              )}
            </motion.div>
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
            Find a Professional Now
            <ArrowRight className="h-5 w-5" />
          </Link>
          <p className="mt-3 text-sm text-zinc-400">
            No credit card required · Free to browse
          </p>
        </motion.div>
      </div>
    </section>
  );
}
