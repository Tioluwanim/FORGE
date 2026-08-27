import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MasteryRing } from "@/components/ui/mastery-ring";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { TRACKS, WEAK_AREAS, TODAYS_PRACTICE, PROJECTS } from "@/lib/mock-data";

export default function DashboardPage() {
  const currentProject = PROJECTS[1];
  const doneCount = currentProject.milestones.filter((m) => m.done).length;

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
              <p className="mt-1.5 font-display text-lg text-text">Async Python</p>
            </div>
            <Badge tone="ember">Recommended</Badge>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted">
                You&rsquo;re learning: Concurrency vs Parallelism
              </p>
              <p className="mt-2 font-mono text-xs text-text-faint">Mastery: 68%</p>
            </div>
            <div className="flex items-center gap-4">
              <MasteryRing value={68} size={64} strokeWidth={5} />
              <Link href="/learn/event-loop">
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
            <p className="font-display text-3xl text-ember">LEVEL 4</p>
            <p className="text-sm text-text-muted">System Builder</p>
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
            {WEAK_AREAS.map((w) => (
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
            {TODAYS_PRACTICE.map((p) => (
              <Link
                key={p.id}
                href={p.type === "code" || p.type === "debug" ? `/challenge/${p.id}` : "/practice"}
                className="flex items-center justify-between rounded px-2 py-1.5 -mx-2 hover:bg-elevated"
              >
                <span className="text-sm text-text-muted">{p.title}</span>
                <span className="font-mono text-xs text-text-faint">{p.estMinutes}m</span>
              </Link>
            ))}
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
              <p className="font-display text-3xl text-text">
                <AnimatedNumber value={12} />
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
            <Badge tone="info">{currentProject.difficulty}</Badge>
          </CardHeader>
          <CardContent>
            <p className="font-display text-base text-text">{currentProject.title}</p>
            <p className="mt-1 text-sm text-text-muted">{currentProject.description}</p>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-elevated">
              <div
                className="h-full rounded-full bg-ember"
                style={{ width: `${(doneCount / currentProject.milestones.length) * 100}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="font-mono text-xs text-text-faint">
                {doneCount} / {currentProject.milestones.length} milestones
              </span>
              <Link
                href={`/projects/${currentProject.id}`}
                className="text-xs text-text-muted hover:text-text"
              >
                View project →
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Language tracks */}
        <Card>
          <CardHeader>
            <CardTitle>Language Tracks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {TRACKS.map((t) => (
              <div key={t.language}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text">{t.label}</span>
                  <span className="font-mono text-xs text-text-faint">
                    {t.status === "not_started" ? "Not started" : `${t.pct}%`}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-elevated">
                  <div
                    className="h-full rounded-full bg-ember"
                    style={{ width: `${t.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
