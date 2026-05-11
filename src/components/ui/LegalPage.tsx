"use client";

import { Printer } from "lucide-react";
import { cn } from "@/lib/utils";

export type Lang = "en" | "ro";

interface TocItem {
  id: string;
  label: string;
}

interface LegalPageProps {
  lang: Lang;
  setLang: (l: Lang) => void;
  title: string;
  lastUpdated: string;
  contact: string;
  toc: TocItem[];
  children: React.ReactNode;
}

export function LegalPage({
  lang,
  setLang,
  title,
  lastUpdated,
  contact,
  toc,
  children,
}: LegalPageProps) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Controls */}
        <div className="flex items-center justify-between mb-8 print:hidden">
          <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl p-1">
            {(["en", "ro"] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                  lang === l
                    ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                )}
              >
                {l === "en" ? "English" : "Română"}
              </button>
            ))}
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 transition-all"
          >
            <Printer className="h-4 w-4" />
            {lang === "en" ? "Print" : "Tipărire"}
          </button>
        </div>

        {/* Document card */}
        <article className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden print:border-0 print:rounded-none">
          {/* Doc header */}
          <div className="bg-zinc-50 dark:bg-zinc-800/40 border-b border-zinc-100 dark:border-zinc-800 px-8 sm:px-12 py-8">
            <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-widest mb-2">
              {lang === "en" ? "Last updated" : "Ultima actualizare"}: {lastUpdated}
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white leading-tight">
              {title}
            </h1>
          </div>

          {/* Table of contents */}
          <nav
            aria-label={lang === "en" ? "Table of contents" : "Cuprins"}
            className="px-8 sm:px-12 py-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20 print:hidden"
          >
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-3">
              {lang === "en" ? "Contents" : "Cuprins"}
            </p>
            <ol className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
              {toc.map((item, i) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="text-sm text-brand-500 hover:text-brand-400 hover:underline transition-colors"
                  >
                    {i + 1}. {item.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {/* Sections */}
          <div className="px-8 sm:px-12 py-10 space-y-10">{children}</div>

          {/* Doc footer */}
          <div className="bg-zinc-50 dark:bg-zinc-800/40 border-t border-zinc-100 dark:border-zinc-800 px-8 sm:px-12 py-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              <span>
                {lang === "en" ? "Questions?" : "Întrebări?"}{" "}
                <a
                  href={`mailto:${contact}`}
                  className="text-brand-500 hover:underline font-medium"
                >
                  {contact}
                </a>
              </span>
              <span className="text-xs text-zinc-400">
                {lang === "en" ? "Last reviewed" : "Ultima revizuire"}: {lastUpdated}
              </span>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

interface DocSectionProps {
  id: string;
  heading: string;
  paragraphs: string[];
}

export function DocSection({ id, heading, paragraphs }: DocSectionProps) {
  return (
    <section id={id} className="scroll-mt-28">
      <h2 className="text-base font-semibold text-zinc-900 dark:text-white mb-4 pb-2.5 border-b border-zinc-100 dark:border-zinc-800">
        {heading}
      </h2>
      <div className="space-y-3.5">
        {paragraphs.map((p, i) => (
          <p key={i} className="text-zinc-600 dark:text-zinc-300 text-sm leading-7">
            {p}
          </p>
        ))}
      </div>
    </section>
  );
}
