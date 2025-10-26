"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 left-8 z-50 w-80 md:w-96"
          >
            <Card className="rounded-2xl shadow-xl border-none">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-primary-blue text-white rounded-t-2xl">
                <CardTitle className="text-lg font-semibold font-michroma">DocConnect AI Chat</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-primary-blue/80 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </Button>
              </CardHeader>
              <CardContent className="p-4 h-64 overflow-y-auto bg-background-light dark:bg-heading-dark rounded-b-2xl">
                <p className="text-sm text-muted-text font-sans">
                  Hello! I'm your AI assistant. How can I help you today?
                </p>
                {/* Placeholder for chat messages */}
                <div className="mt-4 p-2 bg-primary-blue/10 dark:bg-primary-blue/20 rounded-lg text-sm font-sans">
                  <p>Example: "How do I book an appointment?"</p>
                </div>
                <div className="mt-2 p-2 bg-primary-blue/10 dark:bg-primary-blue/20 rounded-lg text-sm font-sans">
                  <p>Example: "What are the symptoms of a cold?"</p>
                </div>
              </CardContent>
              {/* Input area placeholder */}
              <div className="p-4 border-t bg-card-background dark:bg-card rounded-b-2xl">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="w-full p-2 border rounded-xl text-sm font-sans bg-background-light dark:bg-heading-dark dark:text-gray-50"
                />
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-8 left-8 z-50"
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-full p-3 shadow-lg bg-secondary-teal hover:bg-secondary-teal/90 text-white"
          size="icon"
          aria-label="Open chatbot"
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
      </motion.div>
    </>
  );
};

export default ChatbotWidget;