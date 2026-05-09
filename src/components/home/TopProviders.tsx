"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Star, MapPin, Verified, ArrowRight, Clock } from "lucide-react";
import { providers } from "@/data/dummy";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

export function TopProviders() {
  const featured = providers.filter((p) => p.is_featured).slice(0, 6);

  return (
    <section className="py-20 md:py-28 bg-white dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-brand-500 font-semibold text-sm uppercase tracking-wider mb-2">
              Top Rated
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white">
              Meet our best{" "}
              <span className="gradient-text">professionals</span>
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 mt-3 max-w-md">
              Hand-verified experts with proven track records and thousands of 5-star reviews.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="hidden md:block"
          >
            <Link
              href="/search"
              className="flex items-center gap-2 text-sm font-medium text-brand-600 dark:text-brand-400 hover:gap-3 transition-all"
            >
              View all providers
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>

        {/* Provider grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featured.map((provider, i) => (
            <motion.div
              key={provider.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={`/providers/${provider.id}`}>
                <div className="group relative rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden hover:shadow-xl hover:border-transparent hover:-translate-y-1 transition-all duration-300">
                  {/* Cover image */}
                  <div className="relative h-28 bg-gradient-to-br from-brand-500/20 to-violet-500/20">
                    {provider.cover_url && (
                      <Image
                        src={provider.cover_url}
                        alt=""
                        fill
                        className="object-cover opacity-60"
                      />
                    )}
                    {/* Availability badge */}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium backdrop-blur-sm border ${
                          provider.is_available
                            ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                            : "bg-zinc-500/20 border-zinc-500/30 text-zinc-400"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            provider.is_available
                              ? "bg-emerald-400"
                              : "bg-zinc-400"
                          }`}
                        />
                        {provider.is_available ? "Available" : "Busy"}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    {/* Avatar */}
                    <div className="relative -mt-8 mb-3 flex items-end justify-between">
                      <div className="relative">
                        <Image
                          src={provider.avatar_url}
                          alt={provider.full_name}
                          width={56}
                          height={56}
                          className="h-14 w-14 rounded-xl object-cover ring-3 ring-white dark:ring-zinc-900 shadow-md"
                        />
                        {provider.verification_status === "verified" && (
                          <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center ring-2 ring-white dark:ring-zinc-900">
                            <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      {/* Price */}
                      <div className="text-right">
                        <div className="text-lg font-bold text-zinc-900 dark:text-white">
                          {formatCurrency(provider.hourly_rate)}
                          <span className="text-xs font-normal text-zinc-400">/hr</span>
                        </div>
                      </div>
                    </div>

                    {/* Name & tagline */}
                    <h3 className="font-semibold text-zinc-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {provider.full_name}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 mb-3">
                      {provider.tagline}
                    </p>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {provider.badges.slice(0, 2).map((badge) => (
                        <Badge key={badge} variant="purple" className="text-[10px]">
                          {badge}
                        </Badge>
                      ))}
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">{provider.rating}</span>
                        <span>({provider.review_count})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{provider.city}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{provider.response_time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="mt-8 flex justify-center md:hidden">
          <Link
            href="/search"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-violet-600 text-white text-sm font-semibold"
          >
            View all providers
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
