"use client";

import { useEffect, useState } from "react";
import { Search, ExternalLink } from "lucide-react";
import { LoadingState } from "@/components/motion/loading-state";
import { ErrorState } from "@/components/motion/error-state";
import { curriculumApi, type ConceptDetail } from "@/lib/api";

export default function DocumentationPage() {
  const [query, setQuery] = useState("");
  const [concepts, setConcepts] = useState<ConceptDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  function load() {
    setLoading(true);
    setLoadError(false);
    curriculumApi.concepts().then(setConcepts).catch(() => setLoadError(true)).finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <LoadingState context="documentation" />;
  if (loadError) return <ErrorState message="Couldn't load documentation." onRetry={load} />;

  const filtered = concepts.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-2xl">
      <p className="font-mono text-xs uppercase tracking-widest text-ember">
        Documentation
      </p>
      <h1 className="mt-1 font-display text-2xl font-medium text-text">Reference</h1>

      <div className="mt-5 flex items-center gap-2.5 rounded-md border border-hairline bg-surface px-3 py-2.5">
        <Search className="h-4 w-4 text-text-faint" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search documentation…"
          className="flex-1 bg-transparent text-sm text-text placeholder:text-text-faint focus:outline-none"
        />
      </div>

      <div className="mt-5 divide-y divide-hairline rounded-md border border-hairline bg-surface">
        {filtered.map((c) =>
          c.doc_url ? (
            <a
              key={c.slug}
              href={c.doc_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-4 py-3.5 hover:bg-elevated"
            >
              <div>
                <p className="text-sm text-text">{c.title}</p>
                <p className="mt-0.5 font-mono text-xs text-text-faint">{c.module}</p>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-text-faint" />
            </a>
          ) : (
            <div key={c.slug} className="flex items-center justify-between px-4 py-3.5">
              <div>
                <p className="text-sm text-text">{c.title}</p>
                <p className="mt-0.5 font-mono text-xs text-text-faint">{c.module}</p>
              </div>
              <span className="text-xs text-text-faint">No reference yet</span>
            </div>
          )
        )}
        {filtered.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-text-faint">
            No matches for &ldquo;{query}&rdquo;
          </p>
        )}
      </div>
    </div>
  );
}
