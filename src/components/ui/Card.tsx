"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
  onClick?: () => void;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddings = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export function Card({
  children,
  className,
  hover,
  glass,
  onClick,
  padding = "md",
}: CardProps) {
  const base = cn(
    "rounded-2xl border transition-all duration-300",
    glass
      ? "bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border-white/20 dark:border-white/10"
      : "bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800",
    hover &&
      "hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer",
    onClick && "cursor-pointer",
    paddings[padding],
    className
  );

  if (hover || onClick) {
    return (
      <motion.div
        className={base}
        onClick={onClick}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    );
  }

  return <div className={base}>{children}</div>;
}

export function CardHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-4", className)}>{children}</div>
  );
}

export function CardTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3 className={cn("text-lg font-semibold text-zinc-900 dark:text-white", className)}>
      {children}
    </h3>
  );
}

export function CardBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("", className)}>{children}</div>;
}
