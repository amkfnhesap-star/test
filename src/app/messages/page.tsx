"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  ConversationList,
  type ConversationSummary,
} from "@/components/messages/ConversationList";

export default function MessagesPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.replace("/login?redirect=/messages");
        return;
      }
      setToken(session.access_token);
      setCurrentUserId(session.user.id);
    });
  }, [router]);

  useEffect(() => {
    if (!token) return;
    fetch("/api/conversations", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setConversations(data.conversations ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  return (
    <div className="min-h-screen bg-zinc-950 pt-16">
      <div className="max-w-5xl mx-auto flex h-[calc(100vh-64px)]">
        {/* Sidebar — full width on mobile, 360px on desktop */}
        <div className="w-full md:w-[360px] md:flex-shrink-0 border-r border-zinc-800 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-4 border-b border-zinc-800">
            <MessageCircle className="h-5 w-5 text-brand-500" />
            <h1 className="text-base font-semibold text-white">Messages</h1>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            <ConversationList
              conversations={conversations}
              loading={loading}
              currentUserId={currentUserId ?? ""}
            />
          </div>
        </div>

        {/* Right panel — desktop only empty state */}
        <div className="hidden md:flex flex-1 items-center justify-center bg-zinc-950">
          <div className="text-center">
            <div className="h-16 w-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-8 w-8 text-zinc-600" />
            </div>
            <p className="text-sm font-medium text-zinc-400">Select a conversation</p>
            <p className="text-xs text-zinc-600 mt-1">Choose one from the list to start chatting</p>
          </div>
        </div>
      </div>
    </div>
  );
}
