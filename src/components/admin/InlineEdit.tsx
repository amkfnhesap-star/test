"use client";

import { useState, useRef, useEffect } from "react";

interface InlineEditProps {
  value: string | number | null;
  onSave: (val: string) => Promise<void>;
  type?: "text" | "number";
  formatter?: (val: string | number | null) => string;
  className?: string;
}

export function InlineEdit({
  value,
  onSave,
  type = "text",
  formatter,
  className = "",
}: InlineEditProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const display = formatter
    ? formatter(value)
    : value !== null && value !== undefined
    ? String(value)
    : "—";

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const startEdit = () => {
    setDraft(value !== null && value !== undefined ? String(value) : "");
    setEditing(true);
  };

  const commit = async () => {
    setSaving(true);
    try {
      await onSave(draft);
    } finally {
      setSaving(false);
      setEditing(false);
    }
  };

  const cancel = () => {
    setEditing(false);
    setDraft("");
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        type={type}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "Escape") cancel();
        }}
        disabled={saving}
        className={`bg-zinc-800 border border-brand-500 rounded px-2 py-0.5 text-sm text-white focus:outline-none w-full min-w-0 ${className}`}
      />
    );
  }

  return (
    <span
      onClick={startEdit}
      title="Click to edit"
      className={`cursor-text rounded px-1 py-0.5 hover:bg-zinc-800 transition-colors select-none ${
        saving ? "opacity-40" : ""
      } ${className}`}
    >
      {display}
    </span>
  );
}
