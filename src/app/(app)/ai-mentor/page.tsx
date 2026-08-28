"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, MessageSquareCode } from "lucide-react";
import { ThinkingIndicator } from "@/components/motion/loading-state";
import { aiMentorApi } from "@/lib/api";
import { ApiError } from "@/lib/api-client";
import { cn } from "@/lib/cn";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

export default function AiMentorPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);

  async function send() {
    if (!input.trim()) return;
    const userMessage: ChatMessage = { role: "user", text: input };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setThinking(true);
    setConfigError(null);

    try {
      const { reply } = await aiMentorApi.chat({
        message: userMessage.text,
        conversation_history: nextMessages.map((m) => ({ role: m.role, content: m.text })),
      });
      setMessages((m) => [...m, { role: "assistant", text: reply }]);
    } catch (err) {
      if (err instanceof ApiError && err.status === 501) {
        setConfigError("AI Mentor isn't configured on the backend yet — add ANTHROPIC_API_KEY to .env.");
      } else {
        setConfigError("Something went wrong reaching the mentor. Try again.");
      }
    } finally {
      setThinking(false);
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-2xl flex-col">
      <div className="flex items-center gap-2 border-b border-hairline pb-4">
        <MessageSquareCode className="h-4 w-4 text-ember" />
        <div>
          <p className="font-display text-lg text-text">AI Mentor</p>
          <p className="text-xs text-text-faint">Ask about anything you&rsquo;re working on</p>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto py-4">
        {messages.length === 0 && !thinking && (
          <p className="text-center text-sm text-text-faint">
            Ask a question about a concept, a bug, or a design decision.
          </p>
        )}
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
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
          ))}
        </AnimatePresence>
        {thinking && (
          <div className="flex justify-start">
            <div className="rounded-md rounded-tl-none border border-ember/30 bg-ember/5 px-4 py-3">
              <ThinkingIndicator />
            </div>
          </div>
        )}
        {configError && (
          <p className="text-center text-xs text-signal-fail">{configError}</p>
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
