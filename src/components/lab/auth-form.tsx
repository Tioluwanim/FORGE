"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Github, Chrome } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AuthFormProps {
  mode: "login" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const isLogin = mode === "login";
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStatus(null);
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      setStatus("Demo account verified. Choose your primary language to continue.");
      router.push("/select-language");
    }, 650);
  }

  function demoProvider(provider: string) {
    setError(null);
    setStatus(`${provider} sign-in is available in the demo environment only.`);
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
        <Button variant="secondary" className="w-full justify-center" type="button" onClick={() => demoProvider("Google")}>
          <Chrome className="h-4 w-4" />
          Continue with Google
        </Button>
        <Button variant="secondary" className="w-full justify-center" type="button" onClick={() => demoProvider("GitHub")}>
          <Github className="h-4 w-4" />
          Continue with GitHub
        </Button>
      </div>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-hairline" />
        <span className="font-mono text-[10px] uppercase tracking-wide text-text-faint">
          or
        </span>
        <div className="h-px flex-1 bg-hairline" />
      </div>

      <form className="flex flex-col gap-3" onSubmit={submit} noValidate>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-xs text-text-muted">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
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
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="rounded-md border border-hairline bg-elevated px-3 py-2 text-sm text-text placeholder:text-text-faint focus:outline-none focus:border-ember"
          />
        </div>
        <Button variant="primary" className="mt-2 w-full justify-center" type="submit">
          {submitting ? "Verifying…" : isLogin ? "Sign in" : "Create account"}
        </Button>
        {error && <p className="text-sm text-signal-fail" role="alert">{error}</p>}
        {status && <p className="text-sm text-signal-pass" role="status">{status}</p>}
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
