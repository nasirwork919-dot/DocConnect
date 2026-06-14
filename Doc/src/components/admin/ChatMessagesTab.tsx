import React, { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { Loader2, MessageSquare, User, Bot } from "lucide-react";
import { showError } from "@/utils/toast";

interface ChatMessage {
  id: string;
  session_id: string;
  sender: string;
  message_content: string;
  timestamp: string;
}

interface Session {
  session_id: string;
  preview: string;       // first user message
  lastTime: string;      // latest message timestamp
  messageCount: number;
  messages: ChatMessage[];
}

// Renders bold/italic markdown in bot messages
function BotText({ text }: { text: string }) {
  const lines = text.split("\n").filter(Boolean);
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p key={i} className="text-sm leading-relaxed">
            {parts.map((p, j) =>
              p.startsWith("**") && p.endsWith("**")
                ? <strong key={j}>{p.slice(2, -2)}</strong>
                : p
            )}
          </p>
        );
      })}
    </div>
  );
}

const ChatMessagesTab = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("chatbot_messages")
        .select("*")
        .order("timestamp", { ascending: true })
        .limit(1000);

      if (error) {
        showError("Failed to load chat messages.");
        console.error(error);
        setLoading(false);
        return;
      }

      const msgs: ChatMessage[] = data || [];

      // Group by session_id
      const map = new Map<string, ChatMessage[]>();
      msgs.forEach(m => {
        if (!map.has(m.session_id)) map.set(m.session_id, []);
        map.get(m.session_id)!.push(m);
      });

      const built: Session[] = [];
      map.forEach((sessionMsgs, session_id) => {
        const firstUser = sessionMsgs.find(m => m.sender === "user");
        const last = sessionMsgs[sessionMsgs.length - 1];
        built.push({
          session_id,
          preview: firstUser?.message_content ?? "—",
          lastTime: last?.timestamp ?? "",
          messageCount: sessionMsgs.length,
          messages: sessionMsgs,
        });
      });

      // Sort sessions newest-last-message first
      built.sort((a, b) => new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime());

      setSessions(built);
      if (built.length > 0) setSelectedId(built[0].session_id);
      setLoading(false);
    };

    fetchMessages();
  }, []);

  // Scroll to bottom when conversation changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedId]);

  const selected = sessions.find(s => s.session_id === selectedId);
  const shortId = (id: string) => id?.slice(0, 8).toUpperCase() ?? "—";

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-blue" />
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card className="rounded-2xl shadow-[0_4px_14px_rgba(0,0,0,0.07)] p-8 text-center">
        <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground font-sans">No conversations yet.</p>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl shadow-[0_4px_14px_rgba(0,0,0,0.07)] overflow-hidden">
      <div className="flex h-[600px]">

        {/* ── Session list ────────────────────────────────────── */}
        <div className="w-72 flex-shrink-0 border-r border-border flex flex-col">
          <div className="px-4 py-3 border-b border-border bg-muted/30">
            <h2 className="font-michroma text-sm font-semibold text-heading-dark dark:text-gray-100">
              Conversations
            </h2>
            <p className="text-xs text-muted-foreground font-sans mt-0.5">
              {sessions.length} session{sessions.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {sessions.map(s => (
              <button
                key={s.session_id}
                onClick={() => setSelectedId(s.session_id)}
                className={`w-full text-left px-4 py-3 border-b border-border transition-colors hover:bg-primary-blue/5 ${
                  s.session_id === selectedId
                    ? "bg-primary-blue/10 border-l-2 border-l-primary-blue"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-semibold text-primary-blue">
                    #{shortId(s.session_id)}
                  </span>
                  <span className="text-xs text-muted-foreground font-sans">
                    {s.lastTime ? format(new Date(s.lastTime), "MMM d") : "—"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-sans line-clamp-2 leading-relaxed">
                  {s.preview.slice(0, 80)}{s.preview.length > 80 ? "…" : ""}
                </p>
                <p className="text-xs text-muted-foreground/60 font-sans mt-1">
                  {s.messageCount} messages
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* ── Conversation panel ──────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Header */}
          {selected && (
            <div className="px-5 py-3 border-b border-border bg-muted/30 flex-shrink-0">
              <p className="font-michroma text-sm font-semibold text-heading-dark dark:text-gray-100">
                Session #{shortId(selected.session_id)}
              </p>
              <p className="text-xs text-muted-foreground font-sans mt-0.5">
                {selected.messageCount} messages ·{" "}
                {selected.lastTime
                  ? format(new Date(selected.lastTime), "PPpp")
                  : "—"}
              </p>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {selected?.messages.map(msg => {
              const isUser = msg.sender === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                      isUser ? "bg-primary-blue" : "bg-muted-foreground/20"
                    }`}
                  >
                    {isUser
                      ? <User className="h-3.5 w-3.5 text-white" />
                      : <Bot className="h-3.5 w-3.5 text-muted-foreground" />
                    }
                  </div>

                  {/* Bubble */}
                  <div
                    className={`max-w-[72%] px-3.5 py-2.5 rounded-2xl font-sans ${
                      isUser
                        ? "bg-primary-blue text-white rounded-br-sm"
                        : "bg-muted-foreground/10 text-heading-dark dark:text-gray-100 rounded-bl-sm"
                    }`}
                  >
                    {isUser
                      ? <p className="text-sm">{msg.message_content}</p>
                      : <BotText text={msg.message_content} />
                    }
                    <p
                      className={`text-[10px] mt-1 ${
                        isUser ? "text-blue-100 text-right" : "text-muted-foreground/60"
                      }`}
                    >
                      {msg.timestamp ? format(new Date(msg.timestamp), "p") : ""}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

        </div>
      </div>
    </Card>
  );
};

export default ChatMessagesTab;
