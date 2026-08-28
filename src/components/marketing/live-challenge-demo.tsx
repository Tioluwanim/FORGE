"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Lightbulb, Check, X, RotateCcw } from "lucide-react";
import { motionTokens } from "@/lib/motion-tokens";

const STARTER_CODE = `def is_palindrome(s: str) -> bool:
    cleaned = s.lower().replace(" ", "")
    # bug: this always returns True — it never checks
    # whether the string reads the same backwards
    return cleaned == cleaned
`;

const HINT = "You're comparing the string to itself. What do you need to compare it against — the same string, reversed?";

interface TestRow {
  name: string;
  passed: boolean;
}

function evaluate(code: string): TestRow[] {
  const fixed = /cleaned\s*==\s*cleaned\[::-1\]/.test(code) || /reversed\(/.test(code);
  return [
    { name: `is_palindrome("racecar") == True`, passed: fixed },
    { name: `is_palindrome("hello") == False`, passed: fixed },
    { name: `is_palindrome("A man a plan a canal Panama") == True`, passed: fixed },
  ];
}

export function LiveChallengeDemo() {
  const [code, setCode] = useState(STARTER_CODE);
  const [results, setResults] = useState<TestRow[] | null>(null);
  const [running, setRunning] = useState(false);
  const [hintShown, setHintShown] = useState(false);

  function runTests() {
    setRunning(true);
    setResults(null);
    setTimeout(() => {
      setResults(evaluate(code));
      setRunning(false);
    }, 650);
  }

  const allPassed = results?.every((r) => r.passed) ?? false;

  return (
    <div className="overflow-hidden rounded-md border border-hairline bg-[#0D0D0F]">
      <div className="flex items-center justify-between border-b border-hairline bg-surface px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-signal-fail/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-signal-warn/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-signal-pass/60" />
          <span className="ml-2 font-mono text-xs text-text-faint">is_palindrome.py</span>
        </div>
        <button
          onClick={() => {
            setCode(STARTER_CODE);
            setResults(null);
            setHintShown(false);
          }}
          className="flex items-center gap-1.5 rounded px-2 py-1 font-mono text-xs text-text-faint hover:text-text"
        >
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
      </div>

      <textarea
        spellCheck={false}
        value={code}
        onChange={(e) => {
          setCode(e.target.value);
          setResults(null);
        }}
        rows={7}
        className="w-full resize-none bg-transparent p-4 font-mono text-[13px] leading-relaxed text-text focus:outline-none"
        style={{ tabSize: 4 }}
      />

      <div className="border-t border-hairline p-3">
        <AnimatePresence mode="wait">
          {running ? (
            <motion.div
              key="running"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 px-1 py-2 font-mono text-xs text-text-faint"
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ember" />
              Running tests…
            </motion.div>
          ) : results ? (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-1.5"
            >
              {results.map((r, i) => (
                <motion.div
                  key={r.name}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-2 font-mono text-xs"
                >
                  {r.passed ? (
                    <Check className="h-3.5 w-3.5 shrink-0 text-signal-pass" />
                  ) : (
                    <X className="h-3.5 w-3.5 shrink-0 text-signal-fail" />
                  )}
                  <span className={r.passed ? "text-text-muted" : "text-text"}>{r.name}</span>
                </motion.div>
              ))}
              {allPassed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="pt-1 text-sm text-signal-pass"
                >
                  All tests passed. That&rsquo;s the loop — read, understand, implement, test.
                </motion.p>
              )}
            </motion.div>
          ) : (
            <motion.p key="empty" className="px-1 py-2 text-xs text-text-faint">
              Fix the bug, then run the tests.
            </motion.p>
          )}
        </AnimatePresence>

        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={runTests}
            disabled={running}
            className="flex items-center gap-1.5 rounded-md bg-ember px-3.5 py-1.5 text-xs font-medium text-void hover:bg-ember-glow disabled:opacity-50"
          >
            <Play className="h-3 w-3" /> {running ? "Running…" : "Run tests"}
          </button>
          <button
            onClick={() => setHintShown(true)}
            disabled={hintShown}
            className="flex items-center gap-1.5 rounded-md border border-hairline px-3.5 py-1.5 text-xs text-text-muted hover:border-text-faint disabled:opacity-40"
          >
            <Lightbulb className="h-3 w-3" /> Hint
          </button>
        </div>

        <AnimatePresence>
          {hintShown && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: motionTokens.durations.fast }}
              className="mt-2 rounded-md border border-ember/30 bg-ember/5 px-3 py-2 text-xs text-text"
            >
              {HINT}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
