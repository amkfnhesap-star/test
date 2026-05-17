const config: Record<string, { label: string; classes: string }> = {
  open: {
    label: "Deschisă",
    classes: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
  },
  awarded: {
    label: "Acordată",
    classes: "bg-brand-100 text-brand-700 ring-1 ring-brand-200",
  },
  pending_completion: {
    label: "În așteptare confirmare",
    classes: "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
  },
  completed: {
    label: "Finalizată",
    classes: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
  },
  cancelled: {
    label: "Anulată",
    classes: "bg-red-100 text-red-700 ring-1 ring-red-200",
  },
};

export function JobStatusBadge({ status }: { status: string }) {
  const c = config[status] ?? {
    label: status,
    classes: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${c.classes}`}>
      {c.label}
    </span>
  );
}
