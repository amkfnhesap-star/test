import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-3",
};

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "rounded-full border-zinc-200 dark:border-zinc-700 border-t-brand-500 animate-spin",
        sizes[size],
        className
      )}
    />
  );
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-zinc-100 dark:border-zinc-800 border-t-brand-500 animate-spin" />
          <div className="absolute inset-2 rounded-full border-4 border-zinc-100 dark:border-zinc-800 border-b-violet-500 animate-spin [animation-direction:reverse] [animation-duration:600ms]" />
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4 animate-pulse">
      <div className="flex gap-3">
        <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg w-3/4" />
          <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
        <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg w-5/6" />
      </div>
      <div className="h-8 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
    </div>
  );
}
