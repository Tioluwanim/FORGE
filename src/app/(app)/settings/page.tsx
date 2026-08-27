import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SettingsGeneralPage() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Primary Language</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="text-sm text-text">Python</p>
            <p className="mt-0.5 text-xs text-text-faint">
              Your default track for roadmap and dashboard views.
            </p>
          </div>
          <Button variant="secondary" size="sm">
            Change
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Plan</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <Badge tone="ember">Free</Badge>
          <Button variant="primary" size="sm">
            Upgrade to Pro
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <p className="text-sm text-text-muted">Delete your account and all progress.</p>
          <Button variant="danger" size="sm">
            Delete account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
