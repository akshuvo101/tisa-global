
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";

import { AuthProvider } from "@/components/auth/AuthProvider";
import GlobalTravelBackground from "@/components/layout/GlobalTravelBackground";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://tisa-global.vercel.app"
  ),

  title: {
    default: "TISA Global — Your International Journey, Handled With Care.",
    template: "%s | TISA Global",
  },

  description:
    "TISA Global provides international travel assistance for conferences, visas, flights, medical travel, education, packages, and custom journeys.",

  keywords: [
    "TISA Global",
    "international travel services",
    "conference travel",
    "visa assistance",
    "medical tourism",
    "student travel",
    "flight assistance",
  ],

  authors: [{ name: "TISA Global" }],

  applicationName: "TISA Global",

  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      {
        url: "/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },

  manifest: "/site.webmanifest",

  openGraph: {
    type: "website",
    siteName: "TISA Global",
    title: "TISA Global — Your International Journey, Handled With Care.",
    description:
      "Explore international travel services, visa assistance, conferences, flights, and custom journeys with TISA Global.",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="min-h-screen bg-background text-foreground">
        <Script id="tisa-theme-init" strategy="beforeInteractive">
          {`try {
            var savedTheme = localStorage.getItem("tisa-theme");
            var initialTheme =
              savedTheme === "light" || savedTheme === "dark"
                ? savedTheme
                : matchMedia("(prefers-color-scheme: light)").matches
                  ? "light"
                  : "dark";

            document.documentElement.dataset.theme = initialTheme;
          } catch {
            document.documentElement.dataset.theme = "dark";
          }`}
        </Script>

        <GlobalTravelBackground />

        <div className="global-travel-content relative z-10 min-h-screen">
          <AuthProvider>{children}</AuthProvider>
        </div>
      </body>
    </html>
  );
}
