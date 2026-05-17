"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Star,
  MapPin,
  Clock,
  CheckCircle2,
  MessageSquare,
  Heart,
  Share2,
  ArrowLeft,
  Verified,
  Award,
  ChevronRight,
} from "lucide-react";
import { providers, reviews, services } from "@/data/dummy";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StarRating } from "@/components/ui/StarRating";
import { Avatar } from "@/components/ui/Avatar";

export default function ProviderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const provider = providers.find((p) => p.id === id);
  const [isFavorited, setIsFavorited] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "portfolio" | "reviews">("overview");

  if (!provider) notFound();

  const providerServices = services.filter((s) => s.provider_id === provider.id);
  const providerReviews = reviews.filter((r) => r.provider_id === provider.id);

  return (
    <div className="min-h-screen bg-slate-50 pt-16">
      {/* Cover image */}
      <div className="relative h-48 md:h-64 bg-gradient-to-br from-brand-500/20 to-violet-500/20">
        {provider.cover_url && (
          <Image
            src={provider.cover_url}
            alt=""
            fill
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Back button */}
        <div className="absolute top-4 left-4">
          <Link
            href="/search"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/30 text-white text-sm backdrop-blur-sm hover:bg-black/50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>

        {/* Actions */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => setIsFavorited(!isFavorited)}
            className={`p-2 rounded-lg backdrop-blur-sm transition-colors ${
              isFavorited
                ? "bg-red-500 text-white"
                : "bg-black/30 text-white hover:bg-black/50"
            }`}
          >
            <Heart className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`} />
          </button>
          <button className="p-2 rounded-lg bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 transition-colors">
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row gap-8 -mt-8">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Profile header card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="relative -mt-12 flex-shrink-0">
                  <Image
                    src={provider.avatar_url}
                    alt={provider.full_name}
                    width={72}
                    height={72}
                    className="h-18 w-18 rounded-2xl object-cover ring-4 ring-white shadow-lg"
                    style={{ height: 72, width: 72 }}
                  />
                  {provider.is_available && (
                    <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-white" />
                  )}
                </div>

                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-xl font-bold text-slate-900">
                          {provider.full_name}
                        </h1>
                        {provider.verification_status === "verified" && (
                          <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="h-3 w-3" />
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500text-sm mt-0.5">
                        {provider.tagline}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-500">
                    <StarRating
                      rating={provider.rating}
                      showValue
                      reviewCount={provider.review_count}
                      size="sm"
                    />
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {provider.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {provider.response_time}
                    </span>
                    <span>{provider.job_count}+ jobs</span>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {provider.badges.map((badge) => (
                      <Badge key={badge} variant="purple" className="text-xs">
                        <Award className="h-2.5 w-2.5 mr-0.5" />
                        {badge}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-white rounded-xl border border-slate-200 mb-5">
              {(["overview", "portfolio", "reviews"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium capitalize transition-all ${
                    activeTab === tab
                      ? "bg-brand-500 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {tab}
                  {tab === "reviews" && ` (${providerReviews.length})`}
                </button>
              ))}
            </div>

            {/* Overview tab */}
            {activeTab === "overview" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                {/* About */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5">
                  <h2 className="font-semibold text-slate-900mb-3">
                    About
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {provider.bio}
                  </p>
                </div>

                {/* Skills */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5">
                  <h2 className="font-semibold text-slate-900mb-3">
                    Skills & Expertise
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {provider.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Services */}
                {providerServices.length > 0 && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-5">
                    <h2 className="font-semibold text-slate-900mb-4">
                      Services Offered
                    </h2>
                    <div className="space-y-3">
                      {providerServices.map((svc) => (
                        <div
                          key={svc.id}
                          className="flex items-start justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200"
                        >
                          <div className="flex-1">
                            <h3 className="font-medium text-slate-900text-sm mb-1">
                              {svc.title}
                            </h3>
                            <p className="text-xs text-slate-500mb-2">
                              {svc.description}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {svc.includes.map((item) => (
                                <span
                                  key={item}
                                  className="flex items-center gap-1 text-[10px] text-emerald-600"
                                >
                                  <CheckCircle2 className="h-2.5 w-2.5" />
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="font-bold text-slate-900text-sm">
                              {formatCurrency(svc.price)}
                            </div>
                            <div className="text-xs text-slate-400">
                              {svc.price_type === "hourly" ? "/hr" : svc.price_type === "fixed" ? "fixed" : "quote"}
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">
                              ~{svc.duration_estimate}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Portfolio tab */}
            {activeTab === "portfolio" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-slate-200 p-5"
              >
                <h2 className="font-semibold text-slate-900mb-4">
                  Portfolio
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {provider.portfolio.map((item) => (
                    <div
                      key={item.id}
                      className="group relative aspect-square rounded-xl overflow-hidden bg-slate-100"
                    >
                      <Image
                        src={item.image_url}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end">
                        <p className="text-white text-xs font-medium p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.title}
                        </p>
                      </div>
                    </div>
                  ))}
                  {provider.portfolio.length === 0 && (
                    <p className="col-span-3 text-center text-slate-400 py-12">
                      No portfolio items yet.
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Reviews tab */}
            {activeTab === "reviews" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                {providerReviews.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                    <p className="text-slate-400">No reviews yet.</p>
                  </div>
                ) : (
                  providerReviews.map((review) => (
                    <div
                      key={review.id}
                      className="bg-white rounded-2xl border border-slate-200 p-5"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <Avatar
                          src={review.customer_avatar}
                          name={review.customer_name}
                          size="sm"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-slate-900text-sm">
                              {review.customer_name}
                            </span>
                            <StarRating rating={review.rating} size="sm" />
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {new Date(review.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {review.comment}
                      </p>
                    </div>
                  ))
                )}
              </motion.div>
            )}
          </div>

          {/* Sticky booking sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-2xl font-bold text-slate-900">
                      {formatCurrency(provider.hourly_rate)}
                    </span>
                    <span className="text-slate-400 text-sm">/hr</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                    <span className="font-semibold text-slate-900">
                      {provider.rating}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mb-5 text-sm">
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Response time</span>
                    <span className="font-medium text-slate-700">
                      {provider.response_time}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Jobs completed</span>
                    <span className="font-medium text-slate-700">
                      {provider.job_count}+
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Status</span>
                    <span
                      className={`font-medium flex items-center gap-1 ${
                        provider.is_available
                          ? "text-emerald-600"
                          : "text-slate-400"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          provider.is_available ? "bg-emerald-500" : "bg-slate-400"
                        }`}
                      />
                      {provider.is_available ? "Available" : "Busy"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Languages</span>
                    <span className="font-medium text-slate-700">
                      {provider.languages.join(", ")}
                    </span>
                  </div>
                </div>

                <Link href={`/book/${provider.id}`}>
                  <Button fullWidth size="lg" className="mb-3">
                    Book Now
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
                <Button variant="secondary" fullWidth size="md">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </Button>

                <p className="text-center text-xs text-slate-400 mt-4">
                  Free to contact · No booking fee
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
