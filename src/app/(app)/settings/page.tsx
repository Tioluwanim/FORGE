"use client";

import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/motion/loading-state";
import { useAuth } from "@/lib/use-auth";

export default function SettingsGeneralPage() {
  const router = useRouter();
  const { primaryTrack, loading } = useAuth();

  if (loading) return <LoadingState context="default" />;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Primary Language</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="text-sm text-text">{primaryTrack?.label ?? "No track yet"}</p>
            <p className="mt-0.5 text-xs text-text-faint">
              Your default track for roadmap and dashboard views.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => router.push("/select-language")}>
            Change
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Plan</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <Badge tone="ember">Free</Badge>
            <p className="mt-1.5 text-xs text-text-faint">Paid plans aren&rsquo;t available yet.</p>
          </div>
          <Button variant="secondary" size="sm" disabled>
            Upgrade to Pro
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="text-sm text-text-muted">Delete your account and all progress.</p>
            <p className="mt-1.5 text-xs text-text-faint">
              Self-serve deletion isn&rsquo;t available yet — this won&rsquo;t do anything until it is.
            </p>
          </div>
          <Button variant="danger" size="sm" disabled>
            Delete account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
