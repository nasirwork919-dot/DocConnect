import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { showError } from "@/utils/toast";

interface ChatMessage {
  id: string;
  session_id: string;
  sender: string;
  message_content: string;
  timestamp: string;
}

const ChatMessagesTab = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "user" | "bot">("all");

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("chatbot_messages")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(200);

      if (error) {
        console.error("Error fetching chat messages:", error);
        showError("Failed to load chat messages.");
      } else {
        setMessages(data || []);
      }
      setLoading(false);
    };

    fetchMessages();
  }, []);

  const filtered = filter === "all" ? messages : messages.filter(m => m.sender === filter);

  const shortSession = (id: string) => id?.slice(0, 8)?.toUpperCase() ?? "—";

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-blue" />
      </div>
    );
  }

  return (
    <Card className="rounded-2xl shadow-[0_4px_14px_rgba(0,0,0,0.07)]">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-michroma">Chatbot Conversations</CardTitle>
        <div className="flex gap-2 font-sans text-sm">
          {(["all", "user", "bot"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full border transition-colors capitalize ${
                filter === f
                  ? "bg-primary-blue text-white border-primary-blue"
                  : "border-gray-300 text-muted-foreground hover:border-primary-blue"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <p className="text-center text-muted-text font-sans">No messages found.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="font-michroma">
                  <TableHead>Session</TableHead>
                  <TableHead>Sender</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((msg) => (
                  <TableRow key={msg.id} className="font-sans">
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {shortSession(msg.session_id)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={msg.sender === "user" ? "default" : "secondary"}
                        className={msg.sender === "user" ? "bg-primary-blue text-white" : ""}
                      >
                        {msg.sender === "user" ? "Patient" : "Bot"}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[420px] whitespace-pre-wrap text-sm">
                      {msg.message_content}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {msg.timestamp ? format(new Date(msg.timestamp), "PPpp") : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChatMessagesTab;
