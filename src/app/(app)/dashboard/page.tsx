"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, TrendingDown } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MasteryRing } from "@/components/ui/mastery-ring";
import { LoadingState } from "@/components/motion/loading-state";
import { ErrorState } from "@/components/motion/error-state";
import { useAuth } from "@/lib/use-auth";
import { resolveContinueHref } from "@/lib/next-action";
import {
  progressApi,
  projectsApi,
  reviewsApi,
  type DashboardResponse,
  type ProjectSummary,
  type ReviewOut,
  type TrackResponse,
} from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const { user, tracks, loading: authLoading } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [reviews, setReviews] = useState<ReviewOut[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [startingMission, setStartingMission] = useState(false);

  function load() {
    setLoadingData(true);
    setLoadError(false);
    Promise.all([progressApi.dashboard(), projectsApi.list(), reviewsApi.list()])
      .then(([d, p, r]) => {
        setDashboard(d);
        setProjects(p);
        setReviews(r);
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoadingData(false));
  }

  useEffect(() => {
    if (authLoading || !user) return;
    load();
  }, [authLoading, user]);

  if (authLoading || loadingData) {
    return <LoadingState context="default" />;
  }

  if (loadError) {
    return <ErrorState message="Couldn't load your dashboard." onRetry={load} />;
  }

  const currentProject = projects[0];
  const hasMission = !!dashboard?.current_mission_concept;
  const bottleneck = dashboard?.weak_areas?.[0] ?? null;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  async function startMission() {
    if (!dashboard?.current_mission_concept) {
      router.push("/roadmap");
      return;
    }
    setStartingMission(true);
    // The dashboard endpoint only gives us the concept's title, not its id —
    // resolveContinueHref matches on title as a fallback in that case.
    const href = await resolveContinueHref(dashboard.current_mission_concept, dashboard.current_mission_concept);
    router.push(href);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Greeting — orientation, not decoration */}
      <div>
        <h1 className="font-display text-2xl font-medium text-text">
          {greeting}
          {user?.display_name ? `, ${user.display_name}` : ""}.
        </h1>
        {tracks.length > 0 && (
          <p className="mt-1 font-mono text-xs uppercase tracking-widest text-ember">
            {tracks.find((t) => t.is_primary)?.label ?? tracks[0].label} · Level {user?.engineering_level ?? 1}
          </p>
        )}
      </div>

      {/* CURRENT MISSION — this dominates the page. Everything else is
          secondary weight, on purpose (spec: dashboard must answer "what
          should I do right now", not present a grid of equal-weight cards). */}
      <div className="relative overflow-hidden rounded-lg border border-ember/30 bg-gradient-to-br from-surface to-elevated p-6 sm:p-8">
        <div className="forge-seam absolute left-0 top-0 h-[2px] w-full" />
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="font-mono text-xs uppercase tracking-widest text-ember">
                Current Mission
              </p>
              {hasMission && <Badge tone="ember">In progress</Badge>}
            </div>
            <p className="mt-2 font-display text-2xl font-medium text-text sm:text-3xl">
              {dashboard?.current_mission_concept ?? "Pick your first concept"}
            </p>
            <p className="mt-2 max-w-md text-sm text-text-muted">
              {hasMission
                ? "Pick up where you left off."
                : "Your roadmap is ready — choose a concept to start building mastery."}
            </p>
            <Button
              variant="primary"
              size="lg"
              className="mt-6"
              onClick={startMission}
              disabled={startingMission}
            >
              {startingMission
                ? "Loading…"
                : hasMission
                ? "Continue Mission"
                : "Open Roadmap"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          {dashboard?.current_mission_pct != null && (
            <MasteryRing value={dashboard.current_mission_pct} size={96} strokeWidth={6} label="Mastery" />
          )}
        </div>
      </div>

      {/* Secondary layer — bottleneck + reviews due, side by side, clearly
          lighter weight than the mission card above. */}
      <div className="grid gap-5 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current Bottleneck</CardTitle>
            {bottleneck && <TrendingDown className="h-4 w-4 text-signal-warn" />}
          </CardHeader>
          <CardContent>
            {bottleneck ? (
              <>
                <p className="font-display text-base text-text">{bottleneck.concept}</p>
                <p className="mt-1 text-sm text-text-muted">
                  Mastery here is your weakest, at {bottleneck.pct}%.
                </p>
                <Link
                  href={`/practice?concept=${encodeURIComponent(bottleneck.concept)}`}
                  className="mt-3 inline-flex items-center gap-1 text-sm text-ember hover:underline"
                >
                  Practice this <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            ) : (
              <p className="text-sm text-text-faint">
                Nothing weak yet — keep going and this will surface real gaps.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reviews Due</CardTitle>
            {reviews.length > 0 && <Badge tone="warn">{reviews.length}</Badge>}
          </CardHeader>
          <CardContent className="space-y-2.5">
            {reviews.length === 0 ? (
              <p className="text-sm text-text-faint">Nothing due today.</p>
            ) : (
              <>
                {reviews.slice(0, 3).map((r) => (
                  <div key={r.id} className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">{r.concept}</span>
                    <span className="font-mono text-xs text-text-faint">{r.due_in}</span>
                  </div>
                ))}
                <Link
                  href="/reviews"
                  className="inline-flex items-center gap-1 pt-1 text-sm text-ember hover:underline"
                >
                  Review now <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tertiary layer — current project + other tracks. Lowest visual weight. */}
      <div className="grid gap-5 sm:grid-cols-2">
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
              <div>
                <p className="text-sm text-text-faint">No project started yet.</p>
                <Link href="/projects" className="mt-2 inline-flex items-center gap-1 text-sm text-ember hover:underline">
                  Browse projects <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Language Tracks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tracks.length === 0 ? (
              <p className="text-sm text-text-faint">No tracks yet.</p>
            ) : (
              tracks.map((t: TrackResponse) => (
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
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
