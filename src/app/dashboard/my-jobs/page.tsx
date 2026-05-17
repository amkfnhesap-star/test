"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  XCircle,
  RotateCcw,
  MapPin,
  ImageIcon,
  Banknote,
  Clock,
  AlertTriangle,
  ExternalLink,
  Star,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { Button } from "@/components/ui/Button";
import { JobStatusBadge } from "@/components/jobs/JobStatusBadge";
import {
  getMyJobs,
  updateJobStatus,
  deleteJob,
  type Job,
  type JobStatus,
} from "@/lib/jobs";
import { supabase } from "@/lib/supabase";
import { categories } from "@/data/dummy";
import { formatRelativeTime } from "@/lib/utils";
import toast from "react-hot-toast";

function timeframeLabel(t: string) {
  if (t === "asap") return "Urgent";
  if (t === "specific_date") return "Dată specifică";
  return "Flexibil";
}

interface DeleteModal {
  id: string;
  title: string;
}

interface PendingReview {
  job_id: string;
  job_title: string;
  direction: "client_to_provider" | "provider_to_client";
  other_party_id: string | null;
  other_party: { full_name: string; avatar_url: string | null } | null;
  is_client: boolean;
}

export default function MyJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [deleteModal, setDeleteModal] = useState<DeleteModal | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);
  const [reviewModal, setReviewModal] = useState<PendingReview | null>(null);

  useEffect(() => {
    getMyJobs().then(({ jobs, error }) => {
      if (error) {
        toast.error("Nu s-au putut încărca lucrările.");
        setFetchError(true);
      } else {
        setJobs(jobs);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      fetch("/api/reviews/pending-for-me", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
        .then((r) => r.json())
        .then((data) => setPendingReviews(data.pending ?? []))
        .catch(() => {});
    });
  }, []);

  const handleToggleStatus = async (job: Job) => {
    if (job.status !== "open" && job.status !== "cancelled") return;
    const newStatus: JobStatus = job.status === "open" ? "cancelled" : "open";

    setTogglingId(job.id);
    setJobs((prev) =>
      prev.map((j) => (j.id === job.id ? { ...j, status: newStatus } : j))
    );

    const { error } = await updateJobStatus(job.id, newStatus);
    if (error) {
      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, status: job.status } : j))
      );
      toast.error("Eroare la actualizarea statusului.");
    } else {
      toast.success(newStatus === "open" ? "Lucrare redeschisă." : "Lucrare anulată.");
    }
    setTogglingId(null);
  };

  const confirmDelete = async () => {
    if (!deleteModal) return;
    setIsDeleting(true);
    const { error } = await deleteJob(deleteModal.id);
    if (error) {
      toast.error("Eroare la ștergerea lucrării.");
    } else {
      setJobs((prev) => prev.filter((j) => j.id !== deleteModal.id));
      toast.success("Lucrare ștearsă.");
      const deletedId = deleteModal.id;
      const deletedTitle = deleteModal.title;
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session?.access_token) return;
        fetch("/api/log-activity", {
          method: "POST",
          headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            event_type: "job.deleted",
            event_category: "job",
            target_type: "job",
            target_id: deletedId,
            description: `Job deleted: ${deletedTitle}`,
          }),
        }).catch(() => {});
      });
      setDeleteModal(null);
    }
    setIsDeleting(false);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Pending reviews widget */}
        {pendingReviews.length > 0 && (
          <div className="bg-brand-50 border border-brand-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-4 w-4 text-brand-600 fill-brand-600" />
              <h2 className="font-semibold text-brand-900 text-sm">
                Ai {pendingReviews.length}{" "}
                {pendingReviews.length === 1 ? "recenzie de lăsat" : "recenzii de lăsat"}
              </h2>
            </div>
            <div className="space-y-2">
              {pendingReviews.map((p) => (
                <div
                  key={p.job_id}
                  className="flex items-center gap-3 bg-white rounded-xl px-3 py-2.5 border border-brand-100"
                >
                  <Avatar
                    name={p.other_party?.full_name ?? "?"}
                    src={p.other_party?.avatar_url ?? undefined}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-900 truncate">
                      {p.other_party?.full_name ?? (p.is_client ? "Meșterul" : "Clientul")}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{p.job_title}</p>
                  </div>
                  <button
                    onClick={() => setReviewModal(p)}
                    className="flex-shrink-0 text-xs font-medium text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Lasă o recenzie
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              Lucrările mele
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              Lucrările postate de tine — gestionează-le și urmărește-le.
            </p>
          </div>
          <Link href="/jobs/new">
            <Button size="md" leftIcon={<Plus className="h-4 w-4" />}>
              Postează o lucrare
            </Button>
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5 animate-pulse"
              >
                <div className="flex justify-between mb-3">
                  <div className="h-5 bg-zinc-100 dark:bg-zinc-800 rounded w-1/2" />
                  <div className="h-5 bg-zinc-100 dark:bg-zinc-800 rounded w-16" />
                </div>
                <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-1/3 mb-4" />
                <div className="flex gap-2">
                  {[...Array(4)].map((_, j) => (
                    <div
                      key={j}
                      className="h-8 bg-zinc-100 dark:bg-zinc-800 rounded-lg w-16"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : fetchError ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-12 text-center"
          >
            <div className="h-16 w-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-1">
              Eroare la încărcarea lucrărilor
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 max-w-xs mx-auto">
              Nu s-au putut prelua lucrările. Reîncarcă pagina sau încearcă din nou mai târziu.
            </p>
            <Button size="md" variant="secondary" onClick={() => window.location.reload()}>
              Reîncarcă
            </Button>
          </motion.div>
        ) : jobs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-12 text-center"
          >
            <div className="h-16 w-16 rounded-2xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-brand-500" />
            </div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-1">
              Nicio lucrare postată încă
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 max-w-xs mx-auto">
              Postează prima lucrare și lasă profesioniștii să te găsească.
            </p>
            <Link href="/jobs/new">
              <Button size="lg" rightIcon={<Plus className="h-4 w-4" />}>
                Postează prima lucrare
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job, i) => {
              const cat = categories.find((c) => c.slug === job.category);
              const isToggling = togglingId === job.id;
              const canToggle = job.status === "open" || job.status === "cancelled";

              return (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5"
                >
                  {/* Top row: title + status */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      {cat && (
                        <span className="inline-flex items-center gap-1 text-xs text-zinc-400 mb-1">
                          <span>{cat.icon}</span>
                          {cat.name}
                        </span>
                      )}
                      <h3 className="font-semibold text-zinc-900 dark:text-white text-sm leading-snug truncate">
                        {job.title}
                      </h3>
                    </div>
                    <div className="flex-shrink-0">
                      <JobStatusBadge status={job.status} />
                    </div>
                  </div>

                  {/* Awarded provider chip */}
                  {job.status === "awarded" && job.awarded_provider_profile && (
                    <div className="mb-2">
                      <Link
                        href={`/pros/${job.awarded_provider_id}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-500/10 ring-1 ring-violet-500/20 text-violet-400 text-xs font-medium hover:bg-violet-500/15 transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Acordată: {job.awarded_provider_profile.full_name}
                      </Link>
                    </div>
                  )}

                  {/* Meta row */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-400 mb-4">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {job.city}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {timeframeLabel(job.timeframe)}
                    </span>
                    {job.budget && (
                      <span className="flex items-center gap-1">
                        <Banknote className="h-3 w-3" />
                        {job.budget.toLocaleString()} RON
                      </span>
                    )}
                    {job.photo_urls?.length > 0 && (
                      <span className="flex items-center gap-1">
                        <ImageIcon className="h-3 w-3" />
                        {job.photo_urls.length}{" "}
                        {job.photo_urls.length === 1 ? "fotografie" : "fotografii"}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      Postat {formatRelativeTime(job.created_at)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/jobs/${job.id}`}>
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<Eye className="h-3.5 w-3.5" />}
                      >
                        Vezi
                      </Button>
                    </Link>

                    <Link href={`/jobs/${job.id}/edit`}>
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<Pencil className="h-3.5 w-3.5" />}
                      >
                        Editează
                      </Button>
                    </Link>

                    {canToggle && (
                      <Button
                        variant="secondary"
                        size="sm"
                        isLoading={isToggling}
                        leftIcon={
                          job.status === "open" ? (
                            <XCircle className="h-3.5 w-3.5" />
                          ) : (
                            <RotateCcw className="h-3.5 w-3.5" />
                          )
                        }
                        onClick={() => handleToggleStatus(job)}
                      >
                        {job.status === "open" ? "Anulează" : "Redeschide"}
                      </Button>
                    )}

                    <Button
                      variant="danger"
                      size="sm"
                      leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                      onClick={() =>
                        setDeleteModal({ id: job.id, title: job.title })
                      }
                    >
                      Șterge
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review modal */}
      <Modal
        isOpen={!!reviewModal}
        onClose={() => setReviewModal(null)}
        title="Lasă o recenzie"
        size="md"
      >
        {reviewModal && (
          <ReviewForm
            jobId={reviewModal.job_id}
            revieweeId={reviewModal.other_party_id ?? ""}
            revieweeName={
              reviewModal.other_party?.full_name ??
              (reviewModal.is_client ? "Meșterul" : "Clientul")
            }
            direction={reviewModal.direction}
            onSubmitted={() => {
              setReviewModal(null);
              setPendingReviews((prev) =>
                prev.filter((p) => p.job_id !== reviewModal.job_id)
              );
            }}
          />
        )}
      </Modal>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {deleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
            onClick={() => !isDeleting && setDeleteModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.15 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-700 p-6 max-w-sm w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-white text-sm">
                    Șterge această lucrare?
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Această acțiune nu poate fi anulată.
                  </p>
                </div>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-5 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-3 py-2 truncate">
                &ldquo;{deleteModal.title}&rdquo;
              </p>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  size="md"
                  fullWidth
                  onClick={() => setDeleteModal(null)}
                  disabled={isDeleting}
                >
                  Anulează
                </Button>
                <Button
                  variant="danger"
                  size="md"
                  fullWidth
                  isLoading={isDeleting}
                  onClick={confirmDelete}
                >
                  Șterge
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
