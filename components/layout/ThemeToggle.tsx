"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "dark" | "light";

const themeChangedEvent = "tisa-theme-changed";

function getThemeSnapshot(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function subscribeToTheme(callback: () => void) {
  window.addEventListener(themeChangedEvent, callback);
  return () => window.removeEventListener(themeChangedEvent, callback);
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, () => "dark");

  function toggleTheme() {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    window.dispatchEvent(new Event(themeChangedEvent));

    try {
      window.localStorage.setItem("tisa-theme", nextTheme);
    } catch (error) {
      console.error("Unable to save the TISA theme preference:", error);
    }
  }

  const label = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      aria-pressed={theme === "light"}
      title={label}
      className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border bg-surface/80 text-foreground transition hover:bg-surface-light active:scale-95"
    >
      {theme === "dark" ? (
        <Sun aria-hidden="true" className="h-[18px] w-[18px]" />
      ) : (
        <Moon aria-hidden="true" className="h-[18px] w-[18px]" />
      )}
    </button>
  );
}
