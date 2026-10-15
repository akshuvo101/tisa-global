"use client";

import { useEffect, useState } from "react";
import {
  isDestinationSaved,
  removeSavedDestination,
  saveDestination,
} from "@/lib/saved-destinations";

type SaveDestinationButtonProps = {
  destinationId: string;
};

export default function SaveDestinationButton({
  destinationId,
}: SaveDestinationButtonProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadSavedState() {
      try {
        const saved = await isDestinationSaved(destinationId);

        if (isMounted) {
          setIsSaved(saved);
        }
      } catch (error) {
        console.error("Failed to load saved destination state:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadSavedState();

    return () => {
      isMounted = false;
    };
  }, [destinationId]);

  async function handleToggleSave() {
    if (isSaving) return;

    setIsSaving(true);

    try {
      if (isSaved) {
        await removeSavedDestination(destinationId);
        setIsSaved(false);
      } else {
        await saveDestination(destinationId);
        setIsSaved(true);
      }
    } catch (error) {
      console.error("Failed to update saved destination:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <button
        type="button"
        disabled
        aria-label="Checking saved destination"
        className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 text-sm font-medium text-slate-400"
      >
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-500 border-t-transparent" />
        Checking...
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggleSave}
      disabled={isSaving}
      aria-pressed={isSaved}
      aria-label={
        isSaved ? "Remove destination from saved" : "Save destination"
      }
      className={`inline-flex h-12 items-center justify-center gap-2 rounded-full border px-6 text-sm font-medium transition ${
        isSaved
          ? "border-sky-400/20 bg-sky-400/10 text-sky-300 hover:bg-sky-400/15"
          : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
      } ${isSaving ? "cursor-wait opacity-60" : ""}`}
    >
      <span className="text-base leading-none">
        {isSaved ? "★" : "☆"}
      </span>

      {isSaving
        ? isSaved
          ? "Removing..."
          : "Saving..."
        : isSaved
          ? "Saved"
          : "Save Destination"}
    </button>
  );
}