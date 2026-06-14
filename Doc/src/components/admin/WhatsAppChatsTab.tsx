import React, { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { Loader2, MessageCircle, Phone, ChevronLeft } from "lucide-react";
import { showError } from "@/utils/toast";

interface WhatsAppMessage {
  id: string;
  from_number: string;
  to_number: string;
  message_body: string;
  message_sid: string;
  created_at: string;
}

interface Conversation {
  from_number: string;
  displayNumber: string;
  messages: WhatsAppMessage[];
  lastTime: string;
  preview: string;
}

const WhatsAppChatsTab = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedNumber, setSelectedNumber] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("whatsapp_chats")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(500);

      if (error) {
        showError("Failed to load WhatsApp messages.");
        console.error(error);
        setLoading(false);
        return;
      }

      const msgs: WhatsAppMessage[] = data || [];
      const map = new Map<string, WhatsAppMessage[]>();
      msgs.forEach(m => {
        if (!map.has(m.from_number)) map.set(m.from_number, []);
        map.get(m.from_number)!.push(m);
      });

      const built: Conversation[] = [];
      map.forEach((convMsgs, from_number) => {
        const last = convMsgs[convMsgs.length - 1];
        built.push({
          from_number,
          displayNumber: from_number.replace("whatsapp:", ""),
          messages: convMsgs,
          lastTime: last?.created_at ?? "",
          preview: last?.message_body ?? "",
        });
      });

      built.sort((a, b) => new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime());
      setConversations(built);
      if (built.length > 0) setSelectedNumber(built[0].from_number);
      setLoading(false);
    };

    fetchMessages();
  }, []);

  // Scroll the container to bottom (not the page)
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [selectedNumber, conversations]);

  const handleSelectConversation = (from_number: string) => {
    setSelectedNumber(from_number);
    setMobileView("chat");
  };

  const selected = conversations.find(c => c.from_number === selectedNumber);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <Card className="rounded-2xl shadow-[0_4px_14px_rgba(0,0,0,0.07)] p-12 text-center border-0">
        <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="h-8 w-8 text-green-500" />
        </div>
        <p className="text-muted-foreground font-sans font-medium">No WhatsApp messages received yet.</p>
        <p className="text-xs text-muted-foreground/70 font-sans mt-1">
          Patients need to text your Twilio sandbox number on WhatsApp.
        </p>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl shadow-[0_4px_14px_rgba(0,0,0,0.07)] overflow-hidden border-0">
      <div className="flex h-[calc(100vh-260px)] min-h-[520px]">

        {/* ── Sender list ─────────────────────────────────────── */}
        <div
          className={`
            w-full md:w-72 flex-shrink-0 border-r border-border flex-col
            bg-muted/20 dark:bg-card
            ${mobileView === "chat" ? "hidden md:flex" : "flex"}
          `}
        >
          {/* List header */}
          <div className="px-4 py-4 border-b border-border bg-gradient-to-r from-green-500/5 to-transparent">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-green-500/15 flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h2 className="font-michroma text-sm font-semibold text-heading-dark dark:text-gray-100">
                  WhatsApp Inbox
                </h2>
                <p className="text-xs text-muted-foreground font-sans">
                  {conversations.length} patient{conversations.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>

          {/* Conversation items */}
          <div className="flex-1 overflow-y-auto">
            {conversations.map(c => (
              <button
                key={c.from_number}
                onClick={() => handleSelectConversation(c.from_number)}
                className={`w-full text-left px-4 py-3.5 border-b border-border/60 transition-all duration-150
                  hover:bg-green-500/5 active:bg-green-500/10
                  ${c.from_number === selectedNumber
                    ? "bg-green-500/10 dark:bg-green-900/20 border-l-[3px] border-l-green-500"
                    : "border-l-[3px] border-l-transparent"
                  }`}
              >
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Phone className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-xs font-semibold text-heading-dark dark:text-gray-100 truncate">
                      {c.displayNumber}
                    </p>
                    <p className="text-[11px] text-muted-foreground/60 font-sans">
                      {c.lastTime ? format(new Date(c.lastTime), "MMM d, p") : "—"}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground font-sans line-clamp-2 pl-10 leading-relaxed">
                  {c.preview.slice(0, 60)}{c.preview.length > 60 ? "…" : ""}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* ── Message thread ───────────────────────────────────── */}
        <div
          className={`
            flex-1 flex-col min-w-0
            ${mobileView === "list" ? "hidden md:flex" : "flex"}
          `}
        >
          {/* Chat header */}
          {selected ? (
            <div className="px-4 py-3.5 border-b border-border bg-gradient-to-r from-green-500/5 to-transparent flex-shrink-0 flex items-center gap-3">
              {/* Back button — mobile only */}
              <button
                className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted transition-colors"
                onClick={() => setMobileView("list")}
              >
                <ChevronLeft className="h-5 w-5 text-muted-foreground" />
              </button>

              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Phone className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-michroma text-sm font-semibold text-heading-dark dark:text-gray-100">
                  {selected.displayNumber}
                </p>
                <p className="text-xs text-muted-foreground font-sans">
                  {selected.messages.length} message{selected.messages.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <MessageCircle className="h-10 w-10 opacity-30" />
              <p className="font-sans text-sm">Select a conversation</p>
            </div>
          )}

          {/* Messages */}
          {selected && (
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto px-4 py-5 space-y-3"
            >
              {selected.messages.map(msg => (
                <div key={msg.id} className="flex items-end gap-2">
                  <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Phone className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="max-w-[75%] sm:max-w-[65%] px-4 py-2.5 rounded-2xl rounded-bl-sm bg-white dark:bg-card border border-border text-heading-dark dark:text-gray-100 font-sans shadow-sm">
                    <p className="text-sm leading-relaxed">{msg.message_body}</p>
                    <p className="text-[10px] text-muted-foreground/50 mt-1.5">
                      {msg.created_at ? format(new Date(msg.created_at), "PPpp") : "—"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </Card>
  );
};

export default WhatsAppChatsTab;
