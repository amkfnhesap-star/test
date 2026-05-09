"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Send, Search, Phone, Video, MoreVertical, Paperclip, Smile } from "lucide-react";
import { conversations } from "@/data/dummy";
import { cn, formatRelativeTime } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";

type Message = { id: string; content: string; sent: boolean; time: string };

const mockMessages: Record<string, Message[]> = {
  cv1: [
    { id: "1", content: "Hi! I saw your profile and I'm interested in your handyman services.", sent: true, time: "10:30 AM" },
    { id: "2", content: "Hi! Thanks for reaching out. What do you need done?", sent: false, time: "10:32 AM" },
    { id: "3", content: "I need to fix a hole in my bathroom wall and install a towel rack.", sent: true, time: "10:35 AM" },
    { id: "4", content: "That's easy! I can do both. The drywall patch takes about an hour, and the towel rack is quick. I'm thinking $130 total. Sound good?", sent: false, time: "10:37 AM" },
    { id: "5", content: "Perfect! Can you come tomorrow morning?", sent: true, time: "10:38 AM" },
    { id: "6", content: "I'll be there at 9am sharp. See you tomorrow!", sent: false, time: "10:40 AM" },
  ],
  cv2: [
    { id: "1", content: "Hello! I'd like to book your deep cleaning service.", sent: true, time: "2:00 PM" },
    { id: "2", content: "Hi! I'd love to help. What size is your place?", sent: false, time: "2:05 PM" },
    { id: "3", content: "3-bedroom apartment, about 1,400 sqft.", sent: true, time: "2:10 PM" },
    { id: "4", content: "Great! I'll bring all my eco-friendly supplies.", sent: false, time: "2:15 PM" },
  ],
  cv3: [
    { id: "1", content: "Hi James! I need help automating my business workflows.", sent: true, time: "11:00 AM" },
    { id: "2", content: "Can you share your current workflow so I can plan the automation?", sent: false, time: "11:05 AM" },
  ],
};

export default function MessagesPage() {
  const [activeConv, setActiveConv] = useState(conversations[0].id);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState(mockMessages);

  const active = conversations.find((c) => c.id === activeConv)!;
  const currentMessages = messages[activeConv] ?? [];

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    const msg: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sent: true,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => ({
      ...prev,
      [activeConv]: [...(prev[activeConv] ?? []), msg],
    }));
    setNewMessage("");
  };

  return (
    <div className="h-[calc(100vh-theme(spacing.32))] flex rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
      {/* Conversation list */}
      <div className="w-72 flex-shrink-0 border-r border-zinc-100 dark:border-zinc-800 flex flex-col">
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="font-semibold text-zinc-900 dark:text-white mb-3">Messages</h2>
          <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-3 py-2">
            <Search className="h-3.5 w-3.5 text-zinc-400" />
            <input
              placeholder="Search conversations..."
              className="flex-1 bg-transparent text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setActiveConv(conv.id)}
              className={cn(
                "w-full flex items-center gap-3 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-left",
                activeConv === conv.id && "bg-brand-50 dark:bg-brand-900/20 border-r-2 border-brand-500"
              )}
            >
              <Avatar
                src={conv.other_user.avatar_url}
                name={conv.other_user.name}
                size="md"
                isOnline={conv.other_user.is_online}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                    {conv.other_user.name}
                  </p>
                  <span className="text-[10px] text-zinc-400 flex-shrink-0">
                    {formatRelativeTime(conv.last_message_at)}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 truncate mt-0.5">{conv.last_message}</p>
              </div>
              {conv.unread_count > 0 && (
                <span className="h-5 w-5 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                  {conv.unread_count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {/* Chat header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <Avatar
              src={active.other_user.avatar_url}
              name={active.other_user.name}
              size="sm"
              isOnline={active.other_user.is_online}
            />
            <div>
              <p className="font-semibold text-zinc-900 dark:text-white text-sm">
                {active.other_user.name}
              </p>
              <p className="text-xs text-zinc-400">
                {active.other_user.is_online ? "Online now" : "Offline"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-2 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-600 transition-colors">
              <Phone className="h-4 w-4" />
            </button>
            <button className="p-2 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-600 transition-colors">
              <Video className="h-4 w-4" />
            </button>
            <button className="p-2 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-600 transition-colors">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {currentMessages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("flex", msg.sent ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-xs lg:max-w-sm px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                  msg.sent
                    ? "bg-brand-500 text-white rounded-br-sm"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-bl-sm"
                )}
              >
                {msg.content}
                <p
                  className={cn(
                    "text-[10px] mt-1",
                    msg.sent ? "text-white/60" : "text-zinc-400"
                  )}
                >
                  {msg.time}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-end gap-2 bg-zinc-50 dark:bg-zinc-800 rounded-2xl p-2 border border-zinc-200 dark:border-zinc-700 focus-within:border-brand-500 transition-colors">
            <button className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
              <Paperclip className="h-4 w-4" />
            </button>
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Type a message..."
              rows={1}
              className="flex-1 bg-transparent text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none resize-none py-1.5 px-1"
            />
            <button className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
              <Smile className="h-4 w-4" />
            </button>
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="p-2 rounded-xl bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="text-[10px] text-zinc-400 text-center mt-2">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
