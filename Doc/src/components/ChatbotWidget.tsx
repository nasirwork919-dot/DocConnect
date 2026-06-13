"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send, Loader2, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";

interface ChatMessage {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

const QUICK_ACTIONS = [
  { label: "📅 Book Appointment", message: "I want to book an appointment" },
  { label: "👨‍⚕️ View Doctors", message: "Who are your doctors?" },
  { label: "❓ Ask a Question", message: "I have a question about the clinic" },
  { label: "📞 Contact Us", message: "How can I contact the clinic?" },
  { label: "🚨 Emergency", message: "I need emergency guidance" },
];

// Safe markdown renderer — no dangerouslySetInnerHTML
function BotMessage({ text }: { text: string }) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let listBuffer: string[] = [];
  let key = 0;

  const parseLine = (line: string): React.ReactNode => {
    // Full-line italic (used for disclaimer: _Note: ..._)
    if (line.startsWith('_') && line.endsWith('_') && line.length > 2) {
      return <em className="text-xs text-muted-foreground not-italic opacity-75">{line.slice(1, -1)}</em>;
    }
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((p, i) =>
      p.startsWith('**') && p.endsWith('**')
        ? <strong key={i}>{p.slice(2, -2)}</strong>
        : p
    );
  };

  const flushList = () => {
    if (listBuffer.length > 0) {
      elements.push(
        <ul key={key++} className="list-disc pl-4 my-1 space-y-0.5 text-sm">
          {listBuffer.map((item, i) => <li key={i}>{parseLine(item)}</li>)}
        </ul>
      );
      listBuffer = [];
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      listBuffer.push(trimmed.slice(2));
    } else {
      flushList();
      if (trimmed) {
        elements.push(
          <p key={key++} className="text-sm leading-relaxed">{parseLine(trimmed)}</p>
        );
      } else {
        elements.push(<div key={key++} className="h-1" />);
      }
    }
  }
  flushList();

  return <div className="space-y-1">{elements}</div>;
}

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showPulse, setShowPulse] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Show pulse animation + tooltip after 10s of user inactivity (only when chat is closed)
  useEffect(() => {
    if (isOpen) {
      setShowPulse(false);
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      return;
    }

    const startTimer = () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      inactivityTimer.current = setTimeout(() => setShowPulse(true), 10000);
    };

    const resetTimer = () => {
      setShowPulse(false);
      startTimer();
    };

    startTimer();
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);

    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
    };
  }, [isOpen]);

  useEffect(() => {
    let sid = localStorage.getItem('chatbotSessionId');
    if (!sid) {
      sid = crypto.randomUUID();
      localStorage.setItem('chatbotSessionId', sid);
    }
    setSessionId(sid);

    const load = async () => {
      const { data, error } = await supabase
        .from('chatbot_messages')
        .select('sender, message_content, id')
        .eq('session_id', sid!)
        .order('timestamp', { ascending: true });

      if (!error && data && data.length > 0) {
        setMessages(data.map((msg, i) => ({
          id: msg.id || i + 1,
          text: msg.message_content,
          sender: msg.sender as 'user' | 'bot',
        })));
      } else {
        setMessages([{
          id: 1,
          text: "Welcome to DocConnect! 👋 I'm here to help you with appointments, doctor info, or any questions about our clinic. How can I help you today?",
          sender: 'bot',
        }]);
      }
    };
    load();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || !sessionId) return;

    const userMsg: ChatMessage = { id: Date.now(), text, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage("");
    setIsBotTyping(true);

    try {
      await supabase.from('chatbot_messages').insert({
        session_id: sessionId,
        sender: 'user',
        message_content: text,
      });

      const response = await supabase.functions.invoke('chatbot-ai', {
        body: { messages: [{ role: 'user', content: text }], sessionId },
      });

      if (response.error) throw new Error(response.error.message);

      const botText = (response.data as { response: string }).response;
      setMessages(prev => [...prev, { id: Date.now() + 1, text: botText, sender: 'bot' }]);
    } catch (err) {
      console.error("Chatbot error:", err);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: "I'm having a little trouble right now. Please try again, or call us directly at +1 (555) 123-4567.",
        sender: 'bot',
      }]);
    } finally {
      setIsBotTyping(false);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    sendMessage(inputMessage);
  };

  const handleNewChat = () => {
    const newSid = crypto.randomUUID();
    localStorage.setItem('chatbotSessionId', newSid);
    setSessionId(newSid);
    setMessages([{
      id: 1,
      text: "Welcome back! 👋 How can I help you today?",
      sender: 'bot',
    }]);
  };

  const showQuickActions = messages.length <= 1;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-8 right-8 z-50 flex items-center gap-2"
        >
          {/* Tooltip — shown during pulse */}
          {showPulse && (
            <motion.div
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white text-gray-700 text-xs font-medium px-3 py-2 rounded-lg shadow-lg whitespace-nowrap border border-gray-100 font-sans"
            >
              Need help? Chat with us 💬
            </motion.div>
          )}

          {/* Button with optional ping ring */}
          <div className="relative">
            {showPulse && (
              <span className="absolute inset-0 rounded-full bg-secondary-teal/40 animate-ping" />
            )}
            <Button
              className="rounded-full p-3 shadow-lg bg-secondary-teal hover:bg-secondary-teal/90 text-white relative"
              size="icon"
              aria-label="Open DocConnect AI assistant"
            >
              <MessageSquare className="h-5 w-5" />
            </Button>
          </div>
        </motion.div>
      </SheetTrigger>

      <SheetContent side="right" className="w-full md:w-[400px] p-0 flex flex-col bg-card-background dark:bg-heading-dark">
        {/* Header */}
        <SheetHeader className="bg-primary-blue text-white px-4 py-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-base font-semibold font-michroma text-white">DocConnect AI</SheetTitle>
              <p className="text-xs text-blue-100 font-sans mt-0.5">Hospital Assistant · Always here to help</p>
            </div>
            <button
              onClick={handleNewChat}
              title="Start new chat"
              className="text-blue-200 hover:text-white transition-colors p-1 rounded"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </SheetHeader>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[82%] px-3 py-2 rounded-2xl ${
                  msg.sender === 'user'
                    ? 'bg-primary-blue text-white rounded-br-sm'
                    : 'bg-muted-foreground/10 text-heading-dark dark:text-gray-100 rounded-bl-sm'
                }`}
              >
                {msg.sender === 'bot'
                  ? <BotMessage text={msg.text} />
                  : <p className="text-sm">{msg.text}</p>
                }
              </div>
            </div>
          ))}

          {/* Quick actions — only at conversation start */}
          {showQuickActions && !isBotTyping && (
            <div className="space-y-1.5 pt-1">
              <p className="text-xs text-muted-foreground font-sans px-1">Quick actions:</p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => sendMessage(action.message)}
                    className="text-xs px-3 py-1.5 rounded-full border border-primary-blue/30 text-primary-blue hover:bg-primary-blue hover:text-white transition-colors font-sans"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isBotTyping && (
            <div className="flex justify-start">
              <div className="px-3 py-2 rounded-2xl rounded-bl-sm bg-muted-foreground/10 flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary-blue" />
                <span className="text-xs text-muted-foreground font-sans">Thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="px-4 py-3 border-t bg-card-background dark:bg-card flex gap-2 flex-shrink-0"
        >
          <Input
            type="text"
            placeholder="Ask me anything about DocConnect..."
            className="flex-1 rounded-xl text-sm font-sans bg-background-light dark:bg-heading-dark dark:text-gray-50"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.currentTarget.value)}
            disabled={isBotTyping}
          />
          <Button
            type="submit"
            size="icon"
            className="bg-primary-blue hover:bg-primary-blue/90 text-white rounded-xl flex-shrink-0"
            disabled={isBotTyping || !inputMessage.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default ChatbotWidget;
