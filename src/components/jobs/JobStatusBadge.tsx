const config: Record<string, { label: string; classes: string }> = {
  open: {
    label: "Deschisă",
    classes: "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20",
  },
  awarded: {
    label: "Acordată",
    classes: "bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/20",
  },
  pending_completion: {
    label: "În așteptare confirmare",
    classes: "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20",
  },
  completed: {
    label: "Finalizată",
    classes: "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20",
  },
  cancelled: {
    label: "Anulată",
    classes: "bg-red-500/10 text-red-400 ring-1 ring-red-500/20",
  },
};

export function JobStatusBadge({ status }: { status: string }) {
  const c = config[status] ?? {
    label: status,
    classes: "bg-zinc-500/10 text-zinc-400 ring-1 ring-zinc-500/20",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${c.classes}`}>
      {c.label}
    </span>
  );
}
