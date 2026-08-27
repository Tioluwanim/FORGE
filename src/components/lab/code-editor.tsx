"use client";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  filename?: string;
}

export function filenameForLanguage(language: "python" | "javascript" | "java") {
  return language === "python" ? "solution.py" : language === "javascript" ? "solution.js" : "Solution.java";
}

/**
 * Placeholder editor matching the Monaco layout/chrome. Swap the body of this
 * component for a `next/dynamic` import of `@monaco-editor/react` (ssr: false)
 * once dependencies are installed — see forge-architecture-plan.md §3.2 for why
 * that import must stay isolated to this route.
 */
export function CodeEditor({ value, onChange, filename = "solution.py" }: CodeEditorProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-md border border-hairline bg-[#0D0D0F]">
      <div className="flex items-center gap-2 border-b border-hairline bg-surface px-4 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-signal-fail/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-signal-warn/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-signal-pass/60" />
        <span className="ml-2 font-mono text-xs text-text-faint">{filename}</span>
      </div>
      <textarea
        spellCheck={false}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 resize-none bg-transparent p-4 font-mono text-sm leading-relaxed text-text focus:outline-none"
        style={{ tabSize: 4 }}
      />
    </div>
  );
}
