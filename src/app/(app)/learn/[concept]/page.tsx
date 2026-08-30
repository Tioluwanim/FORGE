"use client";

import { useEffect, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { use } from "react";
import { ExternalLink, Clock, Check, MessageSquareCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/motion/loading-state";
import { ErrorState } from "@/components/motion/error-state";
import { curriculumApi, type ConceptDetail } from "@/lib/api";
import { ApiError } from "@/lib/api-client";

export default function ConceptPage({
  params,
}: {
  params: Promise<{ concept: string }>;
}) {
  const { concept: slug } = use(params);
  const [concept, setConcept] = useState<ConceptDetail | null>(null);
  const [notFoundFlag, setNotFoundFlag] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [understood, setUnderstood] = useState(false);
  const router = useRouter();

  function load() {
    setLoadError(false);
    curriculumApi
      .concept(slug)
      .then(setConcept)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) setNotFoundFlag(true);
        else setLoadError(true);
      });
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (notFoundFlag) notFound();
  if (loadError) return <ErrorState message="Couldn't load this concept." onRetry={load} />;
  if (!concept) return <LoadingState context="documentation" />;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-ember">
            {concept.module}
          </p>
          <h1 className="mt-1 font-display text-2xl font-medium text-text">
            {concept.title}
          </h1>
        </div>
        <a
          href={`/ai-mentor?prefill=${encodeURIComponent(`Can you help me understand ${concept.title}?`)}`}
          className="mt-1 flex shrink-0 items-center gap-1.5 whitespace-nowrap text-xs text-text-faint hover:text-ember"
        >
          <MessageSquareCode className="h-3.5 w-3.5" />
          Ask mentor
        </a>
      </div>

      {concept.doc_url && (
        <a
          href={concept.doc_url}
          target="_blank"
          rel="noreferrer"
          className="mt-5 flex items-center justify-between rounded-md border border-hairline bg-surface px-4 py-3.5 hover:border-text-faint"
        >
          <span className="flex items-center gap-2 text-sm text-text">
            <ExternalLink className="h-3.5 w-3.5" />
            Official documentation
          </span>
          <span className="flex items-center gap-1.5 font-mono text-xs text-text-faint">
            <Clock className="h-3.5 w-3.5" />
            {concept.est_minutes} min
          </span>
        </a>
      )}

      {concept.focus.length > 0 && (
        <div className="mt-6 rounded-md border border-hairline bg-surface p-5">
          <p className="font-mono text-[10px] uppercase tracking-wide text-text-faint">
            Focus on
          </p>
          <ul className="mt-2 space-y-1.5">
            {concept.focus.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-text-muted">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ember" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}

      {concept.summary && (
        <div className="mt-6">
          <p className="font-mono text-[10px] uppercase tracking-wide text-text-faint">
            In your own words
          </p>
          <p className="mt-2 text-sm leading-relaxed text-text-muted">
            {concept.summary}
          </p>
        </div>
      )}

      <div className="mt-8 flex items-center gap-3">
        <Button
          variant={understood ? "secondary" : "primary"}
          onClick={() => setUnderstood(true)}
        >
          {understood ? (
            <>
              <Check className="h-4 w-4" /> Marked as understood
            </>
          ) : (
            "Mark as understood"
          )}
        </Button>
        {understood && (
          <Button variant="primary" onClick={() => router.push(`/practice?concept=${encodeURIComponent(concept.id)}`)}>
            Take knowledge check →
          </Button>
        )}
      </div>
      {understood && (
        <p className="mt-3 text-xs text-text-faint">
          Marking this understood doesn&rsquo;t mean mastery — the knowledge check
          decides that.
        </p>
      )}
    </div>
  );
}
