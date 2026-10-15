"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { isApplicationRole, type ApplicationRole } from "@/lib/auth/roles";

type AuthProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: ApplicationRole;
};

type AuthContextValue = {
  user: User | null;
  profile: AuthProfile | null;
  loading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);
  const userId = useRef<string | null>(null);

  const loadProfile = useCallback(
    async (id: number, targetUserId: string) => {
      try {
        const { data, error: profileError } = await supabase
          .from("profiles")
          .select("id, full_name, email, avatar_url, role")
          .eq("id", targetUserId)
          .maybeSingle();

        if (id !== requestId.current || userId.current !== targetUserId) {
          return;
        }

        if (profileError) {
          console.error("Auth profile lookup failed:", profileError);
          setProfile(null);
          setError("Your profile could not be loaded. Please try again.");
        } else if (!data || !isApplicationRole(data.role)) {
          setProfile(null);
          setError(
            "Your account profile is unavailable. Please contact support.",
          );
        } else {
          setProfile(data);
          setError(null);
        }
      } catch (profileError) {
        if (id !== requestId.current || userId.current !== targetUserId) {
          return;
        }

        console.error("Auth profile request failed:", profileError);
        setProfile(null);
        setError("Your profile could not be loaded. Please try again.");
      } finally {
        if (id === requestId.current && userId.current === targetUserId) {
          setLoading(false);
        }
      }
    },
    [supabase],
  );

  const refreshProfile = useCallback(async () => {
    const id = userId.current;
    if (!id) {
      return;
    }

    const nextRequestId = ++requestId.current;
    setLoading(true);
    await loadProfile(nextRequestId, id);
  }, [loadProfile]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      userId.current = nextUser?.id ?? null;
      setUser(nextUser);
      setError(null);

      const id = ++requestId.current;

      if (!nextUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setProfile(null);
      setLoading(true);
      window.setTimeout(() => {
        void loadProfile(id, nextUser.id);
      }, 0);
    });

    return () => {
      requestId.current += 1;
      subscription.unsubscribe();
    };
  }, [loadProfile, supabase]);

  const value = useMemo(
    () => ({ user, profile, loading, error, refreshProfile }),
    [user, profile, loading, error, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}
