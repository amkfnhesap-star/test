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
  Trophy,
  Check,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  ConversationList,
  type ConversationSummary,
} from "@/components/messages/ConversationList";
import { Avatar } from "@/components/ui/Avatar";
import { cn, formatRelativeTime } from "@/lib/utils";
import toast from "react-hot-toast";

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

interface JobContext {
  id: string;
  client_id: string;
  title: string;
  status: string;
  awarded_provider_id: string | null;
  completion_requested_by: string | null;
  completion_requested_at: string | null;
  completion_note: string | null;
  completed_at: string | null;
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

  if (same(d, today)) return "Azi";
  if (same(d, yesterday)) return "Ieri";
  return d.toLocaleDateString("ro-RO", { month: "short", day: "numeric", year: "numeric" });
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

  const [convList, setConvList] = useState<ConversationSummary[]>([]);
  const [convListLoading, setConvListLoading] = useState(true);

  const currentConv = convList.find((c) => c.id === conversationId) ?? null;

  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<{ file: File; dataUrl: string } | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Job award / completion state
  const [jobCtx, setJobCtx] = useState<JobContext | null>(null);
  const [otherUserIsProvider, setOtherUserIsProvider] = useState(false);

  // Modal states
  const [awardModalOpen, setAwardModalOpen] = useState(false);
  const [unawardModalOpen, setUnawardModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [completeNote, setCompleteNote] = useState("");
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");

  // Loading state shared across all job actions
  const [jobActionLoading, setJobActionLoading] = useState(false);

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

  // Fetch job context
  useEffect(() => {
    if (!currentConv || currentConv.context_type !== "job" || !currentConv.context_job_id) return;
    supabase
      .from("jobs")
      .select("id, client_id, title, status, awarded_provider_id, completion_requested_by, completion_requested_at, completion_note, completed_at")
      .eq("id", currentConv.context_job_id)
      .single()
      .then(({ data }) => {
        if (data) setJobCtx(data as JobContext);
      });
  }, [currentConv?.context_job_id, currentConv?.context_type]);

  // Check if other user has a provider profile
  useEffect(() => {
    const otherId = currentConv?.other_user?.id;
    if (!otherId) return;
    supabase
      .from("provider_profiles")
      .select("user_id")
      .eq("user_id", otherId)
      .maybeSingle()
      .then(({ data }) => setOtherUserIsProvider(!!data));
  }, [currentConv?.other_user?.id]);

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
    fetch(`/api/conversations/${conversationId}/mark-read`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }, [token, conversationId, fetchMessages]);

  useEffect(() => {
    if (!messagesLoading) {
      bottomRef.current?.scrollIntoView({ behavior: "instant" });
    }
  }, [messagesLoading]);

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
        setConvList((prev) =>
          prev.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  last_message_at: data.message.created_at,
                  last_message_preview: trimmed || "📷 Fotografie",
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

  // ── Job action helpers ───────────────────────────────────────────────────────

  async function postJobAction(path: string, body?: Record<string, unknown>): Promise<boolean> {
    if (!token || !jobCtx) return false;
    setJobActionLoading(true);
    try {
      const r = await fetch(`/api/jobs/${jobCtx.id}/${path}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          ...(body ? { "Content-Type": "application/json" } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      const data = await r.json();
      if (!data.ok) {
        toast.error(data.error ?? "A apărut o eroare.");
        return false;
      }
      return true;
    } catch {
      toast.error("A apărut o eroare.");
      return false;
    } finally {
      setJobActionLoading(false);
    }
  }

  const handleAward = async () => {
    if (!currentConv?.other_user?.id) return;
    const ok = await postJobAction("award", { provider_id: currentConv.other_user.id });
    if (ok) {
      setJobCtx((p) => p ? { ...p, status: "awarded", awarded_provider_id: currentConv.other_user!.id } : p);
      setAwardModalOpen(false);
      toast.success("Lucrare acordată!");
    }
  };

  const handleUnaward = async () => {
    const ok = await postJobAction("unaward");
    if (ok) {
      setJobCtx((p) => p ? { ...p, status: "open", awarded_provider_id: null } : p);
      setUnawardModalOpen(false);
      toast.success("Acordare anulată.");
    }
  };

  const handleRequestCompletion = async () => {
    const ok = await postJobAction("request-completion", completeNote.trim() ? { note: completeNote.trim() } : {});
    if (ok) {
      setJobCtx((p) =>
        p ? {
          ...p,
          status: "pending_completion",
          completion_requested_by: currentUserId,
          completion_requested_at: new Date().toISOString(),
          completion_note: completeNote.trim() || null,
        } : p
      );
      setCompleteModalOpen(false);
      setCompleteNote("");
      toast.success("Cerere de finalizare trimisă.");
    }
  };

  const handleConfirmCompletion = async () => {
    const ok = await postJobAction("confirm-completion");
    if (ok) {
      setJobCtx((p) => p ? { ...p, status: "completed", completed_at: new Date().toISOString() } : p);
      setConfirmModalOpen(false);
      toast.success("Lucrare finalizată cu succes!");
    }
  };

  const handleDisputeCompletion = async () => {
    const ok = await postJobAction("dispute-completion", disputeReason.trim() ? { reason: disputeReason.trim() } : {});
    if (ok) {
      setJobCtx((p) =>
        p ? {
          ...p,
          status: "awarded",
          completion_requested_by: null,
          completion_requested_at: null,
          completion_note: null,
        } : p
      );
      setDisputeModalOpen(false);
      setDisputeReason("");
      toast.success("Contestație trimisă. Lucrarea a revenit la starea «Acordată».");
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const otherUser = currentConv?.other_user;
  const otherId = otherUser?.id ?? null;
  const name = otherUser?.full_name ?? "Conversație";

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
  const contextLabel = currentConv?.context_type === "job" ? "Job" : "Meșter";

  // Derived role flags
  const iAmClient = jobCtx ? currentUserId === jobCtx.client_id : false;
  const iAmAwardedProvider = jobCtx ? currentUserId === jobCtx.awarded_provider_id : false;
  const otherIsAwardedProvider = jobCtx ? otherId === jobCtx.awarded_provider_id : false;
  const otherIsClient = jobCtx ? otherId === jobCtx.client_id : false;

  // This conversation is between the actual client and the awarded provider
  const isJobParticipantConv =
    (iAmClient && otherIsAwardedProvider) || (iAmAwardedProvider && otherIsClient);

  // Award button: only when job is open, I'm the client, other user is a provider
  const showAwardButton =
    !!jobCtx &&
    iAmClient &&
    jobCtx.status === "open" &&
    !jobCtx.awarded_provider_id &&
    otherUserIsProvider;

  // Awarded to a completely different provider (not in this conversation)
  const isAwardedToOther =
    !!jobCtx &&
    jobCtx.status === "awarded" &&
    !!jobCtx.awarded_provider_id &&
    !isJobParticipantConv;

  // Who requested completion?
  const iAmRequester = !!jobCtx?.completion_requested_by && jobCtx.completion_requested_by === currentUserId;
  const iAmConfirmer = !!jobCtx?.completion_requested_by && jobCtx.completion_requested_by !== currentUserId && isJobParticipantConv;

  return (
    <div className="min-h-screen bg-zinc-950 pt-16">
      <div className="max-w-5xl mx-auto flex h-[calc(100vh-64px)]">
        {/* ── Sidebar ─────────────────────────────────────────── */}
        <div className="hidden md:flex w-[360px] flex-shrink-0 border-r border-zinc-800 flex-col overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-4 border-b border-zinc-800">
            <Link href="/messages" className="text-zinc-400 hover:text-zinc-200 transition-colors mr-1">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <span className="text-base font-semibold text-white">Mesaje</span>
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

        {/* ── Thread ──────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Sticky header */}
          <div className="flex-shrink-0 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-sm">
            {/* Main row */}
            <div className="flex items-center gap-3 px-4 py-3">
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

              {/* Award button (only when job is open) */}
              {showAwardButton && (
                <button
                  onClick={() => setAwardModalOpen(true)}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-colors"
                >
                  <Trophy className="h-3.5 w-3.5" />
                  Acordă lucrarea
                </button>
              )}
            </div>

            {/* ── Status banners ───────────────────────────────── */}

            {/* This conversation is between client and awarded provider */}
            {isJobParticipantConv && (
              <div className="px-4 pb-2.5 space-y-1.5">

                {/* AWARDED */}
                {jobCtx!.status === "awarded" && (
                  <>
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-violet-500/10 ring-1 ring-violet-500/20 text-violet-400 text-xs font-medium">
                      <Check className="h-3 w-3 flex-shrink-0" />
                      <span className="flex-1">
                        {iAmClient
                          ? "Lucrarea este acordată acestui meșter"
                          : "Ai primit această lucrare"}
                      </span>
                      {iAmClient && (
                        <button
                          onClick={() => setUnawardModalOpen(true)}
                          className="text-violet-500 hover:text-violet-300 underline transition-colors ml-2 flex-shrink-0"
                        >
                          Anulează acordarea
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => setCompleteModalOpen(true)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors w-full"
                    >
                      <CheckCircle2 className="h-3 w-3 flex-shrink-0 text-zinc-400" />
                      Marchează ca finalizată
                    </button>
                  </>
                )}

                {/* PENDING COMPLETION */}
                {jobCtx!.status === "pending_completion" && (
                  <>
                    {iAmRequester ? (
                      <div className="px-2.5 py-2 rounded-xl bg-amber-500/10 ring-1 ring-amber-500/20 text-amber-400 text-xs">
                        <div className="flex items-center gap-1.5 font-medium mb-0.5">
                          <Loader2 className="h-3 w-3 flex-shrink-0" />
                          Aștepți confirmarea celeilalte părți
                        </div>
                        {jobCtx!.completion_requested_at && (
                          <div className="text-amber-500/70 pl-4.5">
                            Marcată {formatRelativeTime(jobCtx!.completion_requested_at)} de tine
                          </div>
                        )}
                      </div>
                    ) : iAmConfirmer ? (
                      <div className="space-y-1.5">
                        <div className="px-2.5 py-2 rounded-xl bg-amber-500/10 ring-1 ring-amber-500/20 text-amber-400 text-xs font-medium flex items-center gap-1.5">
                          <AlertCircle className="h-3 w-3 flex-shrink-0" />
                          Cealaltă parte a marcat lucrarea ca finalizată. Confirmi?
                        </div>
                        {jobCtx!.completion_note && (
                          <div className="px-2.5 py-1.5 rounded-lg bg-zinc-800/60 text-zinc-400 text-xs">
                            <span className="text-zinc-500">Notă de la cealaltă parte: </span>
                            &laquo;{jobCtx!.completion_note}&raquo;
                          </div>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() => setConfirmModalOpen(true)}
                            className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            Confirmă finalizarea
                          </button>
                          <button
                            onClick={() => setDisputeModalOpen(true)}
                            className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-xs font-medium transition-colors"
                          >
                            <X className="h-3 w-3" />
                            Contestă
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </>
                )}

                {/* COMPLETED */}
                {jobCtx!.status === "completed" && (
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/20 text-emerald-400 text-xs font-medium">
                    <Check className="h-3 w-3 flex-shrink-0" />
                    Lucrare finalizată cu succes
                    {jobCtx!.completed_at && (
                      <span className="text-emerald-500/70 font-normal">
                        pe{" "}
                        {new Date(jobCtx!.completed_at).toLocaleDateString("ro-RO", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                )}

                {/* CANCELLED */}
                {jobCtx!.status === "cancelled" && (
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-zinc-800/60 ring-1 ring-zinc-700 text-zinc-500 text-xs">
                    <AlertCircle className="h-3 w-3 flex-shrink-0" />
                    Lucrarea a fost anulată
                  </div>
                )}
              </div>
            )}

            {/* Awarded to a different provider (not in this conversation) */}
            {isAwardedToOther && (
              <div className="px-4 pb-2.5">
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-zinc-800/60 ring-1 ring-zinc-700 text-zinc-500 text-xs">
                  <AlertCircle className="h-3 w-3 flex-shrink-0" />
                  Această lucrare a fost acordată altui meșter
                </div>
              </div>
            )}

            {/* Cancelled banner for non-participants */}
            {jobCtx && jobCtx.status === "cancelled" && !isJobParticipantConv && iAmClient && (
              <div className="px-4 pb-2.5">
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-zinc-800/60 ring-1 ring-zinc-700 text-zinc-500 text-xs">
                  <AlertCircle className="h-3 w-3 flex-shrink-0" />
                  Lucrarea a fost anulată
                </div>
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
            {hasMore && (
              <div className="text-center mb-4">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="text-xs text-brand-400 hover:text-brand-300 disabled:text-zinc-600 transition-colors"
                >
                  {loadingMore ? "Se încarcă…" : "Încarcă mesaje mai vechi"}
                </button>
              </div>
            )}

            {messagesLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-sm text-zinc-500">Niciun mesaj încă.</p>
                <p className="text-xs text-zinc-700 mt-1">Spune salut!</p>
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
                      {!isMe && (
                        <div className="flex-shrink-0 w-7">
                          {isLastInGroup ? (
                            <Avatar name={name} src={otherUser?.avatar_url ?? undefined} size="xs" />
                          ) : null}
                        </div>
                      )}

                      <div
                        className={cn(
                          "max-w-[75%] sm:max-w-[65%]",
                          isMe ? "items-end" : "items-start",
                          "flex flex-col gap-1"
                        )}
                      >
                        {msg.photo_url && (
                          <a href={msg.photo_url} target="_blank" rel="noopener noreferrer" className="block">
                            <Image
                              src={msg.photo_url}
                              alt="Fotografie"
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
                        {isLastInGroup && (
                          <span className={cn("text-[10px] text-zinc-600 px-1", isMe ? "text-right" : "text-left")}>
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

          {/* Compose */}
          <div className="flex-shrink-0 border-t border-zinc-800 px-4 py-3 bg-zinc-950">
            {photoPreview && (
              <div className="relative inline-block mb-2">
                <Image
                  src={photoPreview.dataUrl}
                  alt="Previzualizare"
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
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-xl text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors flex-shrink-0 mb-0.5"
                disabled={sending}
                aria-label="Atașează fotografie"
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

              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                }}
                onKeyDown={handleKeyDown}
                placeholder="Scrie un mesaj…"
                rows={1}
                className="flex-1 resize-none bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-colors overflow-hidden"
                style={{ minHeight: "40px", maxHeight: "120px" }}
                disabled={sending}
              />

              <button
                onClick={handleSend}
                disabled={sending || (!text.trim() && !photoPreview)}
                className={cn(
                  "p-2 rounded-xl flex-shrink-0 transition-all mb-0.5",
                  text.trim() || photoPreview
                    ? "bg-brand-600 hover:bg-brand-500 text-white"
                    : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                )}
                aria-label="Trimite"
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

      {/* ══ Modals ══════════════════════════════════════════════════════════════ */}

      {/* Award */}
      {awardModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => !jobActionLoading && setAwardModalOpen(false)}>
          <div className="bg-zinc-900 rounded-2xl border border-zinc-700 p-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-violet-900/40 flex items-center justify-center flex-shrink-0">
                <Trophy className="h-5 w-5 text-violet-400" />
              </div>
              <h3 className="font-semibold text-white text-sm">Acordă lucrarea acestui meșter?</h3>
            </div>
            <p className="text-sm text-zinc-400 mb-5 leading-relaxed">
              Vei acorda lucrarea <span className="text-zinc-200 font-medium">«{jobCtx?.title}»</span> către{" "}
              <span className="text-zinc-200 font-medium">{name}</span>. După acordare, lucrarea nu va mai fi vizibilă altor meșteri. Această acțiune poate fi anulată cât timp lucrarea nu este finalizată.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setAwardModalOpen(false)} disabled={jobActionLoading} className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 text-sm font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50">
                Anulează
              </button>
              <button onClick={handleAward} disabled={jobActionLoading} className="flex-1 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors disabled:opacity-50">
                {jobActionLoading ? "Se procesează…" : "Da, acordă"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unaward */}
      {unawardModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => !jobActionLoading && setUnawardModalOpen(false)}>
          <div className="bg-zinc-900 rounded-2xl border border-zinc-700 p-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-white text-sm mb-2">Anulează acordarea?</h3>
            <p className="text-sm text-zinc-400 mb-5 leading-relaxed">
              Sunteți sigur că doriți să anulați acordarea? Lucrarea va deveni din nou disponibilă altor meșteri.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setUnawardModalOpen(false)} disabled={jobActionLoading} className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 text-sm font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50">
                Renunță
              </button>
              <button onClick={handleUnaward} disabled={jobActionLoading} className="flex-1 px-4 py-2.5 rounded-xl bg-red-700 hover:bg-red-600 text-white text-sm font-semibold transition-colors disabled:opacity-50">
                {jobActionLoading ? "Se procesează…" : "Da, anulează"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mark as complete */}
      {completeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => !jobActionLoading && setCompleteModalOpen(false)}>
          <div className="bg-zinc-900 rounded-2xl border border-zinc-700 p-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              </div>
              <h3 className="font-semibold text-white text-sm">Marchează lucrarea ca finalizată?</h3>
            </div>
            <p className="text-sm text-zinc-400 mb-4 leading-relaxed">
              Cealaltă parte va trebui să confirme finalizarea. Dacă confirmă, lucrarea este oficial finalizată. Dacă nu, lucrarea revine în starea «Acordată» și puteți discuta.
            </p>
            <div className="mb-4">
              <label className="block text-xs text-zinc-400 mb-1.5">Notă (opțional)</label>
              <textarea
                value={completeNote}
                onChange={(e) => setCompleteNote(e.target.value)}
                placeholder="ex: detalii despre lucrare, ora finalizării, etc."
                rows={3}
                className="w-full resize-none bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-colors"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setCompleteModalOpen(false)} disabled={jobActionLoading} className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 text-sm font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50">
                Anulează
              </button>
              <button onClick={handleRequestCompletion} disabled={jobActionLoading} className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-semibold transition-colors disabled:opacity-50">
                {jobActionLoading ? "Se procesează…" : "Da, marchează ca finalizată"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm completion */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => !jobActionLoading && setConfirmModalOpen(false)}>
          <div className="bg-zinc-900 rounded-2xl border border-zinc-700 p-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              </div>
              <h3 className="font-semibold text-white text-sm">Confirmați finalizarea lucrării?</h3>
            </div>
            <p className="text-sm text-zinc-400 mb-5 leading-relaxed">
              Sunteți sigur că lucrarea este finalizată conform așteptărilor? După confirmare, veți putea lăsa o recenzie.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmModalOpen(false)} disabled={jobActionLoading} className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 text-sm font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50">
                Anulează
              </button>
              <button onClick={handleConfirmCompletion} disabled={jobActionLoading} className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors disabled:opacity-50">
                {jobActionLoading ? "Se procesează…" : "Da, confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dispute completion */}
      {disputeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => !jobActionLoading && setDisputeModalOpen(false)}>
          <div className="bg-zinc-900 rounded-2xl border border-zinc-700 p-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-white text-sm mb-2">Contestați finalizarea lucrării?</h3>
            <p className="text-sm text-zinc-400 mb-4 leading-relaxed">
              Vă rugăm să indicați motivul. Cealaltă parte va vedea acest mesaj. Lucrarea va reveni la starea «Acordată» pentru a putea discuta.
            </p>
            <div className="mb-4">
              <label className="block text-xs text-zinc-400 mb-1.5">Motivul contestării</label>
              <textarea
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder="Descrie motivul contestației…"
                rows={3}
                className="w-full resize-none bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-colors"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDisputeModalOpen(false)} disabled={jobActionLoading} className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 text-sm font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50">
                Renunță
              </button>
              <button onClick={handleDisputeCompletion} disabled={jobActionLoading} className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-semibold transition-colors disabled:opacity-50">
                {jobActionLoading ? "Se procesează…" : "Trimite contestația"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
