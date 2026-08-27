import { Check, X, Clock } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/cn";
import { motionTokens } from "@/lib/motion-tokens";

export interface TestResult {
  name: string;
  passed: boolean;
  durationMs?: number;
  message?: string;
  hidden?: boolean;
}

export function TestResultRow({ name, passed, durationMs, message, hidden }: TestResult) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 border-b border-hairline px-4 py-2.5 last:border-b-0",
        !passed && "bg-signal-fail/[0.04]"
      )}
    >
      <div className="flex items-center gap-2.5">
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: motionTokens.durations.fast, ease: motionTokens.easing.standard }}
        >
          {passed ? (
            <Check className="h-3.5 w-3.5 shrink-0 text-signal-pass" />
          ) : (
            <X className="h-3.5 w-3.5 shrink-0 text-signal-fail" />
          )}
        </motion.span>
        <span
          className={cn(
            "flex-1 truncate font-mono text-sm",
            passed ? "text-text-muted" : "text-text"
          )}
        >
          {hidden ? "Hidden test" : name}
        </span>
        {typeof durationMs === "number" && (
          <span className="flex items-center gap-1 font-mono text-xs text-text-faint">
            <Clock className="h-3 w-3" />
            {durationMs}ms
          </span>
        )}
      </div>
      {!passed && message && (
        <p className="ml-6 font-mono text-xs text-signal-fail/80">{message}</p>
      )}
    </div>
  );
}

export function TestResultsPanel({
  results,
}: {
  results: TestResult[];
}) {
  const passedCount = results.filter((r) => r.passed).length;
  return (
    <div className="overflow-hidden rounded-md border border-hairline bg-surface">
      <div className="flex items-center justify-between border-b border-hairline px-4 py-2.5">
        <span className="font-mono text-xs uppercase tracking-wide text-text-muted">
          Tests
        </span>
        <span
          className={cn(
            "font-mono text-xs",
            passedCount === results.length ? "text-signal-pass" : "text-text-muted"
          )}
        >
          {passedCount} / {results.length} passed
        </span>
      </div>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: motionTokens.stagger.tight } } }}
      >
        {results.map((r) => (
          <motion.div
            key={r.name}
            variants={{
              hidden: { opacity: 0, x: -8 },
              visible: { opacity: 1, x: 0, transition: { duration: motionTokens.durations.fast } },
            }}
          >
            <TestResultRow {...r} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
