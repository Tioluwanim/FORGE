"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, MessageSquareCode } from "lucide-react";
import { ThinkingIndicator } from "@/components/motion/loading-state";

interface Msg {
  role: "user" | "mentor";
  text: string;
}

const OPENING: Msg[] = [
  { role: "mentor", text: "I see you're working on the palindrome fix above. Tests still failing?" },
];

const RULES: { match: RegExp; reply: string }[] = [
  {
    match: /error|fail|wrong|broken|bug/i,
    reply: "What does the function currently compare — and is that comparison ever capable of being false?",
  },
  {
    match: /reverse|backwards|\[::-1\]/i,
    reply: "Getting warmer. If you reverse the cleaned string, what would you compare it to?",
  },
  {
    match: /solution|answer|just tell me|give me/i,
    reply: "Not yet — you're close. Try comparing `cleaned` to its own reverse and run the tests again.",
  },
  {
    match: /why|how come/i,
    reply: "Because `cleaned == cleaned` is always true by definition — it's comparing a value to itself, not checking anything about the string's structure.",
  },
  {
    match: /thanks|thank you|got it|makes sense/i,
    reply: "That's the loop: read, think, implement, test, debug. Every lesson on FORGE works this way — not just this demo.",
  },
];

const FALLBACK = "Try describing what the test expects versus what your code actually returns — where's the first place they diverge?";

function craftReply(userText: string): string {
  const rule = RULES.find((r) => r.match.test(userText));
  return rule?.reply ?? FALLBACK;
}

export function MentorPreviewDemo() {
  const [messages, setMessages] = useState<Msg[]>(OPENING);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  function send() {
    if (!input.trim()) return;
    const userMsg: Msg = { role: "user", text: input };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setThinking(true);
    setTimeout(() => {
      setThinking(false);
      setMessages((m) => [...m, { role: "mentor", text: craftReply(userMsg.text) }]);
    }, 700 + Math.random() * 500);
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-md border border-hairline bg-surface">
      <div className="flex items-center justify-between border-b border-hairline px-4 py-2.5">
        <div className="flex items-center gap-2">
          <MessageSquareCode className="h-3.5 w-3.5 text-ember" />
          <span className="font-mono text-xs uppercase tracking-wide text-text-muted">AI Mentor</span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-wide text-text-faint">Preview</span>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-2.5 overflow-y-auto p-4" style={{ maxHeight: 260 }}>
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-md px-3 py-2 text-xs leading-relaxed ${
                  m.role === "user"
                    ? "rounded-tr-none bg-elevated text-text-muted"
                    : "rounded-tl-none border border-ember/30 bg-ember/5 text-text"
                }`}
              >
                {m.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {thinking && (
          <div className="flex justify-start">
            <div className="rounded-md rounded-tl-none border border-ember/30 bg-ember/5 px-3 py-2.5">
              <ThinkingIndicator />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-hairline p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask why it's failing…"
          className="flex-1 rounded-md border border-hairline bg-elevated px-3 py-2 text-xs text-text placeholder:text-text-faint focus:outline-none focus:border-ember"
        />
        <button
          onClick={send}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-ember text-void hover:bg-ember-glow"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </div>
      <p className="border-t border-hairline px-4 py-2 text-[10px] text-text-faint">
        Scripted preview — the real AI Mentor reads your actual code and test results.
      </p>
    </div>
  );
}
