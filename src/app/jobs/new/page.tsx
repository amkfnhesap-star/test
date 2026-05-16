"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Camera, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { supabase } from "@/lib/supabase";
import { createJob, uploadJobPhoto } from "@/lib/jobs";
import { categories } from "@/data/dummy";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

type Timeframe = "asap" | "specific_date" | "flexible";

interface FormErrors {
  title?: string;
  category?: string;
  description?: string;
  city?: string;
}

export default function PostJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [budget, setBudget] = useState("");
  const [timeframe, setTimeframe] = useState<Timeframe>("flexible");
  const [scheduledDate, setScheduledDate] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/login?redirect=/jobs/new");
      } else {
        setLoading(false);
      }
    });
  }, [router]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setPhotos((prev) => [...prev, ...files].slice(0, 5));
    e.target.value = "";
  };

  const removePhoto = (i: number) =>
    setPhotos((prev) => prev.filter((_, idx) => idx !== i));

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (title.trim().length < 5) errs.title = "Title must be at least 5 characters.";
    if (!category) errs.category = "Please select a category.";
    if (description.trim().length < 20)
      errs.description = "Description must be at least 20 characters.";
    if (!city.trim()) errs.city = "City is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    const { job, error } = await createJob({
      title: title.trim(),
      category,
      description: description.trim(),
      city: city.trim(),
      budget: budget ? Number(budget) : null,
      timeframe,
      scheduled_date: timeframe === "specific_date" ? scheduledDate || null : null,
      photo_urls: [],
    });

    if (error || !job) {
      toast.error(error ?? "Failed to post job. Please try again.");
      setIsSubmitting(false);
      return;
    }

    if (photos.length > 0) {
      const urls: string[] = [];
      for (let i = 0; i < photos.length; i++) {
        const url = await uploadJobPhoto(job.id, photos[i], i);
        if (url) urls.push(url);
      }
      if (urls.length > 0) {
        await supabase.from("jobs").update({ photo_urls: urls }).eq("id", job.id);
      }
    }

    // Fire-and-forget job creation log
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.access_token) return;
      fetch("/api/log-activity", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          event_type: "job.created",
          event_category: "job",
          target_type: "job",
          target_id: job.id,
          description: `Job posted: ${title.trim()}`,
          metadata: { category, city: city.trim(), budget: budget ? Number(budget) : null, timeframe },
        }),
      }).catch(() => {});
    });

    toast.success("Job posted!");
    router.push(`/jobs/${job.id}`);
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Post a Job</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm">
            Describe what you need — pros in your area will reach out.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          onSubmit={handleSubmit}
          className="space-y-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6 md:p-8"
        >
          {/* Title */}
          <Input
            label='Job Title *'
            placeholder='e.g. "Need plumber for leaky tap"'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={errors.title}
            fullWidth
          />

          {/* Category */}
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setCategory(cat.slug);
                    setErrors((p) => ({ ...p, category: undefined }));
                  }}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium text-left transition-all",
                    category === cat.slug
                      ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300"
                      : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600"
                  )}
                >
                  <span className="text-base leading-none">{cat.icon}</span>
                  <span className="truncate">{cat.name}</span>
                </button>
              ))}
            </div>
            {errors.category && (
              <p className="text-xs text-red-500 mt-1.5">{errors.category}</p>
            )}
          </div>

          {/* Description */}
          <Textarea
            label="Description *"
            placeholder="Describe the job — what needs to be done, any specific requirements, access details, etc."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            error={errors.description}
            fullWidth
          />

          {/* City + Budget */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="City *"
              placeholder="e.g. București, Cluj-Napoca"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              error={errors.city}
              fullWidth
            />
            <Input
              label="Budget (RON, optional)"
              type="number"
              placeholder="e.g. 500"
              min={0}
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              fullWidth
            />
          </div>

          {/* Timeframe */}
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-2">
              When do you need it?
            </label>
            <div className="flex gap-2 flex-wrap">
              {(
                [
                  { value: "asap", label: "ASAP" },
                  { value: "specific_date", label: "Specific Date" },
                  { value: "flexible", label: "Flexible" },
                ] as { value: Timeframe; label: string }[]
              ).map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTimeframe(value)}
                  className={cn(
                    "px-4 py-2 rounded-xl border text-sm font-medium transition-all",
                    timeframe === value
                      ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300"
                      : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            {timeframe === "specific_date" && (
              <input
                type="date"
                value={scheduledDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="mt-3 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm text-zinc-900 dark:text-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
              />
            )}
          </div>

          {/* Photos */}
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-2">
              Photos{" "}
              <span className="text-zinc-400 font-normal">(optional, up to 5)</span>
            </label>
            {photos.length < 5 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl p-8 flex flex-col items-center gap-2 text-zinc-400 hover:border-brand-400 hover:text-brand-500 transition-colors"
              >
                <Camera className="h-6 w-6" />
                <span className="text-sm">Click to add photos</span>
                <span className="text-xs text-zinc-400">{photos.length}/5 added</span>
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
            {photos.length > 0 && (
              <div className="mt-3 flex gap-2 flex-wrap">
                {photos.map((photo, i) => (
                  <div key={i} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={URL.createObjectURL(photo)}
                      alt=""
                      className="h-20 w-20 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            type="submit"
            isLoading={isSubmitting}
            fullWidth
            size="lg"
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            Post Job
          </Button>
        </motion.form>
      </div>
    </div>
  );
}
