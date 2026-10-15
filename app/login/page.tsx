"use client";

import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import { createClient } from "@/lib/supabase/client";
import { getPostAuthPath, isApplicationRole } from "@/lib/auth/roles";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="h-screen overflow-hidden bg-background" />
      }
    >
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [error, setError] = useState("");

  const callbackError =
    searchParams.get("error") === "auth_callback_failed" ||
    searchParams.get("error") === "profile_unavailable" ||
    searchParams.get("error") === "invalid_role"
      ? "Sign-in could not be completed. Please try again."
      : "";

  const visibleError = error || callbackError;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
        error: loginError,
      } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (loginError) {
        setError(loginError.message);
        setLoading(false);
        return;
      }

      if (!user) {
        setError("Sign-in could not be completed. Please try again.");
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (
        profileError ||
        !profile ||
        !isApplicationRole(profile.role)
      ) {
        console.error("Login profile lookup failed:", profileError);
        const { error: signOutError } = await supabase.auth.signOut();
        setError(
          signOutError
            ? "We couldn't verify your account or securely end this session. Please try again."
            : "We couldn't verify your account permissions. Please contact support.",
        );
        setLoading(false);
        return;
      }

      const destination = getPostAuthPath(
        profile.role,
        searchParams.get("redirect"),
        window.location.origin,
      );

      router.replace(destination);
      router.refresh();
    } catch (loginError) {
      console.error("Login request failed:", loginError);
      setError("Unable to complete sign-in. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setGoogleLoading(true);

    const redirectPath = searchParams.get("redirect") ?? "/account";

    try {
      const { error: googleError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${
            window.location.origin
          }/auth/callback?next=${encodeURIComponent(redirectPath)}`,
        },
      });

      if (googleError) {
        setError(googleError.message);
        setGoogleLoading(false);
      }
    } catch (googleError) {
      console.error("Google sign-in request failed:", googleError);
      setError("Unable to connect to Google. Please try again.");
      setGoogleLoading(false);
    }
  };

  const isBusy = loading || googleLoading;

  return (
    <main className="h-screen overflow-hidden bg-background text-white">
      <Navbar />

      <section className="relative flex h-[calc(100vh-64px)] min-h-0 items-center justify-center overflow-hidden px-4 py-4 sm:px-6">
        {/* Ambient background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.07] blur-[120px]" />

          <div className="absolute -left-24 top-1/4 h-52 w-52 rounded-full bg-cyan-400/[0.035] blur-[100px]" />

          <div className="absolute -right-24 bottom-1/4 h-52 w-52 rounded-full bg-blue-500/[0.035] blur-[100px]" />
        </div>

        <div className="relative z-10 w-full max-w-[430px]">
          {/* Brand / heading */}
          <div className="mb-5 text-center">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.045] text-base text-primary shadow-lg shadow-black/10">
              ✦
            </div>

            <h1 className="text-2xl font-semibold tracking-tight sm:text-[27px]">
              Welcome back
            </h1>

            <p className="mx-auto mt-1.5 max-w-sm text-xs leading-5 text-muted sm:text-sm">
              Sign in to continue planning your journey with TISA Global.
            </p>
          </div>

          {/* Login card */}
          <div className="rounded-[26px] border border-white/10 bg-surface/90 p-5 shadow-2xl shadow-black/25 backdrop-blur-xl sm:p-6">
            {visibleError && (
              <div
                role="alert"
                className="mb-4 rounded-xl border border-red-400/20 bg-red-400/[0.08] px-3.5 py-2.5 text-xs leading-5 text-red-300"
              >
                {visibleError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-xs font-medium text-white sm:text-sm"
                >
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  disabled={isBusy}
                  className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.035] px-3.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-primary/50 focus:bg-white/[0.055] focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-xs font-medium text-white sm:text-sm"
                  >
                    Password
                  </label>

                  <Link
                    href="/forgot-password"
                    className="text-[11px] text-primary transition hover:text-primary/80 sm:text-xs"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    disabled={isBusy}
                    className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.035] px-3.5 pr-16 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-primary/50 focus:bg-white/[0.055] focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    disabled={isBusy}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-[11px] text-muted transition hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed sm:text-xs"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isBusy}
                className="flex h-11 w-full items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-slate-950 transition hover:bg-primary/90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            {/* Divider */}
            <div className="my-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />

              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-600">
                or
              </span>

              <div className="h-px flex-1 bg-white/10" />
            </div>

            {/* Google */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isBusy}
              className="flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.025] text-sm font-medium text-white transition hover:bg-white/[0.06] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] font-bold text-slate-900">
                G
              </span>

              {googleLoading
                ? "Connecting to Google..."
                : "Continue with Google"}
            </button>

            {/* Signup */}
            <p className="mt-5 text-center text-xs text-muted sm:text-sm">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-medium text-primary transition hover:text-primary/80"
              >
                Create an account
              </Link>
            </p>
          </div>

          {/* Footer note */}
          <p className="mt-3 text-center text-[10px] leading-4 text-slate-600 sm:text-[11px]">
            Securely access your trips, requests, documents, quotes, and travel
            updates.
          </p>
        </div>
      </section>
    </main>
  );
}