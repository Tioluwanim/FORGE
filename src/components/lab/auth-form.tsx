"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Github, Chrome } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/api";
import { setToken, ApiError } from "@/lib/api-client";

interface AuthFormProps {
  mode: "login" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const isLogin = mode === "login";
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { access_token } = isLogin
        ? await authApi.login(email, password)
        : await authApi.signup(email, password, displayName);
      setToken(access_token);
      router.push(isLogin ? "/dashboard" : "/select-language");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-md border border-hairline bg-surface p-7">
      <h1 className="font-display text-xl font-medium text-text">
        {isLogin ? "Sign in" : "Create your account"}
      </h1>
      <p className="mt-1.5 text-sm text-text-muted">
        {isLogin ? "Continue where you left off." : "Start with a language, not a syllabus."}
      </p>

      <div className="mt-6 flex flex-col gap-2.5">
        <Button variant="secondary" className="w-full justify-center" type="button" disabled>
          <Chrome className="h-4 w-4" />
          Continue with Google
        </Button>
        <Button variant="secondary" className="w-full justify-center" type="button" disabled>
          <Github className="h-4 w-4" />
          Continue with GitHub
        </Button>
      </div>
      <p className="mt-1.5 text-center text-[11px] text-text-faint">
        OAuth needs client credentials configured on the backend — see .env.example.
      </p>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-hairline" />
        <span className="font-mono text-[10px] uppercase tracking-wide text-text-faint">
          or
        </span>
        <div className="h-px flex-1 bg-hairline" />
      </div>

      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        {!isLogin && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="displayName" className="text-xs text-text-muted">
              Display name
            </label>
            <input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              placeholder="Your name"
              className="rounded-md border border-hairline bg-elevated px-3 py-2 text-sm text-text placeholder:text-text-faint focus:outline-none focus:border-ember"
            />
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-xs text-text-muted">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className="rounded-md border border-hairline bg-elevated px-3 py-2 text-sm text-text placeholder:text-text-faint focus:outline-none focus:border-ember"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-xs text-text-muted">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            placeholder="••••••••"
            className="rounded-md border border-hairline bg-elevated px-3 py-2 text-sm text-text placeholder:text-text-faint focus:outline-none focus:border-ember"
          />
        </div>
        {error && <p className="text-xs text-signal-fail">{error}</p>}
        <Button variant="primary" className="mt-2 w-full justify-center" type="submit" disabled={loading}>
          {loading ? "Please wait…" : isLogin ? "Sign in" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-faint">
        {isLogin ? "New to FORGE?" : "Already have an account?"}{" "}
        <Link
          href={isLogin ? "/signup" : "/login"}
          className="text-text-muted hover:text-text"
        >
          {isLogin ? "Create an account" : "Sign in"}
        </Link>
      </p>
    </div>
  );
}
