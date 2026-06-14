import React, { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { Loader2, MessageSquare, User, Bot, ChevronLeft } from "lucide-react";
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
  preview: string;
  lastTime: string;
  messageCount: number;
  messages: ChatMessage[];
}

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
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const messagesContainerRef = useRef<HTMLDivElement>(null);

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

      built.sort((a, b) => new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime());
      setSessions(built);
      if (built.length > 0) setSelectedId(built[0].session_id);
      setLoading(false);
    };

    fetchMessages();
  }, []);

  // Scroll the messages container to bottom (not the page)
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [selectedId, sessions]);

  const handleSelectSession = (id: string) => {
    setSelectedId(id);
    setMobileView("chat");
  };

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
      <Card className="rounded-2xl shadow-[0_4px_14px_rgba(0,0,0,0.07)] p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary-blue/10 flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="h-8 w-8 text-primary-blue" />
        </div>
        <p className="text-muted-foreground font-sans font-medium">No conversations yet.</p>
        <p className="text-xs text-muted-foreground/70 font-sans mt-1">
          Patient chats will appear here once they use the AI assistant.
        </p>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl shadow-[0_4px_14px_rgba(0,0,0,0.07)] overflow-hidden border-0">
      <div className="flex h-[calc(100vh-260px)] min-h-[520px]">

        {/* ── Session list ────────────────────────────────────── */}
        <div
          className={`
            w-full md:w-80 flex-shrink-0 border-r border-border flex-col
            bg-muted/20 dark:bg-card
            ${mobileView === "chat" ? "hidden md:flex" : "flex"}
          `}
        >
          {/* List header */}
          <div className="px-4 py-4 border-b border-border bg-gradient-to-r from-primary-blue/5 to-transparent">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary-blue/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary-blue" />
              </div>
              <div>
                <h2 className="font-michroma text-sm font-semibold text-heading-dark dark:text-gray-100">
                  AI Conversations
                </h2>
                <p className="text-xs text-muted-foreground font-sans">
                  {sessions.length} session{sessions.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>

          {/* Session items */}
          <div className="flex-1 overflow-y-auto">
            {sessions.map(s => (
              <button
                key={s.session_id}
                onClick={() => handleSelectSession(s.session_id)}
                className={`w-full text-left px-4 py-3.5 border-b border-border/60 transition-all duration-150
                  hover:bg-primary-blue/5 active:bg-primary-blue/10
                  ${s.session_id === selectedId
                    ? "bg-primary-blue/10 dark:bg-primary-blue/20 border-l-[3px] border-l-primary-blue"
                    : "border-l-[3px] border-l-transparent"
                  }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-xs font-bold text-primary-blue bg-primary-blue/10 px-1.5 py-0.5 rounded">
                    #{shortId(s.session_id)}
                  </span>
                  <span className="text-[11px] text-muted-foreground font-sans">
                    {s.lastTime ? format(new Date(s.lastTime), "MMM d") : "—"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-sans line-clamp-2 leading-relaxed mb-1">
                  {s.preview.slice(0, 80)}{s.preview.length > 80 ? "…" : ""}
                </p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                  <p className="text-[11px] text-muted-foreground/60 font-sans">
                    {s.messageCount} messages
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Conversation panel ──────────────────────────────── */}
        <div
          className={`
            flex-1 flex-col min-w-0
            ${mobileView === "list" ? "hidden md:flex" : "flex"}
          `}
        >
          {/* Chat header */}
          {selected ? (
            <div className="px-4 py-3.5 border-b border-border bg-gradient-to-r from-muted/40 to-transparent flex-shrink-0 flex items-center gap-3">
              {/* Back button — mobile only */}
              <button
                className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted transition-colors"
                onClick={() => setMobileView("list")}
              >
                <ChevronLeft className="h-5 w-5 text-muted-foreground" />
              </button>

              <div className="w-9 h-9 rounded-xl bg-primary-blue/10 flex items-center justify-center flex-shrink-0">
                <Bot className="h-5 w-5 text-primary-blue" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-michroma text-sm font-semibold text-heading-dark dark:text-gray-100">
                  Session #{shortId(selected.session_id)}
                </p>
                <p className="text-xs text-muted-foreground font-sans">
                  {selected.messageCount} messages ·{" "}
                  {selected.lastTime ? format(new Date(selected.lastTime), "MMM d, p") : "—"}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <Bot className="h-10 w-10 opacity-30" />
              <p className="font-sans text-sm">Select a conversation</p>
            </div>
          )}

          {/* Messages */}
          {selected && (
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto px-4 py-5 space-y-4"
            >
              {selected.messages.map(msg => {
                const isUser = msg.sender === "user";
                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {/* Avatar */}
                    <div
                      className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                        isUser ? "bg-primary-blue" : "bg-muted-foreground/15"
                      }`}
                    >
                      {isUser
                        ? <User className="h-3.5 w-3.5 text-white" />
                        : <Bot className="h-3.5 w-3.5 text-muted-foreground" />
                      }
                    </div>

                    {/* Bubble */}
                    <div
                      className={`max-w-[75%] sm:max-w-[65%] px-4 py-2.5 rounded-2xl font-sans shadow-sm ${
                        isUser
                          ? "bg-primary-blue text-white rounded-br-sm"
                          : "bg-white dark:bg-card border border-border text-heading-dark dark:text-gray-100 rounded-bl-sm"
                      }`}
                    >
                      {isUser
                        ? <p className="text-sm leading-relaxed">{msg.message_content}</p>
                        : <BotText text={msg.message_content} />
                      }
                      <p className={`text-[10px] mt-1.5 ${isUser ? "text-blue-200 text-right" : "text-muted-foreground/50"}`}>
                        {msg.timestamp ? format(new Date(msg.timestamp), "p") : ""}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </Card>
  );
};

export default ChatMessagesTab;
