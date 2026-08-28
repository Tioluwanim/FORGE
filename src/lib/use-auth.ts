"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authApi, tracksApi, type MeResponse, type TrackResponse } from "@/lib/api";
import { getToken, clearToken, ApiError } from "@/lib/api-client";

interface AuthState {
  user: MeResponse | null;
  tracks: TrackResponse[];
  primaryTrack: TrackResponse | null;
  loading: boolean;
  error: string | null;
}

/**
 * Loads the current user + tracks on mount. Redirects to /login if there's
 * no token or it's expired/invalid. Use in any (app) page that needs real
 * data — see src/app/(app)/dashboard/page.tsx for the reference usage.
 */
export function useAuth(): AuthState {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    tracks: [],
    primaryTrack: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!getToken()) {
        router.replace("/login");
        return;
      }
      try {
        const [user, tracks] = await Promise.all([authApi.me(), tracksApi.list()]);
        if (cancelled) return;
        setState({
          user,
          tracks,
          primaryTrack: tracks.find((t) => t.is_primary) ?? tracks[0] ?? null,
          loading: false,
          error: null,
        });
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          clearToken();
          router.replace("/login");
          return;
        }
        setState((s) => ({ ...s, loading: false, error: (err as Error).message }));
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return state;
}
