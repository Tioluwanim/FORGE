"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, MessageSquareCode } from "lucide-react";
import { ThinkingIndicator } from "@/components/motion/loading-state";
import { AI_MENTOR_TRANSCRIPT } from "@/lib/mock-data";
import { cn } from "@/lib/cn";

export default function AiMentorPage() {
  const [messages, setMessages] = useState(AI_MENTOR_TRANSCRIPT);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);

  function send() {
    if (!input.trim()) return;
    setMessages((m) => [...m, { role: "user", text: input }]);
    setInput("");
    setThinking(true);
    setTimeout(() => {
      setThinking(false);
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: "Walk me through what the test expects versus what your function currently returns — where's the first place they diverge?",
        },
      ]);
    }, 1100);
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-2xl flex-col">
      <div className="flex items-center gap-2 border-b border-hairline pb-4">
        <MessageSquareCode className="h-4 w-4 text-ember" />
        <div>
          <p className="font-display text-lg text-text">AI Mentor</p>
          <p className="text-xs text-text-faint">
            Context: challenge &ldquo;Fix the N+1 query&rdquo;
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto py-4">
        <AnimatePresence initial={false}>
          {messages.map((m, i) => {
            if (m.role === "system") {
              return (
                <p key={i} className="text-center font-mono text-xs text-text-faint">
                  {m.text}
                </p>
              );
            }
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-md rounded-md px-4 py-2.5 text-sm",
                    m.role === "user"
                      ? "rounded-tr-none bg-elevated text-text-muted"
                      : "rounded-tl-none border border-ember/30 bg-ember/5 text-text"
                  )}
                >
                  {m.text}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {thinking && (
          <div className="flex justify-start">
            <div className="rounded-md rounded-tl-none border border-ember/30 bg-ember/5 px-4 py-3">
              <ThinkingIndicator />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-hairline pt-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask the mentor…"
          className="flex-1 rounded-md border border-hairline bg-surface px-3.5 py-2.5 text-sm text-text placeholder:text-text-faint focus:outline-none focus:border-ember"
        />
        <button
          onClick={send}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-ember text-void hover:bg-ember-glow"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
