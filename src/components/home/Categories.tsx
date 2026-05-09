"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { categories } from "@/data/dummy";
import { formatNumber } from "@/lib/utils";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function Categories() {
  return (
    <section className="py-20 md:py-28 bg-white dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-brand-500 font-semibold text-sm uppercase tracking-wider mb-2">
              14 Categories
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white">
              Every service you need,
              <br />
              <span className="gradient-text">in one place</span>
            </h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link
              href="/search"
              className="hidden md:flex items-center gap-2 text-sm font-medium text-brand-600 dark:text-brand-400 hover:gap-3 transition-all duration-200"
            >
              Browse all services
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>

        {/* Grid */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {categories.map((cat) => (
            <motion.div key={cat.id} variants={itemVariants}>
              <Link href={`/search?category=${cat.slug}`}>
                <div className="group relative flex flex-col items-center gap-3 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-transparent hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden">
                  {/* Gradient background on hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity duration-300`}
                  />

                  {/* Icon */}
                  <div
                    className={`relative h-12 w-12 rounded-xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-300`}
                  >
                    {cat.icon}
                  </div>

                  {/* Text */}
                  <div className="text-center">
                    <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white leading-tight">
                      {cat.name}
                    </p>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-600 mt-0.5">
                      {formatNumber(cat.count)}+ pros
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Mobile CTA */}
        <div className="mt-6 flex justify-center md:hidden">
          <Link
            href="/search"
            className="flex items-center gap-2 text-sm font-medium text-brand-600 dark:text-brand-400"
          >
            Browse all services
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
