import { ShieldCheck, Briefcase, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProviderProfile } from "@/lib/providers";

const RO_MONTHS = [
  "ianuarie",
  "februarie",
  "martie",
  "aprilie",
  "mai",
  "iunie",
  "iulie",
  "august",
  "septembrie",
  "octombrie",
  "noiembrie",
  "decembrie",
];

interface TrustSignalsProps {
  provider: ProviderProfile;
  joinedAt?: string;
  layout?: "inline" | "stacked";
  className?: string;
}

export function TrustSignals({
  provider,
  joinedAt,
  layout = "inline",
  className,
}: TrustSignalsProps) {
  const items: React.ReactNode[] = [];

  if (provider.is_verified) {
    items.push(
      <span
        key="verified"
        className="inline-flex items-center gap-1 bg-brand-50 text-brand-700 border border-brand-200 rounded-full px-2 py-0.5 text-xs font-medium"
      >
        <ShieldCheck className="h-3 w-3" />
        Verificat
      </span>
    );
  }

  if (provider.jobs_completed > 0) {
    items.push(
      <span key="jobs" className="inline-flex items-center gap-1 text-xs text-slate-600">
        <Briefcase className="h-3 w-3 text-slate-400" />
        {provider.jobs_completed} lucrări finalizate
      </span>
    );
  }

  if (joinedAt) {
    const d = new Date(joinedAt);
    const month = RO_MONTHS[d.getMonth()];
    const year = d.getFullYear();
    items.push(
      <span key="joined" className="inline-flex items-center gap-1 text-xs text-slate-600">
        <Calendar className="h-3 w-3 text-slate-400" />
        Membru din {month} {year}
      </span>
    );
  }

  if (items.length === 0) return null;

  if (layout === "stacked") {
    return (
      <div className={cn("flex flex-col gap-1 items-start", className)}>
        {items}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-wrap gap-x-3 gap-y-1 items-center", className)}>
      {items}
    </div>
  );
}
