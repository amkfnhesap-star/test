"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  CheckCircle,
  RotateCcw,
  MapPin,
  ImageIcon,
  Banknote,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  getMyJobs,
  updateJobStatus,
  deleteJob,
  type Job,
  type JobStatus,
} from "@/lib/jobs";
import { categories } from "@/data/dummy";
import { formatRelativeTime } from "@/lib/utils";
import toast from "react-hot-toast";

function StatusBadge({ status }: { status: JobStatus }) {
  if (status === "open") return <Badge variant="success" dot>Open</Badge>;
  if (status === "in_progress") return <Badge variant="info" dot>In Progress</Badge>;
  return <Badge variant="default" dot>Closed</Badge>;
}

function timeframeLabel(t: string) {
  if (t === "asap") return "ASAP";
  if (t === "specific_date") return "Specific Date";
  return "Flexible";
}

interface DeleteModal {
  id: string;
  title: string;
}

export default function MyJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<DeleteModal | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    getMyJobs().then(({ jobs, error }) => {
      if (error) toast.error("Could not load jobs.");
      else setJobs(jobs);
      setLoading(false);
    });
  }, []);

  const handleToggleStatus = async (job: Job) => {
    if (job.status === "in_progress") return;
    const newStatus: JobStatus = job.status === "open" ? "closed" : "open";

    setTogglingId(job.id);
    setJobs((prev) =>
      prev.map((j) => (j.id === job.id ? { ...j, status: newStatus } : j))
    );

    const { error } = await updateJobStatus(job.id, newStatus);
    if (error) {
      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, status: job.status } : j))
      );
      toast.error("Failed to update status.");
    } else {
      toast.success(newStatus === "open" ? "Job reopened!" : "Job closed.");
    }
    setTogglingId(null);
  };

  const confirmDelete = async () => {
    if (!deleteModal) return;
    setIsDeleting(true);
    const { error } = await deleteJob(deleteModal.id);
    if (error) {
      toast.error("Failed to delete job.");
    } else {
      setJobs((prev) => prev.filter((j) => j.id !== deleteModal.id));
      toast.success("Job deleted.");
      setDeleteModal(null);
    }
    setIsDeleting(false);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              My Jobs
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              Jobs you&apos;ve posted — manage and track them here.
            </p>
          </div>
          <Link href="/jobs/new">
            <Button size="md" leftIcon={<Plus className="h-4 w-4" />}>
              Post a Job
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
        ) : jobs.length === 0 ? (
          /* Empty state */
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-12 text-center"
          >
            <div className="h-16 w-16 rounded-2xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-brand-500" />
            </div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-1">
              No jobs posted yet
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 max-w-xs mx-auto">
              Post your first job and let skilled professionals find you.
            </p>
            <Link href="/jobs/new">
              <Button size="lg" rightIcon={<Plus className="h-4 w-4" />}>
                Post your first job
              </Button>
            </Link>
          </motion.div>
        ) : (
          /* Job list */
          <div className="space-y-3">
            {jobs.map((job, i) => {
              const cat = categories.find((c) => c.slug === job.category);
              const isToggling = togglingId === job.id;

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
                      <StatusBadge status={job.status} />
                    </div>
                  </div>

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
                        {job.photo_urls.length} photo
                        {job.photo_urls.length !== 1 ? "s" : ""}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      Posted {formatRelativeTime(job.created_at)}
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
                        View
                      </Button>
                    </Link>

                    <Link href={`/jobs/${job.id}/edit`}>
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<Pencil className="h-3.5 w-3.5" />}
                      >
                        Edit
                      </Button>
                    </Link>

                    {job.status !== "in_progress" && (
                      <Button
                        variant="secondary"
                        size="sm"
                        isLoading={isToggling}
                        leftIcon={
                          job.status === "open" ? (
                            <CheckCircle className="h-3.5 w-3.5" />
                          ) : (
                            <RotateCcw className="h-3.5 w-3.5" />
                          )
                        }
                        onClick={() => handleToggleStatus(job)}
                      >
                        {job.status === "open" ? "Close Job" : "Reopen"}
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
                      Delete
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

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
                    Delete this job?
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    This cannot be undone.
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
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  size="md"
                  fullWidth
                  isLoading={isDeleting}
                  onClick={confirmDelete}
                >
                  Delete
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
