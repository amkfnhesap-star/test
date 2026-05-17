"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Camera, X, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { supabase } from "@/lib/supabase";
import { getJob, updateJob, uploadJobPhoto } from "@/lib/jobs";
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

export default function EditJobPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [pageLoading, setPageLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [budget, setBudget] = useState("");
  const [timeframe, setTimeframe] = useState<Timeframe>("flexible");
  const [scheduledDate, setScheduledDate] = useState("");

  // Photos: existing (URLs already in DB) + new (File objects to upload)
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});

  const totalPhotos = existingPhotos.length + newPhotos.length;

  useEffect(() => {
    if (!id) return;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.replace(`/login?redirect=/jobs/${id}/edit`);
        return;
      }

      const { job, error } = await getJob(id);

      if (error || !job) {
        toast.error("Lucrarea nu a fost găsită.");
        router.replace("/dashboard/my-jobs");
        return;
      }

      if (job.client_id !== session.user.id) {
        toast.error("Nu ai permisiunea de a edita această lucrare.");
        router.replace(`/jobs/${id}`);
        return;
      }

      // Pre-fill form
      setTitle(job.title);
      setCategory(job.category);
      setDescription(job.description);
      setCity(job.city);
      setBudget(job.budget ? String(job.budget) : "");
      setTimeframe(job.timeframe);
      setScheduledDate(job.scheduled_date ?? "");
      setExistingPhotos(job.photo_urls ?? []);
      setPageLoading(false);
    });
  }, [id, router]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setNewPhotos((prev) => [...prev, ...files].slice(0, 5 - existingPhotos.length));
    e.target.value = "";
  };

  const removeExistingPhoto = (url: string) =>
    setExistingPhotos((prev) => prev.filter((u) => u !== url));

  const removeNewPhoto = (i: number) =>
    setNewPhotos((prev) => prev.filter((_, idx) => idx !== i));

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (title.trim().length < 5) errs.title = "Titlul trebuie să aibă cel puțin 5 caractere.";
    if (!category) errs.category = "Te rugăm să selectezi o categorie.";
    if (description.trim().length < 20)
      errs.description = "Descrierea trebuie să aibă cel puțin 20 de caractere.";
    if (!city.trim()) errs.city = "Orașul este obligatoriu.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    // Upload any new photos
    const uploadedUrls: string[] = [];
    for (let i = 0; i < newPhotos.length; i++) {
      const url = await uploadJobPhoto(id, newPhotos[i], existingPhotos.length + i);
      if (url) uploadedUrls.push(url);
    }

    const { error } = await updateJob(id, {
      title: title.trim(),
      category,
      description: description.trim(),
      city: city.trim(),
      budget: budget ? Number(budget) : null,
      timeframe,
      scheduled_date: timeframe === "specific_date" ? scheduledDate || null : null,
      photo_urls: [...existingPhotos, ...uploadedUrls],
    });

    if (error) {
      toast.error(error);
      setIsSubmitting(false);
      return;
    }

    // Fire-and-forget job update log
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.access_token) return;
      fetch("/api/log-activity", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          event_type: "job.updated",
          event_category: "job",
          target_type: "job",
          target_id: id,
          description: `Job updated: ${title.trim()}`,
          metadata: { changes: { title: title.trim(), category, city: city.trim(), budget: budget ? Number(budget) : null, timeframe } },
        }),
      }).catch(() => {});
    });

    toast.success("Lucrarea a fost actualizată!");
    router.push(`/jobs/${id}`);
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Back */}
        <Link
          href="/dashboard/my-jobs"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Înapoi la lucrările mele
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-900">Editează lucrarea</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Actualizează detaliile lucrării de mai jos.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          onSubmit={handleSubmit}
          className="space-y-6 bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm"
        >
          {/* Title */}
          <Input
            label="Titlul lucrării *"
            placeholder='ex. "Am nevoie de instalator"'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={errors.title}
            fullWidth
          />

          {/* Category */}
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">
              Categorie <span className="text-red-500">*</span>
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
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  )}
                >
                  <span className="text-base leading-none">{cat.icon}</span>
                  <span className="truncate">{cat.name}</span>
                </button>
              ))}
            </div>
            {errors.category && (
              <p className="text-xs text-red-600 mt-1.5">{errors.category}</p>
            )}
          </div>

          {/* Description */}
          <Textarea
            label="Descriere *"
            placeholder="Descrie lucrarea în detaliu."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            error={errors.description}
            fullWidth
          />

          {/* City + Budget */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Oraș *"
              placeholder="ex. București, Cluj-Napoca"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              error={errors.city}
              fullWidth
            />
            <Input
              label="Buget (RON, opțional)"
              type="number"
              placeholder="ex. 500"
              min={0}
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              fullWidth
            />
          </div>

          {/* Timeframe */}
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">
              Când ai nevoie?
            </label>
            <div className="flex gap-2 flex-wrap">
              {(
                [
                  { value: "asap", label: "Urgent" },
                  { value: "specific_date", label: "Dată specifică" },
                  { value: "flexible", label: "Flexibil" },
                ] as { value: Timeframe; label: string }[]
              ).map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTimeframe(value)}
                  className={cn(
                    "px-4 py-2 rounded-xl border text-sm font-medium transition-all",
                    timeframe === value
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
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
                className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
              />
            )}
          </div>

          {/* Photos */}
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">
              Fotografii{" "}
              <span className="text-slate-400 font-normal">
                (opțional, maxim 5 total)
              </span>
            </label>

            {/* Existing photos */}
            {(existingPhotos.length > 0 || newPhotos.length > 0) && (
              <div className="flex gap-2 flex-wrap mb-3">
                {existingPhotos.map((url) => (
                  <div key={url} className="relative">
                    <Image
                      src={url}
                      alt="Job photo"
                      width={80}
                      height={80}
                      className="h-20 w-20 rounded-xl object-cover border border-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingPhoto(url)}
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
                      className="h-20 w-20 rounded-xl object-cover border border-brand-300"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewPhoto(i)}
                      className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {totalPhotos < 5 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center gap-2 text-slate-400 hover:border-brand-400 hover:text-brand-500 transition-colors bg-slate-50"
              >
                <Camera className="h-5 w-5" />
                <span className="text-sm">Adaugă mai multe fotografii</span>
                <span className="text-xs text-slate-400">
                  {totalPhotos}/5 adăugate
                </span>
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

          <div className="flex gap-3">
            <Link href="/dashboard/my-jobs" className="flex-1">
              <Button variant="secondary" fullWidth size="lg">
                Anulează
              </Button>
            </Link>
            <Button
              type="submit"
              isLoading={isSubmitting}
              fullWidth
              size="lg"
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Salvează modificările
            </Button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
