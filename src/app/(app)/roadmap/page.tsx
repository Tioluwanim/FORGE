"use client";

import { useEffect, useState } from "react";
import { ArrowDown } from "lucide-react";
import { RoadmapNode } from "@/components/lab/roadmap-node";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/motion/loading-state";
import { useAuth } from "@/lib/use-auth";
import { curriculumApi, type RoadmapNode as RoadmapNodeData } from "@/lib/api";

export default function RoadmapPage() {
  const { primaryTrack, loading: authLoading } = useAuth();
  const [nodes, setNodes] = useState<RoadmapNodeData[]>([]);
  const [loadingRoadmap, setLoadingRoadmap] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    if (authLoading || !primaryTrack) return;
    curriculumApi
      .roadmap(primaryTrack.id)
      .then((data) => {
        setNodes(data);
        setSelected(data.length ? 0 : null);
      })
      .finally(() => setLoadingRoadmap(false));
  }, [authLoading, primaryTrack]);

  if (authLoading || loadingRoadmap) return <LoadingState context="documentation" />;

  const node = selected !== null ? nodes[selected] : null;

  return (
    <div className="mx-auto flex max-w-5xl gap-8">
      <div className="flex-1">
        <p className="font-mono text-xs uppercase tracking-widest text-ember">
          {primaryTrack?.label ?? "Roadmap"}
        </p>
        <h1 className="mt-1 font-display text-2xl font-medium text-text">Roadmap</h1>

        {nodes.length === 0 ? (
          <p className="mt-6 text-sm text-text-faint">
            No curriculum seeded for this track yet — run the backend seed script.
          </p>
        ) : (
          <div className="mt-8 flex flex-col items-start">
            {nodes.map((n, i) => (
              <div key={n.concept_id} className="flex flex-col items-start">
                <RoadmapNode
                  title={n.title}
                  status={n.status}
                  masteryPct={n.mastery_pct ?? undefined}
                  onClick={() => setSelected(i)}
                />
                {i < nodes.length - 1 && (
                  <div className="flex h-8 w-64 items-center justify-center">
                    <ArrowDown className="h-3.5 w-3.5 text-text-faint" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="sticky top-8 h-fit w-80 shrink-0">
        {node ? (
          <Card>
            <CardHeader>
              <CardTitle>{node.title}</CardTitle>
              <Badge
                tone={
                  node.status === "mastered"
                    ? "pass"
                    : node.status === "weak"
                    ? "warn"
                    : node.status === "locked"
                    ? "neutral"
                    : "ember"
                }
              >
                {node.status.replace("_", " ")}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {node.mastery_pct != null && (
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">Mastery</span>
                    <span className="font-mono text-xs text-text-faint">{node.mastery_pct}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-elevated">
                    <div className="h-full rounded-full bg-ember" style={{ width: `${node.mastery_pct}%` }} />
                  </div>
                </div>
              )}
              <Button variant="primary" className="w-full justify-center" disabled={node.status === "locked"}>
                {node.status === "mastered" ? "Review" : "Continue"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <p className="text-sm text-text-faint">Select a node to see details.</p>
        )}
      </div>
    </div>
  );
}
