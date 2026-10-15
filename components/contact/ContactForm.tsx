
"use client";

import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  CheckCircle2,
  LoaderCircle,
  Send,
} from "lucide-react";

const assistanceOptions = [
  "Flights & Travel",
  "Visa & Documents",
  "Travel Packages",
  "Education & Conferences",
  "Medical Travel",
  "Other Assistance",
];

const fieldClass =
  "mt-2 w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-primary/60 focus:ring-2 focus:ring-primary/10";

const labelClass = "text-sm font-medium text-slate-200";

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    assistanceType: "",
    destination: "",
    message: "",
  });

  function updateField(
    field: keyof typeof form,
    value: string,
  ) {
    setForm((current) => ({ ...current, [field]: value }));
    setStatus(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to submit your enquiry.");
      }

      setStatus({
        type: "success",
        message:
          "Your enquiry has been submitted successfully. Thank you for contacting TISA Global.",
      });

      setForm({
        name: "",
        email: "",
        assistanceType: "",
        destination: "",
        message: "",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className={labelClass}>
            Full Name <span className="text-primary">*</span>
          </label>
          <input
            id="contact-name"
            name="name"
            autoComplete="name"
            required
            minLength={2}
            maxLength={100}
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            placeholder="Enter your full name"
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="contact-email" className={labelClass}>
            Email Address <span className="text-primary">*</span>
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            placeholder="you@example.com"
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact-type" className={labelClass}>
          Assistance Type <span className="text-primary">*</span>
        </label>
        <select
          id="contact-type"
          name="assistanceType"
          required
          value={form.assistanceType}
          onChange={(event) =>
            updateField("assistanceType", event.target.value)
          }
          className={`${fieldClass} [color-scheme:dark]`}
        >
          <option value="" disabled>
            Select a service
          </option>
          {assistanceOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="contact-destination" className={labelClass}>
          Destination
        </label>
        <input
          id="contact-destination"
          name="destination"
          maxLength={150}
          value={form.destination}
          onChange={(event) =>
            updateField("destination", event.target.value)
          }
          placeholder="e.g. Japan, Canada, United Kingdom"
          className={fieldClass}
        />
        <p className="mt-2 text-xs text-slate-500">
          Optional — tell us which country or destination you have in mind.
        </p>
      </div>

      <div>
        <label htmlFor="contact-message" className={labelClass}>
          Your Message <span className="text-primary">*</span>
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          minLength={10}
          maxLength={5000}
          rows={6}
          value={form.message}
          onChange={(event) => updateField("message", event.target.value)}
          placeholder="Tell us about your travel plans, requirements, or questions..."
          className={`${fieldClass} min-h-36 resize-y`}
        />
        <p className="mt-2 text-right text-xs text-slate-500">
          {form.message.length}/5000
        </p>
      </div>

      {status && (
        <div
          role={status.type === "success" ? "status" : "alert"}
          aria-live="polite"
          className={`flex items-start gap-3 rounded-xl border p-4 text-sm leading-6 ${
            status.type === "success"
              ? "border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-300"
              : "border-red-400/20 bg-red-400/[0.07] text-red-300"
          }`}
        >
          {status.type === "success" ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          ) : (
            <Send className="mt-0.5 h-5 w-5 shrink-0" />
          )}
          <p>{status.message}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="group flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? (
          <>
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Sending your enquiry...
          </>
        ) : (
          <>
            Send Message
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </>
        )}
      </button>

      <p className="text-center text-xs leading-6 text-slate-500">
        No account required. Please do not include passwords, payment card
        details, or other sensitive information in your message.
      </p>
    </form>
  );
}