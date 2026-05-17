"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import {
  getJobFavoriteStatus,
  getProviderFavoriteStatus,
  toggleJobFavorite,
  toggleProviderFavorite,
} from "@/lib/favorites";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  targetType: "job" | "provider";
  targetId: string;
  className?: string;
  onToggle?: (isFavorited: boolean) => void;
}

export function FavoriteButton({
  targetType,
  targetId,
  className,
  onToggle,
}: FavoriteButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isFavorited, setIsFavorited] = useState(false);
  const [count, setCount] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [pulseKey, setPulseKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (cancelled) return;
        setUserId(session?.user?.id ?? null);

        const { isFavorited: fav, count: cnt } =
          targetType === "job"
            ? await getJobFavoriteStatus(targetId)
            : await getProviderFavoriteStatus(targetId);

        if (cancelled) return;
        setIsFavorited(fav);
        setCount(cnt);
      } finally {
        if (!cancelled) setIsLoaded(true);
      }
    };

    init();
    return () => { cancelled = true; };
  }, [targetId, targetType]);

  const handleClick = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!userId) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      const wasF = isFavorited;
      setIsFavorited(!wasF);
      setCount((c) => (wasF ? Math.max(0, c - 1) : c + 1));
      setPulseKey((k) => k + 1);

      try {
        const { isFavorited: newFav } =
          targetType === "job"
            ? await toggleJobFavorite(targetId)
            : await toggleProviderFavorite(targetId);
        setIsFavorited(newFav);
        onToggle?.(newFav);
      } catch {
        setIsFavorited(wasF);
        setCount((c) => (wasF ? c + 1 : Math.max(0, c - 1)));
      }
    },
    [userId, isFavorited, targetType, targetId, router, pathname, onToggle]
  );

  if (!isLoaded) {
    return (
      <div
        className={cn(
          "w-9 h-7 rounded-lg bg-slate-100 animate-pulse",
          className
        )}
      />
    );
  }

  return (
    <button
      onClick={handleClick}
      title={isFavorited ? "Remove from favorites" : "Save to favorites"}
      className={cn(
        "inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
        "bg-white border shadow-sm",
        isFavorited
          ? "border-red-200 text-red-500 hover:bg-red-50"
          : "border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200",
        className
      )}
    >
      <motion.span
        key={pulseKey}
        initial={pulseKey > 0 ? { scale: 1.5 } : false}
        animate={{ scale: 1 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="flex"
      >
        <Heart
          className={cn(
            "h-3.5 w-3.5 transition-colors duration-200",
            isFavorited ? "fill-red-500 text-red-500" : "text-current"
          )}
        />
      </motion.span>
      {count > 0 && <span>{count}</span>}
    </button>
  );
}
