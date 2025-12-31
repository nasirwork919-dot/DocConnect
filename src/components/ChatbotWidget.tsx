"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, X, Send, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client"; // Import supabase client

interface ChatMessage {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Generate a session ID on component mount if not already present
  useEffect(() => {
    let currentSessionId = localStorage.getItem('chatbotSessionId');
    if (!currentSessionId) {
      currentSessionId = crypto.randomUUID();
      localStorage.setItem('chatbotSessionId', currentSessionId);
    }
    setSessionId(currentSessionId);

    // Load initial messages from history if available
    const loadChatHistory = async () => {
      if (currentSessionId) {
        const { data, error } = await supabase
          .from('chatbot_messages')
          .select('sender, message_content, id')
          .eq('session_id', currentSessionId)
          .order('timestamp', { ascending: true });

        if (error) {
          console.error("Error loading chat history:", error);
          setMessages([{ id: 1, text: "Hello! I'm your DocConnect AI assistant. How can I help you today?", sender: 'bot' }]);
        } else if (data && data.length > 0) {
          setMessages(data.map((msg, index) => ({
            id: msg.id || index + 1, // Use DB ID if available, fallback to index
            text: msg.message_content,
            sender: msg.sender as 'user' | 'bot',
          })));
        } else {
          setMessages([{ id: 1, text: "Hello! I'm your DocConnect AI assistant. How can I help you today?", sender: 'bot' }]);
        }
      }
    };
    loadChatHistory();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputMessage.trim() === "" || !sessionId) return;

    const newUserMessage: ChatMessage = { id: messages.length + 1, text: inputMessage, sender: 'user' };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setInputMessage("");
    setIsBotTyping(true);

    try {
      // Save user message to Supabase history
      const { error: userMessageError } = await supabase.from('chatbot_messages').insert({
        session_id: sessionId,
        sender: 'user',
        message_content: newUserMessage.text,
      });
      if (userMessageError) console.error("Error saving user message to history:", userMessageError);

      // Call the AI Edge Function
      const response = await supabase.functions.invoke('chatbot-ai', {
        body: {
          messages: [{ role: 'user', content: newUserMessage.text }], // Only send the latest message for the AI to process
          sessionId: sessionId,
        },
      });

      if (response.error) {
        console.error("Edge Function error:", response.error);
        throw new Error(response.error.message);
      }

      const botResponseText = (response.data as { response: string }).response;

      const newBotMessage: ChatMessage = { id: messages.length + 2, text: botResponseText, sender: 'bot' };
      setMessages((prevMessages) => [...prevMessages, newBotMessage]);

      // The Edge Function already saves the bot's response to history
      // No need to save it again here.

    } catch (error) {
      console.error("Chatbot API call failed:", error);
      const errorMessage: ChatMessage = { id: messages.length + 2, text: "Oops! Something went wrong. Please try again.", sender: 'bot' };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsBotTyping(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-8 left-8 z-50"
        >
          <Button
            className="rounded-full p-3 shadow-lg bg-secondary-teal hover:bg-secondary-teal/90 text-white"
            size="icon"
            aria-label="Open chatbot"
          >
            <MessageSquare className="h-5 w-5" />
          </Button>
        </motion.div>
      </SheetTrigger>
      <SheetContent side="left" className="w-full md:w-[400px] p-0 flex flex-col bg-card-background dark:bg-heading-dark">
        <SheetHeader className="bg-primary-blue text-white p-4 rounded-t-lg">
          <SheetTitle className="text-lg font-semibold font-michroma">DocConnect AI Chat</SheetTitle>
        </SheetHeader>
        <CardContent className="flex-1 p-4 overflow-y-auto flex flex-col space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] p-2 rounded-lg text-sm font-sans ${
                  msg.sender === 'user'
                    ? 'bg-primary-blue text-white rounded-br-none'
                    : 'bg-muted-foreground/10 text-heading-dark dark:text-gray-50 rounded-bl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isBotTyping && (
            <div className="flex justify-start">
              <div className="max-w-[75%] p-2 rounded-lg text-sm font-sans bg-muted-foreground/10 text-heading-dark dark:text-gray-50 rounded-bl-none flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> Typing...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>
        <form onSubmit={handleSendMessage} className="p-4 border-t bg-card-background dark:bg-card flex-shrink-0 flex">
          <Input
            type="text"
            placeholder="Type your message..."
            className="flex-1 p-2 border rounded-xl text-sm font-sans bg-background-light dark:bg-heading-dark dark:text-gray-50 mr-2"
            value={inputMessage}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputMessage(e.currentTarget.value)}
            disabled={isBotTyping}
          />
          <Button type="submit" size="icon" className="bg-primary-blue hover:bg-primary-blue/90 text-white rounded-xl" disabled={isBotTyping}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default ChatbotWidget;