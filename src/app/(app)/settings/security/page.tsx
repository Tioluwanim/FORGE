"use client";

import { useEffect, useState } from "react";
import { Github, Chrome, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/motion/loading-state";
import { authApi, type MeResponse } from "@/lib/api";
import { ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/use-auth";

export default function SettingsSecurityPage() {
  const { loading: authLoading } = useAuth();
  const [me, setMe] = useState<MeResponse | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changing, setChanging] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    authApi.me().then(setMe);
  }, [authLoading]);

  async function changePassword() {
    setChanging(true);
    setPasswordMessage(null);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      setPasswordMessage({ text: "Password changed.", error: false });
      setCurrentPassword("");
      setNewPassword("");
      setShowPasswordForm(false);
    } catch (err) {
      setPasswordMessage({
        text: err instanceof ApiError ? err.message : "Couldn't change password.",
        error: true,
      });
    } finally {
      setChanging(false);
    }
  }

  if (!me || authLoading) return <LoadingState context="default" />;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
        </CardHeader>
        <CardContent>
          {!showPasswordForm ? (
            <div className="flex items-center justify-between">
              <p className="text-sm text-text-muted">
                {me.oauth_provider ? `Signed in via ${me.oauth_provider}` : "Change your password"}
              </p>
              <Button variant="secondary" size="sm" onClick={() => setShowPasswordForm(true)} disabled={!!me.oauth_provider}>
                Change password
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password"
                className="rounded-md border border-hairline bg-elevated px-3 py-2 text-sm text-text placeholder:text-text-faint focus:outline-none focus:border-ember"
              />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password (min 8 characters)"
                minLength={8}
                className="rounded-md border border-hairline bg-elevated px-3 py-2 text-sm text-text placeholder:text-text-faint focus:outline-none focus:border-ember"
              />
              {passwordMessage && (
                <p className={`text-xs ${passwordMessage.error ? "text-signal-fail" : "text-signal-pass"}`}>
                  {passwordMessage.text}
                </p>
              )}
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={changePassword}
                  disabled={changing || !currentPassword || newPassword.length < 8}
                >
                  {changing ? "Saving…" : "Save"}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowPasswordForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
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
            {me.oauth_provider === "github" ? (
              <Badge tone="pass">Connected</Badge>
            ) : (
              <Button variant="ghost" size="sm" disabled>
                Connect
              </Button>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-sm text-text">
              <Chrome className="h-4 w-4" /> Google
            </div>
            {me.oauth_provider === "google" ? (
              <Badge tone="pass">Connected</Badge>
            ) : (
              <Button variant="ghost" size="sm" disabled>
                Connect
              </Button>
            )}
          </div>
          <p className="text-[11px] text-text-faint">
            OAuth connect buttons are disabled until the backend has real Google/GitHub
            client credentials configured — see the backend&rsquo;s .env.example.
          </p>
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
                <p className="text-xs text-text-faint">{me.email}</p>
              </div>
            </div>
            <Badge tone="pass">Active</Badge>
          </div>
          <p className="text-[11px] text-text-faint">
            Per-session tracking isn&rsquo;t modeled on the backend yet — tokens are
            stateless JWTs, so &ldquo;sign out everywhere&rdquo; would need a revocation
            list to actually work.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
