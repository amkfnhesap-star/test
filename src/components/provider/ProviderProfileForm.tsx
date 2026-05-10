"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { X, Camera } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { categories } from "@/data/dummy";
import { cn } from "@/lib/utils";
import type { ProviderProfileInput } from "@/lib/providers";

const RESPONSE_TIME_OPTIONS = [
  "Within 1 hour",
  "Within 2 hours",
  "Same day",
  "Within 24 hours",
  "Within 2-3 days",
];

const MAX_PORTFOLIO = 8;

interface FormErrors {
  headline?: string;
  main_category?: string;
  pricing?: string;
  home_city?: string;
  bio?: string;
}

export interface ProviderFormData extends ProviderProfileInput {
  is_active: boolean;
}

interface Props {
  initialData?: Partial<ProviderFormData>;
  existingPortfolioUrls?: string[];
  onSubmit: (
    data: ProviderFormData,
    newPhotoFiles: File[],
    removedUrls: string[]
  ) => Promise<void>;
  isLoading: boolean;
  showIsActive?: boolean;
  submitLabel?: string;
}

export function ProviderProfileForm({
  initialData,
  existingPortfolioUrls = [],
  onSubmit,
  isLoading,
  showIsActive = false,
  submitLabel = "Save",
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [headline, setHeadline] = useState(initialData?.headline ?? "");
  const [mainCategory, setMainCategory] = useState(initialData?.main_category ?? "");
  const [skills, setSkills] = useState<string[]>(initialData?.skills ?? []);
  const [skillInput, setSkillInput] = useState("");
  const [hourlyRate, setHourlyRate] = useState(
    initialData?.hourly_rate != null ? String(initialData.hourly_rate) : ""
  );
  const [fixedPriceFrom, setFixedPriceFrom] = useState(
    initialData?.fixed_price_from != null ? String(initialData.fixed_price_from) : ""
  );
  const [homeCity, setHomeCity] = useState(initialData?.home_city ?? "");
  const [serviceRadius, setServiceRadius] = useState(
    initialData?.service_radius_km ?? 20
  );
  const [yearsExperience, setYearsExperience] = useState(
    initialData?.years_experience != null ? String(initialData.years_experience) : ""
  );
  const [responseTime, setResponseTime] = useState(initialData?.response_time ?? "");
  const [bio, setBio] = useState(initialData?.bio ?? "");
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);

  // Portfolio: existing URLs kept vs new File objects
  const [keptUrls, setKeptUrls] = useState<string[]>(existingPortfolioUrls);
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});

  const totalPhotos = keptUrls.length + newPhotos.length;

  const commitSkill = (raw: string) => {
    const tag = raw.trim().replace(/,+$/, "").trim();
    if (tag && !skills.includes(tag) && skills.length < 15) {
      setSkills((prev) => [...prev, tag]);
    }
    setSkillInput("");
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commitSkill(skillInput);
    } else if (e.key === "Backspace" && !skillInput && skills.length > 0) {
      setSkills((prev) => prev.slice(0, -1));
    }
  };

  const handleSkillBlur = () => {
    if (skillInput.trim()) commitSkill(skillInput);
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const remaining = MAX_PORTFOLIO - totalPhotos;
    setNewPhotos((prev) => [...prev, ...files].slice(0, remaining));
    e.target.value = "";
  };

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (headline.trim().length < 10)
      errs.headline = "Headline must be at least 10 characters.";
    if (!mainCategory) errs.main_category = "Please select a category.";
    if (!hourlyRate && !fixedPriceFrom)
      errs.pricing = "Enter at least one price (hourly or starting from).";
    if (!homeCity.trim()) errs.home_city = "City is required.";
    if (bio.trim().length < 30) errs.bio = "Bio must be at least 30 characters.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const removedUrls = existingPortfolioUrls.filter((u) => !keptUrls.includes(u));

    await onSubmit(
      {
        headline: headline.trim(),
        main_category: mainCategory,
        skills,
        hourly_rate: hourlyRate ? Number(hourlyRate) : null,
        fixed_price_from: fixedPriceFrom ? Number(fixedPriceFrom) : null,
        service_radius_km: serviceRadius,
        home_city: homeCity.trim(),
        years_experience: yearsExperience ? Number(yearsExperience) : null,
        response_time: responseTime || null,
        portfolio_urls: keptUrls,
        bio: bio.trim(),
        is_active: isActive,
      },
      newPhotos,
      removedUrls
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Main Category */}
      <div>
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-2">
          Main Category <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setMainCategory(cat.slug);
                setErrors((p) => ({ ...p, main_category: undefined }));
              }}
              className={cn(
                "flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium text-left transition-all",
                mainCategory === cat.slug
                  ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300"
                  : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600"
              )}
            >
              <span className="text-base leading-none">{cat.icon}</span>
              <span className="truncate">{cat.name}</span>
            </button>
          ))}
        </div>
        {errors.main_category && (
          <p className="text-xs text-red-500 mt-1.5">{errors.main_category}</p>
        )}
      </div>

      {/* Headline */}
      <Input
        label="Headline *"
        placeholder='e.g. "Professional plumber with 10+ years of experience"'
        value={headline}
        onChange={(e) => setHeadline(e.target.value)}
        error={errors.headline}
        fullWidth
      />

      {/* Skills tag input */}
      <div>
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-2">
          Skills{" "}
          <span className="text-zinc-400 font-normal text-xs">
            (press Enter or comma to add, up to 15)
          </span>
        </label>
        <div className="min-h-[48px] flex flex-wrap gap-1.5 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">
          {skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-xs font-medium"
            >
              {skill}
              <button
                type="button"
                onClick={() => setSkills((s) => s.filter((x) => x !== skill))}
                className="text-brand-400 hover:text-brand-600 transition-colors ml-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={handleSkillKeyDown}
            onBlur={handleSkillBlur}
            placeholder={skills.length === 0 ? "e.g. Deep Cleaning, Eco Products..." : ""}
            className="flex-1 min-w-[140px] outline-none text-sm bg-transparent text-zinc-900 dark:text-white placeholder:text-zinc-400"
          />
        </div>
      </div>

      {/* Pricing */}
      <div>
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-2">
          Pricing{" "}
          <span className="text-zinc-400 font-normal text-xs">(at least one required)</span>
        </label>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Hourly Rate (RON/hr)"
            type="number"
            placeholder="e.g. 80"
            min={0}
            value={hourlyRate}
            onChange={(e) => {
              setHourlyRate(e.target.value);
              setErrors((p) => ({ ...p, pricing: undefined }));
            }}
            fullWidth
          />
          <Input
            label="Starting From (RON)"
            type="number"
            placeholder="e.g. 150"
            min={0}
            value={fixedPriceFrom}
            onChange={(e) => {
              setFixedPriceFrom(e.target.value);
              setErrors((p) => ({ ...p, pricing: undefined }));
            }}
            fullWidth
          />
        </div>
        {errors.pricing && (
          <p className="text-xs text-red-500 mt-1.5">{errors.pricing}</p>
        )}
      </div>

      {/* Location + Experience */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Home City *"
          placeholder="e.g. București"
          value={homeCity}
          onChange={(e) => setHomeCity(e.target.value)}
          error={errors.home_city}
          fullWidth
        />
        <Input
          label="Years of Experience"
          type="number"
          placeholder="e.g. 5"
          min={0}
          max={60}
          value={yearsExperience}
          onChange={(e) => setYearsExperience(e.target.value)}
          fullWidth
        />
      </div>

      {/* Service Radius slider */}
      <div>
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-3">
          Service Radius:{" "}
          <span className="text-brand-600 dark:text-brand-400 font-semibold">
            {serviceRadius} km
          </span>
        </label>
        <input
          type="range"
          min={5}
          max={200}
          step={5}
          value={serviceRadius}
          onChange={(e) => setServiceRadius(Number(e.target.value))}
          className="w-full accent-brand-500 cursor-pointer"
        />
        <div className="flex justify-between text-xs text-zinc-400 mt-1">
          <span>5 km</span>
          <span>200 km</span>
        </div>
      </div>

      {/* Response Time */}
      <div>
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-2">
          Typical Response Time{" "}
          <span className="text-zinc-400 font-normal text-xs">(optional)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {RESPONSE_TIME_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setResponseTime(opt === responseTime ? "" : opt)}
              className={cn(
                "px-3 py-1.5 rounded-xl border text-sm font-medium transition-all",
                responseTime === opt
                  ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300"
                  : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600"
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Bio */}
      <Textarea
        label="Bio *"
        placeholder="Describe your experience, specialties, and what sets you apart. Be specific — clients read this carefully."
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        rows={5}
        error={errors.bio}
        fullWidth
      />

      {/* Portfolio photos */}
      <div>
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-2">
          Portfolio Photos{" "}
          <span className="text-zinc-400 font-normal text-xs">
            (optional, up to {MAX_PORTFOLIO})
          </span>
        </label>

        {totalPhotos > 0 && (
          <div className="flex gap-2 flex-wrap mb-3">
            {keptUrls.map((url) => (
              <div key={url} className="relative">
                <Image
                  src={url}
                  alt="Portfolio photo"
                  width={80}
                  height={80}
                  className="h-20 w-20 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700"
                />
                <button
                  type="button"
                  onClick={() => setKeptUrls((prev) => prev.filter((u) => u !== url))}
                  className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {newPhotos.map((photo, i) => (
              <div key={i} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={URL.createObjectURL(photo)}
                  alt=""
                  className="h-20 w-20 rounded-xl object-cover border border-brand-300 dark:border-brand-700"
                />
                <button
                  type="button"
                  onClick={() => setNewPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                  className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {totalPhotos < MAX_PORTFOLIO && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl p-6 flex flex-col items-center gap-2 text-zinc-400 hover:border-brand-400 hover:text-brand-500 transition-colors"
          >
            <Camera className="h-5 w-5" />
            <span className="text-sm">Add portfolio photos</span>
            <span className="text-xs">{totalPhotos}/{MAX_PORTFOLIO} added</span>
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handlePhotoSelect}
        />
      </div>

      {/* is_active toggle — only on edit page */}
      {showIsActive && (
        <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-700">
          <div>
            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              Profile active
            </p>
            <p className="text-xs text-zinc-400 mt-0.5">
              When off, your profile won't appear in search results
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className={cn(
              "relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
              isActive ? "bg-brand-500" : "bg-zinc-300 dark:bg-zinc-600"
            )}
          >
            <span
              className={cn(
                "inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform",
                isActive ? "translate-x-6" : "translate-x-1"
              )}
            />
          </button>
        </div>
      )}

      <Button type="submit" isLoading={isLoading} fullWidth size="lg">
        {submitLabel}
      </Button>
    </form>
  );
}
