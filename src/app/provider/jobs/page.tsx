"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Clock, MapPin, CheckCircle2, XCircle, MessageSquare, Calendar } from "lucide-react";
import { bookings } from "@/data/dummy";
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

export default function ProviderJobsPage() {
  const [jobs, setJobs] = useState(bookings);

  const handleAccept = (id: string) => {
    setJobs((prev) => prev.map((j) => j.id === id ? { ...j, status: "accepted" as const } : j));
    toast.success("Job accepted! Customer will be notified.");
  };

  const handleDecline = (id: string) => {
    setJobs((prev) => prev.map((j) => j.id === id ? { ...j, status: "cancelled" as const } : j));
    toast.error("Job declined.");
  };

  const pending = jobs.filter((j) => j.status === "pending");
  const active = jobs.filter((j) => ["accepted", "in_progress"].includes(j.status));
  const past = jobs.filter((j) => ["completed", "cancelled"].includes(j.status));

  const Section = ({ title, items, showActions }: { title: string; items: typeof jobs; showActions?: boolean }) => (
    <div className="space-y-3">
      <h2 className="font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
        {title}
        <span className="text-xs font-normal text-zinc-400">({items.length})</span>
      </h2>
      {items.length === 0 ? (
        <div className="text-center py-8 text-zinc-400 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
          No {title.toLowerCase()} jobs
        </div>
      ) : items.map((job, i) => (
        <motion.div
          key={job.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5"
        >
          <div className="flex items-start gap-4">
            <Image src={job.provider.avatar_url} alt="" width={44} height={44} className="h-11 w-11 rounded-xl object-cover" />
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-zinc-900 dark:text-white text-sm">{job.service_title}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(job.status)}`}>
                  {getStatusLabel(job.status)}
                </span>
              </div>
              {job.notes && <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 italic">"{job.notes}"</p>}
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-zinc-400">
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(job.scheduled_at)}</span>
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.address.split(",")[0]}</span>
                <span className="font-bold text-zinc-900 dark:text-white">{formatCurrency(job.total)}</span>
              </div>
              {showActions && job.status === "pending" && (
                <div className="flex gap-2 mt-3">
                  <button onClick={() => handleAccept(job.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5" />Accept
                  </button>
                  <button onClick={() => handleDecline(job.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium">
                    <XCircle className="h-3.5 w-3.5" />Decline
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-brand-600 dark:text-brand-400 text-xs font-medium hover:bg-brand-50 dark:hover:bg-brand-900/20">
                    <MessageSquare className="h-3.5 w-3.5" />Message
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Job Requests</h1>
      <Section title="Pending Requests" items={pending} showActions />
      <Section title="Active Jobs" items={active} />
      <Section title="Past Jobs" items={past} />
    </div>
  );
}
