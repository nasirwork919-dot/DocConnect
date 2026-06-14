import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { Loader2, MessageCircle, Phone } from "lucide-react";
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

      // Group by from_number (each unique sender = one conversation)
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

  const selected = conversations.find(c => c.from_number === selectedNumber);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-blue" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <Card className="rounded-2xl shadow-[0_4px_14px_rgba(0,0,0,0.07)] p-8 text-center">
        <MessageCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground font-sans">No WhatsApp messages received yet.</p>
        <p className="text-xs text-muted-foreground font-sans mt-2">
          Patients need to text your Twilio sandbox number on WhatsApp.
        </p>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl shadow-[0_4px_14px_rgba(0,0,0,0.07)] overflow-hidden">
      <div className="flex h-[600px]">

        {/* ── Sender list ─────────────────────────────────────── */}
        <div className="w-64 flex-shrink-0 border-r border-border flex flex-col">
          <div className="px-4 py-3 border-b border-border bg-muted/30">
            <h2 className="font-michroma text-sm font-semibold text-heading-dark dark:text-gray-100">
              WhatsApp Inbox
            </h2>
            <p className="text-xs text-muted-foreground font-sans mt-0.5">
              {conversations.length} patient{conversations.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.map(c => (
              <button
                key={c.from_number}
                onClick={() => setSelectedNumber(c.from_number)}
                className={`w-full text-left px-4 py-3 border-b border-border transition-colors hover:bg-green-50 dark:hover:bg-green-900/10 ${
                  c.from_number === selectedNumber
                    ? "bg-green-50 dark:bg-green-900/20 border-l-2 border-l-green-500"
                    : ""
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-3 w-3 text-white" />
                  </div>
                  <span className="font-sans text-xs font-semibold text-heading-dark dark:text-gray-100 truncate">
                    {c.displayNumber}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-sans line-clamp-2 pl-8">
                  {c.preview.slice(0, 60)}{c.preview.length > 60 ? "…" : ""}
                </p>
                <p className="text-xs text-muted-foreground/60 font-sans mt-1 pl-8">
                  {c.lastTime ? format(new Date(c.lastTime), "MMM d, p") : "—"}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* ── Message thread ───────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0">

          {selected && (
            <div className="px-5 py-3 border-b border-border bg-muted/30 flex-shrink-0 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <Phone className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-michroma text-sm font-semibold text-heading-dark dark:text-gray-100">
                  {selected.displayNumber}
                </p>
                <p className="text-xs text-muted-foreground font-sans">
                  {selected.messages.length} message{selected.messages.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {selected?.messages.map(msg => (
              <div key={msg.id} className="flex items-end gap-2">
                {/* All messages here are inbound (from patient) */}
                <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                  <Phone className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="max-w-[72%] px-3.5 py-2.5 rounded-2xl rounded-bl-sm bg-muted-foreground/10 text-heading-dark dark:text-gray-100 font-sans">
                  <p className="text-sm">{msg.message_body}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1">
                    {msg.created_at ? format(new Date(msg.created_at), "PPpp") : "—"}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </Card>
  );
};

export default WhatsAppChatsTab;
