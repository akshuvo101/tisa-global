"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, HeartHandshake, LoaderCircle, MapPinned, Save, UserRound } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  phone: string | null;
  country: string | null;
  city: string | null;
  nationality: string | null;
  passport_expiry: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  preferred_contact_channel: "email" | "phone" | "whatsapp";
};

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const { profile: authProfile, refreshProfile } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [nationality, setNationality] = useState("");
  const [passportExpiry, setPassportExpiry] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [preferredChannel, setPreferredChannel] = useState<"email" | "phone" | "whatsapp">("email");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      setLoading(true);
      setError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace("/login");
        return;
      }

      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url, phone, country, city, nationality, passport_expiry, emergency_contact_name, emergency_contact_phone, preferred_contact_channel")
        .eq("id", user.id)
        .single();

      if (!mounted) return;

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }

      setProfile(data);
      setFullName(data.full_name ?? "");
      setPhone(data.phone ?? "");
      setCountry(data.country ?? "");
      setCity(data.city ?? "");
      setNationality(data.nationality ?? "");
      setPassportExpiry(data.passport_expiry ?? "");
      setEmergencyName(data.emergency_contact_name ?? "");
      setEmergencyPhone(data.emergency_contact_phone ?? "");
      setPreferredChannel(data.preferred_contact_channel ?? "email");
      setLoading(false);
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [router, supabase]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const trimmedName = fullName.trim();

    if (!trimmedName) {
      setError("Please enter your full name.");
      return;
    }

    if (trimmedName.length < 2) {
      setError("Your name must be at least 2 characters.");
      return;
    }

    setSaving(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("Your session has expired. Please log in again.");
      setSaving(false);
      return;
    }

    const { data, error: updateError } = await supabase
      .from("profiles")
      .update({
        full_name: trimmedName,
        phone: phone.trim() || null,
        country: country.trim() || null,
        city: city.trim() || null,
        nationality: nationality.trim() || null,
        passport_expiry: passportExpiry || null,
        emergency_contact_name: emergencyName.trim() || null,
        emergency_contact_phone: emergencyPhone.trim() || null,
        preferred_contact_channel: preferredChannel,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select("id, full_name, email, avatar_url, phone, country, city, nationality, passport_expiry, emergency_contact_name, emergency_contact_phone, preferred_contact_channel")
      .single();

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    setProfile(data);
    setFullName(data.full_name ?? "");
    setSuccess("Profile updated successfully.");
    setSaving(false);

    await refreshProfile();
    router.refresh();
  }

  if (loading) {
    return (
      <main className="portal-page min-h-screen bg-background text-foreground">
        <div className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center px-6">
          <p className="text-sm text-muted">
            Loading your profile...
          </p>
        </div>
      </main>
    );
  }

  const email = profile?.email ?? "No email available";

  return (
    <main className="portal-page min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-6 py-10 lg:px-8">
        {/* Header */}
        <div className="mb-7">
          <Link
            href={authProfile?.role === "admin" ? "/admin" : "/account"}
            className="text-sm text-muted transition hover:text-foreground"
          >
            ← Back to {authProfile?.role === "admin" ? "dashboard" : "account"}
          </Link>

          <div className="mt-7 rounded-[22px] border border-border bg-surface/90 p-5 shadow-[0_14px_36px_rgba(1,9,17,0.12)] sm:p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">YOUR TRAVEL PROFILE</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              A little about you <span aria-hidden="true">👋</span>
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
              Keep your details current so the TISA team can coordinate your travel more smoothly.
            </p>
          </div>
        </div>

        {/* Profile card */}
        <section className="rounded-[22px] border border-border bg-surface/90 p-4 shadow-[0_12px_34px_rgba(1,9,17,0.12)] sm:p-6 lg:p-8">
          {/* Avatar */}
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-primary-soft text-xl font-semibold text-primary">
              {profile?.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.full_name ?? "Profile"}
                  width={64}
                  height={64}
                  unoptimized
                  className="h-16 w-16 object-cover"
                />
              ) : (
                (profile?.full_name?.charAt(0) || "T").toUpperCase()
              )}
            </div>

            <div>
              <p className="font-medium">
                {profile?.full_name || "Traveler"}
              </p>

              <p className="mt-1 text-xs text-muted">Your profile details are used to support your requests.</p>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
            >
              <span aria-hidden="true">!</span>
              {error}
            </div>
          )}

          {success && (
            <div
              role="status"
              className="mb-5 flex items-center gap-2 rounded-xl border border-secondary/20 bg-secondary-soft px-4 py-3 text-sm text-secondary"
            >
              <Check aria-hidden="true" className="h-4 w-4" />
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="space-y-5 rounded-2xl border border-border bg-background/30 p-4 sm:p-5">
              <div className="mb-4 flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-soft text-primary"><UserRound aria-hidden="true" className="h-4 w-4" /></span>
                <div><h2 className="text-sm font-semibold">Personal details</h2><p className="mt-0.5 text-[11px] text-muted">Your name and best way to reach you</p></div>
              </div>
            {/* Full name */}
            <div>
              <label
                htmlFor="fullName"
                className="mb-2 block text-sm font-medium"
              >
                Full name
              </label>

              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Enter your full name"
                autoComplete="name"
                disabled={saving}
                className="w-full rounded-xl border border-white/10 bg-background px-4 py-3 text-sm outline-none transition placeholder:text-muted focus:border-primary/50 focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="phone" className="mb-2 block text-sm font-medium">Phone</label>
                <input id="phone" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" disabled={saving} className="w-full rounded-xl border border-white/10 bg-background px-4 py-3 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10" />
              </div>
              <div>
                <label htmlFor="nationality" className="mb-2 block text-sm font-medium">Nationality</label>
                <input id="nationality" type="text" value={nationality} onChange={(event) => setNationality(event.target.value)} autoComplete="country-name" disabled={saving} className="w-full rounded-xl border border-white/10 bg-background px-4 py-3 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10" />
              </div>
              <div>
                <label htmlFor="country" className="mb-2 block text-sm font-medium">Country of residence</label>
                <input id="country" type="text" value={country} onChange={(event) => setCountry(event.target.value)} autoComplete="country-name" disabled={saving} className="w-full rounded-xl border border-white/10 bg-background px-4 py-3 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10" />
              </div>
              <div>
                <label htmlFor="city" className="mb-2 block text-sm font-medium">City</label>
                <input id="city" type="text" value={city} onChange={(event) => setCity(event.target.value)} autoComplete="address-level2" disabled={saving} className="w-full rounded-xl border border-white/10 bg-background px-4 py-3 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10" />
              </div>
            </div>
            </section>

            <section className="rounded-2xl border border-border bg-background/30 p-4 sm:p-5">
              <div className="mb-4 flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-400/10 text-emerald-700 dark:text-emerald-200"><MapPinned aria-hidden="true" className="h-4 w-4" /></span>
                <div><h2 className="text-sm font-semibold">Travel readiness</h2><p className="mt-0.5 text-[11px] text-muted">Helpful details for travel coordination</p></div>
              </div>
              <p className="mb-4 rounded-xl border border-amber-400/15 bg-amber-400/[0.06] px-3 py-2.5 text-xs leading-5 text-muted">Do not upload passport scans here; sensitive travel documents belong in the secure request document workspace.</p>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="passportExpiry" className="mb-2 block text-sm font-medium">Passport expiry</label>
                  <input id="passportExpiry" type="date" value={passportExpiry} onChange={(event) => setPassportExpiry(event.target.value)} disabled={saving} className="w-full rounded-xl border border-white/10 bg-background px-4 py-3 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10" />
                </div>
                <div>
                  <label htmlFor="preferredChannel" className="mb-2 block text-sm font-medium">Preferred contact</label>
                  <select id="preferredChannel" value={preferredChannel} onChange={(event) => setPreferredChannel(event.target.value as "email" | "phone" | "whatsapp")} disabled={saving} className="w-full rounded-xl border border-white/10 bg-background px-4 py-3 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10">
                    <option value="email">Email</option><option value="phone">Phone</option><option value="whatsapp">WhatsApp</option>
                  </select>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-background/30 p-4 sm:p-5">
              <div className="mb-4 flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-rose-400/10 text-rose-700 dark:text-rose-200"><HeartHandshake aria-hidden="true" className="h-4 w-4" /></span>
                <div><h2 className="text-sm font-semibold">Emergency contact</h2><p className="mt-0.5 text-[11px] text-muted">Optional contact in case it is needed</p></div>
              </div>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div><label htmlFor="emergencyName" className="mb-2 block text-sm font-medium">Name</label><input id="emergencyName" type="text" value={emergencyName} onChange={(event) => setEmergencyName(event.target.value)} disabled={saving} className="w-full rounded-xl border border-white/10 bg-background px-4 py-3 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10" /></div>
                <div><label htmlFor="emergencyPhone" className="mb-2 block text-sm font-medium">Phone</label><input id="emergencyPhone" type="tel" value={emergencyPhone} onChange={(event) => setEmergencyPhone(event.target.value)} disabled={saving} className="w-full rounded-xl border border-white/10 bg-background px-4 py-3 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10" /></div>
              </div>
            </section>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                disabled
                className="w-full cursor-not-allowed rounded-xl border border-white/10 bg-background/60 px-4 py-3 text-sm text-muted"
              />

              <p className="mt-2 text-xs text-muted">
                Email changes will be handled separately through
                Supabase Auth.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 border-t border-white/8 pt-6 sm:flex-row sm:justify-end">
              <Link
                href="/account"
                className="rounded-xl border border-white/10 px-5 py-3 text-center text-sm font-medium transition hover:bg-white/5"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_8px_18px_rgba(89,217,232,0.15)] transition hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transform-none"
              >
                {saving ? <><LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin motion-reduce:animate-none" />Saving changes...</> : <><Save aria-hidden="true" className="h-4 w-4" />Save changes</>}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}