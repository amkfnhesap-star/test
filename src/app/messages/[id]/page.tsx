"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Briefcase,
  Wrench,
  Send,
  ImageIcon,
  X,
  Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  ConversationList,
  type ConversationSummary,
} from "@/components/messages/ConversationList";
import { Avatar } from "@/components/ui/Avatar";
import { cn, formatRelativeTime } from "@/lib/utils";

interface Message {
  id: string;
  created_at: string;
  conversation_id: string;
  sender_id: string;
  body: string | null;
  photo_url: string | null;
  read_at: string | null;
  _pending?: boolean;
}

function dateSeparatorLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const same = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (same(d, today)) return "Today";
  if (same(d, yesterday)) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function shouldShowDateSeparator(prev: Message | undefined, curr: Message): boolean {
  if (!prev) return true;
  const a = new Date(prev.created_at);
  const b = new Date(curr.created_at);
  return (
    a.getFullYear() !== b.getFullYear() ||
    a.getMonth() !== b.getMonth() ||
    a.getDate() !== b.getDate()
  );
}

export default function ConversationPage() {
  const { id: conversationId } = useParams<{ id: string }>();
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Conversations list (sidebar)
  const [convList, setConvList] = useState<ConversationSummary[]>([]);
  const [convListLoading, setConvListLoading] = useState(true);

  // Current conversation
  const currentConv = convList.find((c) => c.id === conversationId) ?? null;

  // Messages
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Compose
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<{ file: File; dataUrl: string } | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace(`/login?redirect=/messages/${conversationId}`);
        return;
      }
      setToken(session.access_token);
      setCurrentUserId(session.user.id);
    });
  }, [router, conversationId]);

  // Fetch conversation list
  useEffect(() => {
    if (!token) return;
    fetch("/api/conversations", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        setConvList(data.conversations ?? []);
        setConvListLoading(false);
      })
      .catch(() => setConvListLoading(false));
  }, [token]);

  // Fetch messages + mark read
  const fetchMessages = useCallback(
    async (tok: string) => {
      const r = await fetch(`/api/conversations/${conversationId}/messages?limit=50`, {
        headers: { Authorization: `Bearer ${tok}` },
      });
      const data = await r.json();
      setMessages(data.messages ?? []);
      setHasMore(data.hasMore ?? false);
      setMessagesLoading(false);
    },
    [conversationId]
  );

  useEffect(() => {
    if (!token) return;
    fetchMessages(token);
    // Fire-and-forget mark as read
    fetch(`/api/conversations/${conversationId}/mark-read`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }, [token, conversationId, fetchMessages]);

  // Scroll to bottom on initial load
  useEffect(() => {
    if (!messagesLoading) {
      bottomRef.current?.scrollIntoView({ behavior: "instant" });
    }
  }, [messagesLoading]);

  // Load older messages
  const loadMore = async () => {
    if (!token || !hasMore || loadingMore) return;
    setLoadingMore(true);
    const oldest = messages[0];
    const r = await fetch(
      `/api/conversations/${conversationId}/messages?limit=50&before=${oldest.id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await r.json();
    setMessages((prev) => [...(data.messages ?? []), ...prev]);
    setHasMore(data.hasMore ?? false);
    setLoadingMore(false);
  };

  // Send message
  const handleSend = async () => {
    if (!token || !currentUserId) return;
    const trimmed = text.trim();
    if (!trimmed && !photoPreview) return;

    setSending(true);
    let photoUrl: string | undefined;

    if (photoPreview) {
      setUploadingPhoto(true);
      const fd = new FormData();
      fd.append("file", photoPreview.file);
      try {
        const r = await fetch("/api/messages/upload-photo", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
        const data = await r.json();
        photoUrl = data.url;
      } catch {
        setSending(false);
        setUploadingPhoto(false);
        return;
      }
      setUploadingPhoto(false);
    }

    // Optimistic insert
    const tempId = `temp-${Date.now()}`;
    const optimistic: Message = {
      id: tempId,
      created_at: new Date().toISOString(),
      conversation_id: conversationId,
      sender_id: currentUserId,
      body: trimmed || null,
      photo_url: photoUrl ?? null,
      read_at: null,
      _pending: true,
    };
    setMessages((prev) => [...prev, optimistic]);
    setText("");
    setPhotoPreview(null);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);

    try {
      const r = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ body: trimmed || undefined, photoUrl }),
      });
      const data = await r.json();
      if (data.message) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...data.message } : m))
        );
        // Update conversation list preview
        setConvList((prev) =>
          prev.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  last_message_at: data.message.created_at,
                  last_message_preview: trimmed || "📷 Photo",
                  last_message_sender_id: currentUserId,
                  unread_count: 0,
                }
              : c
          )
        );
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview({ file, dataUrl: reader.result as string });
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const otherUser = currentConv?.other_user;
  const name = otherUser?.full_name ?? "Conversation";

  const contextHref =
    currentConv?.context_type === "job"
      ? `/jobs/${currentConv.context_job_id}`
      : `/pros/${currentConv?.context_provider_id}`;
  const contextIcon =
    currentConv?.context_type === "job" ? (
      <Briefcase className="h-2.5 w-2.5" />
    ) : (
      <Wrench className="h-2.5 w-2.5" />
    );
  const contextLabel = currentConv?.context_type === "job" ? "Job" : "Provider";

  return (
    <div className="min-h-screen bg-zinc-950 pt-16">
      <div className="max-w-5xl mx-auto flex h-[calc(100vh-64px)]">
        {/* ── Sidebar (desktop only) ─────────────────────────── */}
        <div className="hidden md:flex w-[360px] flex-shrink-0 border-r border-zinc-800 flex-col overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-4 border-b border-zinc-800">
            <Link href="/messages" className="text-zinc-400 hover:text-zinc-200 transition-colors mr-1">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <span className="text-base font-semibold text-white">Messages</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ConversationList
              conversations={convList}
              loading={convListLoading}
              currentUserId={currentUserId ?? ""}
              selectedId={conversationId}
            />
          </div>
        </div>

        {/* ── Thread ─────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Sticky header */}
          <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-sm">
            <Link
              href="/messages"
              className="md:hidden p-1 -ml-1 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>

            <Avatar name={name} src={otherUser?.avatar_url ?? undefined} size="sm" />

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{name}</p>
              {currentConv && (
                <Link
                  href={contextHref}
                  className="inline-flex items-center gap-1 text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {contextIcon}
                  {contextLabel}
                  {currentConv.context_title ? `: ${currentConv.context_title}` : ""}
                </Link>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
            {/* Load more */}
            {hasMore && (
              <div className="text-center mb-4">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="text-xs text-brand-400 hover:text-brand-300 disabled:text-zinc-600 transition-colors"
                >
                  {loadingMore ? "Loading…" : "Load older messages"}
                </button>
              </div>
            )}

            {messagesLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-sm text-zinc-500">No messages yet.</p>
                <p className="text-xs text-zinc-700 mt-1">Say hello!</p>
              </div>
            ) : (
              messages.map((msg, i) => {
                const isMe = msg.sender_id === currentUserId;
                const prev = messages[i - 1];
                const next = messages[i + 1];
                const showSep = shouldShowDateSeparator(prev, msg);
                const sameAsPrev = prev && prev.sender_id === msg.sender_id && !shouldShowDateSeparator(prev, msg);
                const sameAsNext = next && next.sender_id === msg.sender_id && !shouldShowDateSeparator(msg, next);
                const isLastInGroup = !sameAsNext;

                return (
                  <div key={msg.id}>
                    {/* Date separator */}
                    {showSep && (
                      <div className="flex items-center gap-3 my-4">
                        <div className="flex-1 h-px bg-zinc-800" />
                        <span className="text-[10px] text-zinc-600 px-2">
                          {dateSeparatorLabel(msg.created_at)}
                        </span>
                        <div className="flex-1 h-px bg-zinc-800" />
                      </div>
                    )}

                    <div
                      className={cn(
                        "flex items-end gap-2",
                        isMe ? "flex-row-reverse" : "flex-row",
                        sameAsPrev && !showSep ? "mt-0.5" : "mt-3"
                      )}
                    >
                      {/* Avatar — only show for last in group (their messages) */}
                      {!isMe && (
                        <div className="flex-shrink-0 w-7">
                          {isLastInGroup ? (
                            <Avatar
                              name={name}
                              src={otherUser?.avatar_url ?? undefined}
                              size="xs"
                            />
                          ) : null}
                        </div>
                      )}

                      {/* Bubble */}
                      <div
                        className={cn(
                          "max-w-[75%] sm:max-w-[65%]",
                          isMe ? "items-end" : "items-start",
                          "flex flex-col gap-1"
                        )}
                      >
                        {msg.photo_url && (
                          <a
                            href={msg.photo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <Image
                              src={msg.photo_url}
                              alt="Photo"
                              width={320}
                              height={240}
                              className="rounded-2xl max-w-[320px] w-full object-cover border border-zinc-700"
                            />
                          </a>
                        )}
                        {msg.body && (
                          <div
                            className={cn(
                              "px-3.5 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words",
                              isMe
                                ? "bg-brand-600 text-white rounded-br-sm"
                                : "bg-zinc-800 text-zinc-100 rounded-bl-sm",
                              msg._pending && "opacity-60"
                            )}
                          >
                            {msg.body}
                          </div>
                        )}
                        {/* Time — only for last in group */}
                        {isLastInGroup && (
                          <span
                            className={cn(
                              "text-[10px] text-zinc-600 px-1",
                              isMe ? "text-right" : "text-left"
                            )}
                          >
                            {formatRelativeTime(msg.created_at)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* ── Sticky footer / compose ────────────────────────── */}
          <div className="flex-shrink-0 border-t border-zinc-800 px-4 py-3 bg-zinc-950">
            {/* Photo preview */}
            {photoPreview && (
              <div className="relative inline-block mb-2">
                <Image
                  src={photoPreview.dataUrl}
                  alt="Preview"
                  width={80}
                  height={80}
                  className="rounded-xl object-cover border border-zinc-700"
                />
                <button
                  onClick={() => setPhotoPreview(null)}
                  className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-zinc-700 hover:bg-zinc-600 flex items-center justify-center text-white transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            <div className="flex items-end gap-2">
              {/* Photo attach */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-xl text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors flex-shrink-0 mb-0.5"
                disabled={sending}
                aria-label="Attach photo"
              >
                <ImageIcon className="h-4.5 w-4.5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />

              {/* Text input */}
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                }}
                onKeyDown={handleKeyDown}
                placeholder="Type a message…"
                rows={1}
                className="flex-1 resize-none bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-colors overflow-hidden"
                style={{ minHeight: "40px", maxHeight: "120px" }}
                disabled={sending}
              />

              {/* Send */}
              <button
                onClick={handleSend}
                disabled={sending || (!text.trim() && !photoPreview)}
                className={cn(
                  "p-2 rounded-xl flex-shrink-0 transition-all mb-0.5",
                  text.trim() || photoPreview
                    ? "bg-brand-600 hover:bg-brand-500 text-white"
                    : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                )}
                aria-label="Send"
              >
                {sending || uploadingPhoto ? (
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                ) : (
                  <Send className="h-4.5 w-4.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
