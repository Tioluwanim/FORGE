"use client";

import { useState } from "react";
import { Lightbulb, MessageSquareCode, Send } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { ThinkingIndicator } from "@/components/motion/loading-state";
import { aiMentorApi } from "@/lib/api";
import { ApiError } from "@/lib/api-client";
import { cn } from "@/lib/cn";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

interface MentorContext {
  challengeId?: string;
  challengeTitle?: string;
  challengeDescription?: string;
  currentCode?: string;
  lastTestSummary?: string;
}

interface MentorPanelProps {
  hints: string[];
  context?: MentorContext;
}

export function MentorPanel({ hints, context }: MentorPanelProps) {
  const [revealed, setRevealed] = useState(0);
  const [hintLoading, setHintLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  function revealNextHint() {
    setHintLoading(true);
    // The hint text itself is already curated per-challenge content, so
    // there's nothing to fetch — this pause is just enough for the reveal
    // not to feel instant, not a stand-in for a real request.
    setTimeout(() => {
      setHintLoading(false);
      setRevealed((r) => Math.min(r + 1, hints.length));
    }, 400);
  }

  async function send() {
    if (!input.trim()) return;
    const userMessage: ChatMessage = { role: "user", text: input };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setThinking(true);
    setChatError(null);

    try {
      const { reply } = await aiMentorApi.chat({
        message: userMessage.text,
        challenge_id: context?.challengeId,
        challenge_title: context?.challengeTitle,
        challenge_description: context?.challengeDescription,
        current_code: context?.currentCode,
        last_test_result_summary: context?.lastTestSummary,
        conversation_history: nextMessages.map((m) => ({ role: m.role, content: m.text })),
      });
      setMessages((m) => [...m, { role: "assistant", text: reply }]);
    } catch (err) {
      setChatError(
        err instanceof ApiError && err.status === 501
          ? "Mentor chat isn't configured on this deployment yet."
          : "Couldn't reach the mentor — try again."
      );
    } finally {
      setThinking(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-hairline px-4 py-2.5">
        <MessageSquareCode className="h-3.5 w-3.5 text-ember" />
        <span className="font-mono text-xs uppercase tracking-wide text-text-muted">
          AI Mentor
        </span>
      </div>

      {context?.challengeTitle && (
        <div className="border-b border-hairline px-4 py-2.5">
          <p className="font-mono text-[10px] uppercase tracking-wide text-text-faint">
            Current mission
          </p>
          <p className="mt-0.5 truncate text-xs text-text-muted">{context.challengeTitle}</p>
          {context.lastTestSummary && (
            <p className="mt-1 truncate text-[11px] text-signal-warn">{context.lastTestSummary}</p>
          )}
        </div>
      )}

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {/* Progressive hints — a quick-access ladder before falling back to free-form chat */}
        <AnimatePresence initial={false}>
          {hints.slice(0, revealed).map((h, i) => (
            <motion.div
              key={`hint-${i}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-md border border-ember/30 bg-ember/5 px-3 py-2.5 text-sm text-text"
            >
              <span className="mr-1.5 font-mono text-[10px] uppercase tracking-wide text-ember">
                Hint {i + 1}
              </span>
              {h}
            </motion.div>
          ))}
        </AnimatePresence>
        {hintLoading && (
          <div className="flex items-center gap-2 px-1 py-1.5">
            <ThinkingIndicator />
          </div>
        )}
        {revealed === 0 && !hintLoading && messages.length === 0 && (
          <p className="text-sm text-text-faint">
            Stuck? Ask for a hint before reaching for the solution — hints get more
            specific each time. Or ask the mentor a direct question below.
          </p>
        )}

        {/* Free-form chat, aware of the mission/code/test context above */}
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={`msg-${i}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-md px-3 py-2 text-sm",
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
            <div className="rounded-md rounded-tl-none border border-ember/30 bg-ember/5 px-3 py-2">
              <ThinkingIndicator />
            </div>
          </div>
        )}
        {chatError && <p className="text-center text-xs text-signal-fail">{chatError}</p>}
      </div>

      <div className="border-t border-hairline p-3 space-y-2">
        <Button
          variant="secondary"
          className="w-full justify-center"
          disabled={revealed >= hints.length || hintLoading}
          onClick={revealNextHint}
        >
          <Lightbulb className="h-3.5 w-3.5" />
          {revealed === 0
            ? "Get a hint"
            : revealed >= hints.length
            ? "No more hints"
            : "Get another hint"}
        </Button>
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask the mentor…"
            className="flex-1 rounded-md border border-hairline bg-surface px-3 py-2 text-sm text-text placeholder:text-text-faint focus:outline-none focus:border-ember"
          />
          <button
            onClick={send}
            disabled={thinking || !input.trim()}
            aria-label="Send message"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-ember text-void hover:bg-ember-glow disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
