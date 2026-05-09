"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "How are professionals verified on SkillSeekers?",
    a: "Every provider goes through a rigorous 5-step verification process: government ID check, professional license verification (where applicable), criminal background check, insurance verification, and skills assessment. Only about 20% of applicants pass our vetting process.",
  },
  {
    q: "What happens if I'm not satisfied with the work?",
    a: "We offer a 100% satisfaction guarantee. If you're not happy with the result, we'll either send another professional to redo the work at no charge or give you a full refund. Simply contact our support team within 72 hours of job completion.",
  },
  {
    q: "How does pricing work?",
    a: "Pricing depends on the service and provider. Some services have fixed prices, while others are hourly. You'll always see the full price before booking — no hidden fees. We charge a 10% platform fee that's included in the price you see.",
  },
  {
    q: "Is my payment information secure?",
    a: "Absolutely. All payments are processed through Stripe with 256-bit SSL encryption. We never store your credit card details on our servers. Your payment is held in escrow and only released to the provider once the job is marked complete.",
  },
  {
    q: "Can I cancel or reschedule a booking?",
    a: "Yes. Cancellations made 24+ hours before the scheduled time are fully refunded. Cancellations within 24 hours may be subject to a small fee. Rescheduling is always free and can be done directly from your dashboard.",
  },
  {
    q: "What is the AI matching feature?",
    a: "Our AI analyzes your job description, location, budget, and historical preferences to instantly match you with the top 3-5 most suitable providers. It learns from your feedback to get smarter with every booking.",
  },
  {
    q: "How do I become a provider on SkillSeekers?",
    a: "Click 'Become a Provider' and complete your profile with your skills, experience, and portfolio. After submitting your documents for verification (takes 1-3 business days), you'll be active on the platform and start receiving job requests.",
  },
  {
    q: "What cities do you operate in?",
    a: "We currently operate in 150+ US cities including New York, Los Angeles, Chicago, Houston, San Francisco, Seattle, Austin, Miami, and more. We're expanding rapidly — enter your ZIP code to see availability in your area.",
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
            FAQ
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-4">
            Frequently asked{" "}
            <span className="gradient-text">questions</span>
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400">
            Everything you need to know about SkillSeekers.
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
            Still have questions?{" "}
            <a
              href="/contact"
              className="text-brand-600 dark:text-brand-400 font-medium hover:underline"
            >
              Contact our support team →
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
