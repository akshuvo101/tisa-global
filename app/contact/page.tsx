
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ContactForm from "@/components/contact/ContactForm";
import {
  Globe2,
  ShieldCheck,
  MessageCircle,
  Plane,
  FileCheck2,
  GraduationCap,
  Stethoscope,
  ArrowUpRight,
} from "lucide-react";

const assistanceTypes = [
  { icon: Plane, title: "Flights & Travel" },
  { icon: FileCheck2, title: "Visa & Documents" },
  { icon: Globe2, title: "Travel Packages" },
  { icon: GraduationCap, title: "Education & Conferences" },
  { icon: Stethoscope, title: "Medical Travel" },
  { icon: MessageCircle, title: "Other Assistance" },
];

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Compact Page Heading */}
      <section className="relative isolate border-b border-white/[0.08]">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-36 left-1/2 h-72 w-[600px] -translate-x-1/2 rounded-full bg-primary/[0.10] blur-[110px]" />
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:28px_28px] opacity-20" />
        </div>

        <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.07] px-3.5 py-1.5 text-xs font-medium text-primary sm:text-sm">
              <MessageCircle className="h-4 w-4" />
              Contact TISA Global
            </div>

            <h1 className="mt-5 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              Let&apos;s plan your next journey.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted sm:text-base sm:leading-8">
              Have questions about travel, visas, or international services?
              Tell us what you need and send an enquiry directly to our team.
              No account required.
            </p>

            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2.5 text-xs text-muted sm:text-sm">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                No login required
              </span>

              <span className="inline-flex items-center gap-2">
                <Globe2 className="h-4 w-4 text-primary" />
                International travel assistance
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form + Assistance Information */}
      <section className="mx-auto max-w-7xl px-6 py-10 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
        <div className="grid items-start gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
          {/* Left Column */}
          <aside className="lg:sticky lg:top-24">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary sm:text-sm">
              How We Can Help
            </p>

            <h2 className="mt-3 text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl">
              What do you need help with?
            </h2>

            <p className="mt-4 text-sm leading-7 text-muted sm:text-base">
              Choose the service that best matches your requirements and
              explain your plans in the form. Providing clear details helps
              us understand your enquiry.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {assistanceTypes.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="group flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3.5 transition duration-200 hover:border-primary/25 hover:bg-white/[0.045]"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/10 bg-primary/[0.08] text-primary transition group-hover:bg-primary/[0.14]">
                      <Icon className="h-[18px] w-[18px]" />
                    </div>

                    <span className="text-sm font-medium text-slate-200">
                      {item.title}
                    </span>

                    <ArrowUpRight className="ml-auto h-4 w-4 text-slate-600 transition group-hover:text-primary" />
                  </div>
                );
              })}
            </div>

            {/* Reassurance Card */}
            <div className="mt-5 rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.07] to-transparent p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Simple and accessible
                  </h3>

                  <p className="mt-1.5 text-sm leading-6 text-muted">
                    Contact us without creating an account. Just provide
                    your name, email, and enquiry details.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Column: Existing Working Contact Form */}
          <div
            id="contact-form"
            className="scroll-mt-24 rounded-2xl border border-white/[0.09] bg-slate-950/50 p-5 shadow-2xl shadow-black/10 sm:rounded-3xl sm:p-7 lg:p-9"
          >
            <div className="mb-7 border-b border-white/[0.07] pb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary sm:text-sm">
                Send an Enquiry
              </p>

              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Tell us what you need.
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted">
                Fill in the details below. Fields marked with * are required.
              </p>
            </div>

            <ContactForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}
