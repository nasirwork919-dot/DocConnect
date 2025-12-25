"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, X, Send, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { ALL_DOCTORS } from "@/data/doctors";
// Removed useSession import
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface ChatMessage {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, text: "Hello! I'm your DocConnect AI assistant. How can I help you today?", sender: 'bot' },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  // Removed user from useSession

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputMessage.trim() === "") return;

    const newUserMessage: ChatMessage = { id: messages.length + 1, text: inputMessage, sender: 'user' };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setInputMessage("");
    setIsBotTyping(true);

    // Simulate AI response
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network delay

    let botResponseText = "I'm sorry, I didn't understand that. Can you please rephrase?";
    let action: (() => void) | null = null;

    const lowerCaseMessage = newUserMessage.text.toLowerCase();

    if (lowerCaseMessage.includes("book appointment") || lowerCaseMessage.includes("make appointment")) {
      // Removed user check for booking
      const doctorMatch = ALL_DOCTORS.find(doc => lowerCaseMessage.includes(doc.name.toLowerCase()));
      if (doctorMatch) {
        botResponseText = `Okay, I can help you book an appointment with ${doctorMatch.name}. Redirecting you to the booking page now.`;
        action = () => navigate(`/book?doctorId=${doctorMatch.id}`);
      } else {
        botResponseText = "Sure, I can help you book an appointment. I can take you to the general booking page.";
        action = () => navigate('/book');
      }
    } else if (lowerCaseMessage.includes("specialization") || lowerCaseMessage.includes("doctors")) {
      botResponseText = "We have doctors specializing in Cardiology, Neurology, Pediatrics, Dermatology, Orthopedics, and more! You can browse all doctors on our Doctors page.";
      action = () => navigate('/doctors');
    } else if (lowerCaseMessage.includes("hello") || lowerCaseMessage.includes("hi")) {
      botResponseText = "Hello there! How can I assist you today?";
    } else if (lowerCaseMessage.includes("contact")) {
      botResponseText = "You can reach us via our Contact Us page for more details.";
      action = () => navigate('/contact');
    } else if (lowerCaseMessage.includes("about")) {
      botResponseText = "Learn more about us on our About Us page!";
      action = () => navigate('/about');
    }

    const newBotMessage: ChatMessage = { id: messages.length + 2, text: botResponseText, sender: 'bot' };
    setMessages((prevMessages) => [...prevMessages, newBotMessage]);
    setIsBotTyping(false);

    if (action) {
      setTimeout(action, 1500); // Give user a moment to read bot's message
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