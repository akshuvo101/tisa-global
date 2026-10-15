"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { createClient } from "@/lib/supabase/client";
import { getPostAuthPath, isApplicationRole } from "@/lib/auth/roles";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setError("Please enter your full name.");
      return;
    }

    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!agreeToTerms) {
      setError("Please agree to the Terms and Privacy Policy.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            full_name: trimmedName,
          },
        },
      });

      if (signupError) {
        setError(signupError.message);
        setLoading(false);
        return;
      }

      /*
       * Email confirmation leaves the new user signed out until they confirm.
       */
      if (!data.session || !data.user) {
        setSuccess(
          "Account created successfully. Please check your email to confirm your account."
        );
        setLoading(false);

        setTimeout(() => {
          router.push("/login");
        }, 1800);

        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profileError || !profile || !isApplicationRole(profile.role)) {
        console.error("Signup profile lookup failed:", profileError);
        const { error: signOutError } = await supabase.auth.signOut();
        setError(
          signOutError
            ? "We couldn't verify your new account or securely end this session. Please try again."
            : "Your account was created, but its profile is not ready yet. Please sign in again or contact support.",
        );
        setLoading(false);
        return;
      }

      router.replace(
        getPostAuthPath(profile.role, null, window.location.origin),
      );
      router.refresh();
    } catch (signupError) {
      console.error("Signup request failed:", signupError);
      setError("Unable to create your account. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError("");
    setSuccess("");
    setGoogleLoading(true);

    try {
      const { error: googleError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=%2Faccount`,
        },
      });

      if (googleError) {
        setError(googleError.message);
        setGoogleLoading(false);
      }
    } catch (googleError) {
      console.error("Google signup request failed:", googleError);
      setError("Unable to connect to Google. Please try again.");
      setGoogleLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="relative flex min-h-[calc(100vh-72px)] items-center justify-center overflow-hidden px-6 py-12">
        {/* Background glow */}
        <div className="pointer-events-none absolute left-1/2 top-1/3 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />

        <div className="relative w-full max-w-md">
          {/* Header */}
          <div className="mb-7 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-xl">
              ✦
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-white">
              Create your account
            </h1>

            <p className="mt-3 text-sm leading-6 text-muted">
              Start planning smarter journeys with TISA Global.
            </p>
          </div>

          {/* Signup card */}
          <div className="rounded-3xl border border-white/10 bg-surface/90 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8">
            {/* Error */}
            {error && (
              <div
                role="alert"
                className="mb-5 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm leading-5 text-red-300"
              >
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div
                role="status"
                className="mb-5 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm leading-5 text-emerald-300"
              >
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full name */}
              <div>
                <label
                  htmlFor="fullName"
                  className="mb-2 block text-sm font-medium text-white"
                >
                  Full name
                </label>

                <input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Your full name"
                  disabled={loading}
                  className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-primary/50 focus:bg-white/[0.06] focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-white"
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
                  disabled={loading}
                  className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-primary/50 focus:bg-white/[0.06] focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-white"
                >
                  Password
                </label>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Create a password"
                    disabled={loading}
                    className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 pr-16 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-primary/50 focus:bg-white/[0.06] focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    disabled={loading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs text-muted transition hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium text-white"
                >
                  Confirm password
                </label>

                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    placeholder="Confirm your password"
                    disabled={loading}
                    className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 pr-16 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-primary/50 focus:bg-white/[0.06] focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((current) => !current)
                    }
                    disabled={loading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs text-muted transition hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed"
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Terms */}
              <label className="flex cursor-pointer items-start gap-3 pt-1 text-sm leading-5 text-muted">
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(event) =>
                    setAgreeToTerms(event.target.checked)
                  }
                  disabled={loading}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-white/[0.05] accent-sky-400"
                  required
                />

                <span>
                  I agree to TISA Global&apos;s{" "}
                  <Link
                    href="/terms"
                    className="text-primary transition hover:text-primary/80"
                  >
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="text-primary transition hover:text-primary/80"
                  >
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || googleLoading}
                className="mt-2 flex h-12 w-full items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-slate-950 transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-white/10" />

              <span className="text-xs text-slate-500">OR</span>

              <div className="h-px flex-1 bg-white/10" />
            </div>

            {/* Google */}
            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={loading || googleLoading}
              className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] text-sm font-medium text-white transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-slate-900">
                G
              </span>

              {googleLoading
                ? "Connecting to Google..."
                : "Continue with Google"}
            </button>

            {/* Login */}
            <p className="mt-7 text-center text-sm text-muted">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-primary transition hover:text-primary/80"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Bottom note */}
          <p className="mt-6 text-center text-xs leading-5 text-slate-500">
            Create your TISA Global account to save trips, destinations, and
            personalized travel plans.
          </p>
        </div>
      </section>
    </main>
  );
}