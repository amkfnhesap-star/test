"use client";

import Link from "next/link";
import { Briefcase, Wrench, MessageCircle } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { cn, formatRelativeTime } from "@/lib/utils";

export interface ConversationSummary {
  id: string;
  context_type: "job" | "provider";
  context_job_id: string | null;
  context_provider_id: string | null;
  last_message_at: string | null;
  last_message_preview: string | null;
  last_message_sender_id: string | null;
  other_user: { id: string; full_name: string | null; avatar_url: string | null } | null;
  context_title: string | null;
  unread_count: number;
}

interface Props {
  conversations: ConversationSummary[];
  loading: boolean;
  currentUserId: string;
  selectedId?: string;
}

export function ConversationList({ conversations, loading, currentUserId, selectedId }: Props) {
  if (loading) {
    return (
      <div className="flex flex-col gap-px">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="px-4 py-3.5 border-b border-zinc-800/60 animate-pulse"
          >
            <div className="flex gap-3 items-start">
              <div className="h-10 w-10 rounded-full bg-zinc-800 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-zinc-800 rounded w-1/3" />
                <div className="h-3 bg-zinc-800 rounded w-2/3" />
                <div className="h-3 bg-zinc-800 rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="h-14 w-14 rounded-2xl bg-zinc-800 flex items-center justify-center mb-4">
          <MessageCircle className="h-7 w-7 text-zinc-500" />
        </div>
        <p className="text-sm font-medium text-zinc-300 mb-1">No conversations yet</p>
        <p className="text-xs text-zinc-600 max-w-[200px]">
          Click Contact on a job or provider profile to start one.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-zinc-800/60">
      {conversations.map((conv) => {
        const isSelected = conv.id === selectedId;
        const name = conv.other_user?.full_name ?? "Unknown User";
        const avatarSrc = conv.other_user?.avatar_url ?? undefined;
        const iMySentLast = conv.last_message_sender_id === currentUserId;

        const contextIcon = conv.context_type === "job"
          ? <Briefcase className="h-2.5 w-2.5" />
          : <Wrench className="h-2.5 w-2.5" />;
        const contextLabel = conv.context_type === "job" ? "Job" : "Provider";
        const contextHref = conv.context_type === "job"
          ? `/jobs/${conv.context_job_id}`
          : `/pros/${conv.context_provider_id}`;

        return (
          <Link
            key={conv.id}
            href={`/messages/${conv.id}`}
            className={cn(
              "flex items-start gap-3 px-4 py-3.5 transition-colors relative",
              isSelected
                ? "bg-brand-500/10 border-l-2 border-l-brand-500"
                : "hover:bg-zinc-800/40"
            )}
          >
            {/* Avatar */}
            <div className="flex-shrink-0 relative mt-0.5">
              <Avatar name={name} src={avatarSrc} size="md" />
              {conv.unread_count > 0 && (
                <span className="absolute -top-1 -right-1 h-4.5 min-w-[18px] px-1 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
                  {conv.unread_count > 9 ? "9+" : conv.unread_count}
                </span>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Name + time */}
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <span className={cn(
                  "text-sm truncate",
                  conv.unread_count > 0 ? "font-semibold text-white" : "font-medium text-zinc-200"
                )}>
                  {name}
                </span>
                {conv.last_message_at && (
                  <span className="text-[10px] text-zinc-600 flex-shrink-0">
                    {formatRelativeTime(conv.last_message_at)}
                  </span>
                )}
              </div>

              {/* Context chip */}
              <span
                className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500 mb-1 cursor-pointer hover:text-zinc-300 transition-colors"
                onClick={(e) => { e.preventDefault(); window.location.href = contextHref; }}
              >
                {contextIcon}
                {contextLabel}{conv.context_title ? `: ${conv.context_title}` : ""}
              </span>

              {/* Last message */}
              {conv.last_message_preview && (
                <p className={cn(
                  "text-xs truncate",
                  conv.unread_count > 0 ? "text-zinc-300" : "text-zinc-500",
                  iMySentLast && "italic"
                )}>
                  {iMySentLast ? `You: ${conv.last_message_preview}` : conv.last_message_preview}
                </p>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
