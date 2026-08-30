"use client";

import dynamic from "next/dynamic";
import { LoadingState } from "@/components/motion/loading-state";

// Monaco touches `window` at import time, so it's isolated to a dynamic,
// SSR-disabled import — never pulled into the server bundle.
const Monaco = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <LoadingState context="default" className="h-full" />,
});

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  filename?: string;
  readOnly?: boolean;
}

function languageForFilename(filename: string): string {
  if (filename.endsWith(".py")) return "python";
  if (filename.endsWith(".ts") || filename.endsWith(".tsx")) return "typescript";
  if (filename.endsWith(".js") || filename.endsWith(".jsx")) return "javascript";
  if (filename.endsWith(".java")) return "java";
  if (filename.endsWith(".json")) return "json";
  return "plaintext";
}

export function CodeEditor({ value, onChange, filename = "solution.py", readOnly = false }: CodeEditorProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-md border border-hairline bg-[#0D0D0F]">
      <div className="flex items-center gap-2 border-b border-hairline bg-surface px-4 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-signal-fail/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-signal-warn/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-signal-pass/60" />
        <span className="ml-2 font-mono text-xs text-text-faint">{filename}</span>
      </div>
      <div className="flex-1 overflow-hidden">
        <Monaco
          value={value}
          onChange={(v) => onChange(v ?? "")}
          language={languageForFilename(filename)}
          theme="vs-dark"
          options={{
            readOnly,
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            padding: { top: 12 },
            tabSize: 4,
            automaticLayout: true,
            renderLineHighlight: "gutter",
          }}
        />
      </div>
    </div>
  );
}
