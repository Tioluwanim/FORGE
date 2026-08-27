import { Github, Chrome, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SettingsSecurityPage() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <p className="text-sm text-text-muted">Last changed 3 months ago</p>
          <Button variant="secondary" size="sm">
            Change password
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-sm text-text">
              <Github className="h-4 w-4" /> GitHub
            </div>
            <Badge tone="pass">Connected</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-sm text-text">
              <Chrome className="h-4 w-4" /> Google
            </div>
            <Button variant="ghost" size="sm">
              Connect
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-sm text-text">
              <Monitor className="h-4 w-4" />
              <div>
                <p>This device</p>
                <p className="text-xs text-text-faint">Lagos, NG · Chrome</p>
              </div>
            </div>
            <Badge tone="pass">Active</Badge>
          </div>
          <Button variant="danger" size="sm">
            Sign out all other sessions
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
