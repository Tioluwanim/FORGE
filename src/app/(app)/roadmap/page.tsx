"use client";

import { useState } from "react";
import { ArrowDown } from "lucide-react";
import { RoadmapNode } from "@/components/lab/roadmap-node";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROADMAP } from "@/lib/mock-data";

export default function RoadmapPage() {
  const [selected, setSelected] = useState<number | null>(2);
  const node = selected !== null ? ROADMAP[selected] : null;

  return (
    <div className="mx-auto flex max-w-5xl gap-8">
      <div className="flex-1">
        <p className="font-mono text-xs uppercase tracking-widest text-ember">
          Python Backend Engineering
        </p>
        <h1 className="mt-1 font-display text-2xl font-medium text-text">Roadmap</h1>

        <div className="mt-8 flex flex-col items-start">
          {ROADMAP.map((n, i) => (
            <div key={n.title} className="flex flex-col items-start">
              <RoadmapNode
                title={n.title}
                status={n.status}
                masteryPct={n.masteryPct}
                onClick={() => setSelected(i)}
              />
              {i < ROADMAP.length - 1 && (
                <div className="flex h-8 w-64 items-center justify-center">
                  <ArrowDown className="h-3.5 w-3.5 text-text-faint" />
                </div>
              )}
            </div>
          ))}
        </div>
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
              {typeof node.masteryPct === "number" && (
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">Mastery</span>
                    <span className="font-mono text-xs text-text-faint">
                      {node.masteryPct}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-elevated">
                    <div
                      className="h-full rounded-full bg-ember"
                      style={{ width: `${node.masteryPct}%` }}
                    />
                  </div>
                </div>
              )}
              <p className="text-sm text-text-muted">
                Concepts, documentation, exercises, and projects for this node open
                here once connected to real curriculum data.
              </p>
              <Button
                variant="primary"
                className="w-full justify-center"
                disabled={node.status === "locked"}
              >
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
