
"use client";

import { useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  Globe2,
  SlidersHorizontal,
} from "lucide-react";

type PremiumSelectProps = {
  name: string;
  label: string;
  placeholder: string;
  value: string;
  options: string[];
  icon: "country" | "category";
};

export default function PremiumSelect({
  name,
  label,
  placeholder,
  value,
  options,
  icon,
}: PremiumSelectProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(value);
  const [highlighted, setHighlighted] = useState(-1);

  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const Icon = icon === "country" ? Globe2 : SlidersHorizontal;
  const selectedIndex = options.indexOf(selected);

  // Keep the selected option synchronized with the URL/filter value.
  useEffect(() => {
    setSelected(value);
  }, [value]);

  // Close the dropdown when clicking outside or pressing Escape.
  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setHighlighted(-1);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        setHighlighted(-1);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Keep the active option visible while navigating with the keyboard.
  useEffect(() => {
    if (!open || highlighted < 0) return;

    listRef.current
      ?.querySelector<HTMLElement>(`[data-option-index="${highlighted}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [highlighted, open]);

  function chooseOption(option: string) {
    setSelected(option);
    setOpen(false);
    setHighlighted(-1);
  }

  function toggleDropdown() {
    setOpen((current) => {
      if (!current) {
        setHighlighted(selectedIndex);
      }

      return !current;
    });
  }

  function handleListKeyDown(
    event: React.KeyboardEvent<HTMLDivElement>,
  ) {
    if (event.key === "ArrowDown") {
      event.preventDefault();

      setHighlighted((current) =>
        current < options.length - 1 ? current + 1 : -1,
      );
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      setHighlighted((current) =>
        current <= 0 ? options.length - 1 : current - 1,
      );
    }

    if (event.key === "Enter" && highlighted >= 0) {
      event.preventDefault();

      const option = options[highlighted];

      if (option !== undefined) {
        chooseOption(option);
      }
    }
  }

  return (
    <div ref={rootRef} className="relative min-w-0">
      {/* Submitted with the surrounding GET form */}
      <input type="hidden" name={name} value={selected} />

      {/* Dropdown trigger */}
      <button
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={toggleDropdown}
        onKeyDown={(event) => {
          if (
            event.key === "ArrowDown" ||
            event.key === "ArrowUp"
          ) {
            event.preventDefault();

            if (!open) {
              setOpen(true);
              setHighlighted(
                selectedIndex >= 0 ? selectedIndex : -1,
              );
            }
          }
        }}
        className={`group flex h-11 w-full min-w-0 items-center gap-2 rounded-xl border px-3 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
          open
            ? "border-primary/50 bg-primary/[0.04]"
            : "border-border/80 bg-background/70 hover:border-primary/35 hover:bg-surface"
        }`}
      >
        <Icon
          aria-hidden="true"
          className={`h-4 w-4 shrink-0 transition-colors duration-200 ${
            open || selected
              ? "text-primary"
              : "text-muted group-hover:text-primary"
          }`}
        />

        <span
          className={`min-w-0 flex-1 truncate text-sm ${
            selected ? "text-foreground" : "text-muted"
          }`}
        >
          {selected || placeholder}
        </span>

        <ChevronDown
          aria-hidden="true"
          className={`h-3.5 w-3.5 shrink-0 text-muted transition-all duration-200 group-hover:text-primary ${
            open ? "rotate-180 text-primary" : ""
          }`}
        />
      </button>

      {/* Dropdown panel */}
      <div
        className={`absolute left-0 right-0 top-[calc(100%+8px)] z-[70] origin-top rounded-2xl border border-border/80 bg-background/95 p-1.5 shadow-[0_18px_50px_rgba(15,23,42,0.16)] backdrop-blur-2xl transition-all duration-200 motion-reduce:transition-none dark:shadow-[0_18px_50px_rgba(0,0,0,0.4)] ${
          open
            ? "visible translate-y-0 scale-100 opacity-100"
            : "invisible -translate-y-1.5 scale-[0.98] opacity-0"
        }`}
      >
        <div
          ref={listRef}
          role="listbox"
          aria-label={label}
          aria-activedescendant={
            highlighted >= 0
              ? `${name}-option-${highlighted}`
              : undefined
          }
          tabIndex={open ? 0 : -1}
          onKeyDown={handleListKeyDown}
          className="max-h-60 overflow-y-auto overscroll-contain outline-none"
        >
          {/* Reset option */}
          <button
            id={`${name}-option-reset`}
            type="button"
            role="option"
            aria-selected={!selected}
            onClick={() => chooseOption("")}
            onMouseEnter={() => setHighlighted(-1)}
            className={`flex min-h-9 w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-xs transition-colors duration-150 ${
              !selected
                ? "bg-primary/[0.09] font-semibold text-primary"
                : "text-muted hover:bg-primary/[0.06] hover:text-foreground"
            }`}
          >
            <span>{placeholder}</span>

            {!selected && (
              <Check aria-hidden="true" className="h-3.5 w-3.5" />
            )}
          </button>

          {/* Available options */}
          {options.map((option, index) => {
            const isSelected = selected === option;
            const isHighlighted = highlighted === index;

            return (
              <button
                key={option}
                id={`${name}-option-${index}`}
                data-option-index={index}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => chooseOption(option)}
                onMouseEnter={() => setHighlighted(index)}
                className={`group/item flex min-h-9 w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-xs transition-all duration-150 motion-reduce:transition-none ${
                  isSelected
                    ? "bg-primary/[0.10] font-semibold text-primary"
                    : isHighlighted
                      ? "translate-x-0.5 bg-primary/[0.06] text-foreground"
                      : "text-muted hover:translate-x-0.5 hover:bg-primary/[0.06] hover:text-foreground"
                }`}
              >
                <span className="truncate">{option}</span>

                {isSelected && (
                  <Check
                    aria-hidden="true"
                    className="h-3.5 w-3.5 shrink-0 text-primary"
                  />
                )}
              </button>
            );
          })}

          {options.length === 0 && (
            <p className="px-3 py-4 text-center text-xs text-muted">
              No options available
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
