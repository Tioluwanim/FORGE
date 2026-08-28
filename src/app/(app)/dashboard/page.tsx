"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MasteryRing } from "@/components/ui/mastery-ring";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { LoadingState } from "@/components/motion/loading-state";
import { useAuth } from "@/lib/use-auth";
import { progressApi, projectsApi, type DashboardResponse, type ProjectSummary, type TrackResponse } from "@/lib/api";

export default function DashboardPage() {
  const { user, tracks, loading: authLoading } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (authLoading || !user) return;
    Promise.all([progressApi.dashboard(), projectsApi.list()])
      .then(([d, p]) => {
        setDashboard(d);
        setProjects(p);
      })
      .finally(() => setLoadingData(false));
  }, [authLoading, user]);

  if (authLoading || loadingData) {
    return <LoadingState context="default" />;
  }

  const currentProject = projects[0];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-ember">
          What should I learn next?
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Current Mission */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Current Mission</CardTitle>
              <p className="mt-1.5 font-display text-lg text-text">
                {dashboard?.current_mission_concept ?? "Pick your first concept"}
              </p>
            </div>
            <Badge tone="ember">Recommended</Badge>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted">
                {dashboard?.current_mission_concept
                  ? `You're learning: ${dashboard.current_mission_concept}`
                  : "Head to the roadmap to get started."}
              </p>
              {dashboard?.current_mission_pct != null && (
                <p className="mt-2 font-mono text-xs text-text-faint">
                  Mastery: {dashboard.current_mission_pct}%
                </p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <MasteryRing value={dashboard?.current_mission_pct ?? 0} size={64} strokeWidth={5} />
              <Link href="/roadmap">
                <Button variant="primary" size="sm">
                  Continue <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Engineering Level */}
        <Card>
          <CardHeader>
            <CardTitle>Engineering Level</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center gap-2 py-6 text-center">
            <p className="font-mono text-xs uppercase tracking-wide text-text-faint">
              Backend Engineering
            </p>
            <p className="font-display text-3xl text-ember">
              LEVEL {dashboard?.engineering_level ?? 1}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Weak Areas */}
        <Card>
          <CardHeader>
            <CardTitle>Weak Areas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(dashboard?.weak_areas ?? []).length === 0 && (
              <p className="text-sm text-text-faint">Nothing weak yet — keep going.</p>
            )}
            {dashboard?.weak_areas.map((w) => (
              <div key={w.concept} className="flex items-center justify-between">
                <span className="text-sm text-text-muted">{w.concept}</span>
                <span className="font-mono text-xs text-signal-warn">{w.pct}%</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Today's Practice */}
        <Card>
          <CardHeader>
            <CardTitle>Today&rsquo;s Practice</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/practice" className="flex items-center justify-between rounded px-2 py-1.5 -mx-2 hover:bg-elevated">
              <span className="text-sm text-text-muted">Knowledge checks</span>
              <span className="font-mono text-xs text-text-faint">~10m</span>
            </Link>
            <Link href="/roadmap" className="flex items-center justify-between rounded px-2 py-1.5 -mx-2 hover:bg-elevated">
              <span className="text-sm text-text-muted">Recommended challenge</span>
              <span className="font-mono text-xs text-text-faint">~15m</span>
            </Link>
          </CardContent>
        </Card>

        {/* Streak */}
        <Card>
          <CardHeader>
            <CardTitle>Learning Streak</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center gap-3 py-6">
            <Flame className="h-8 w-8 text-ember" />
            <div>
              {/* TODO: real streak needs a daily-activity table — not modeled
                  yet in the backend. Hardcoded until that exists. */}
              <p className="font-display text-3xl text-text">
                <AnimatedNumber value={0} />
              </p>
              <p className="text-xs text-text-faint">days in a row</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Current Project */}
        <Card>
          <CardHeader>
            <CardTitle>Current Project</CardTitle>
            {currentProject && <Badge tone="info">{currentProject.difficulty}</Badge>}
          </CardHeader>
          <CardContent>
            {currentProject ? (
              <>
                <p className="font-display text-base text-text">{currentProject.title}</p>
                <p className="mt-1 text-sm text-text-muted">{currentProject.description}</p>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-elevated">
                  <div
                    className="h-full rounded-full bg-ember"
                    style={{
                      width: `${
                        currentProject.milestones_total
                          ? (currentProject.milestones_done / currentProject.milestones_total) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-mono text-xs text-text-faint">
                    {currentProject.milestones_done} / {currentProject.milestones_total} milestones
                  </span>
                  <Link href={`/projects/${currentProject.id}`} className="text-xs text-text-muted hover:text-text">
                    View project →
                  </Link>
                </div>
              </>
            ) : (
              <p className="text-sm text-text-faint">No project started yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Language tracks */}
        <Card>
          <CardHeader>
            <CardTitle>Language Tracks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tracks.map((t: TrackResponse) => (
              <div key={t.language}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text">{t.label}</span>
                  <span className="font-mono text-xs text-text-faint">
                    {t.status === "not_started" ? "Not started" : `${t.pct}%`}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-elevated">
                  <div className="h-full rounded-full bg-ember" style={{ width: `${t.pct}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
