"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { categories } from "@/data/dummy";
import { CategoryCard } from "./CategoryCard";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function Categories() {
  return (
    <section className="py-20 md:py-28 bg-white">
      {/* Heading — constrained to max-w-7xl */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-brand-600 font-semibold text-sm uppercase tracking-wider mb-2">
              14 CATEGORII
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Toate serviciile,
              <br />
              <span className="gradient-text">într-un singur loc</span>
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
              className="hidden md:flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700 hover:gap-3 transition-all duration-200"
            >
              Toate serviciile
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Full-width grid */}
      <div className="w-full px-4 md:px-8 lg:px-12">
        <motion.div
          className="grid gap-3 md:gap-4 grid-cols-2 sm:grid-cols-4 lg:grid-cols-7"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {categories.map((cat) => (
            <motion.div key={cat.id} variants={itemVariants}>
              <CategoryCard
                name={cat.name}
                slug={cat.slug}
                count={cat.count}
                photoUrl={cat.photoUrl}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Mobile CTA */}
      <div className="mt-8 flex justify-center md:hidden">
        <Link
          href="/search"
          className="flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          Toate serviciile
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
