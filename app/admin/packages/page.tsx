"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import Link from "next/link";

import { travelPackages } from "@/lib/data/packages";

type PackageAvailability = string;

function formatPrice(price: number, currency: string) {
    const symbol = currency === "BDT" ? "৳" : currency;

    return `${symbol} ${price.toLocaleString()}`;
}

function availabilityClasses(availability?: PackageAvailability) {
    const value = availability?.toLowerCase();

    if (value === "available") {
        return "border-emerald-400/15 bg-emerald-400/[0.07] text-emerald-300";
    }

    if (value?.includes("limited")) {
        return "border-amber-400/15 bg-amber-400/[0.07] text-amber-300";
    }

    if (value?.includes("sold")) {
        return "border-rose-400/15 bg-rose-400/[0.07] text-rose-300";
    }

    return "border-white/[0.08] bg-white/[0.03] text-slate-400";
}

function styleClasses(style: string) {
    switch (style.toLowerCase()) {
        case "budget":
            return "border-sky-400/15 bg-sky-400/[0.07] text-sky-300";

        case "balanced":
            return "border-violet-400/15 bg-violet-400/[0.07] text-violet-300";

        case "comfort":
            return "border-amber-400/15 bg-amber-400/[0.07] text-amber-300";

        default:
            return "border-white/[0.08] bg-white/[0.03] text-slate-400";
    }
}

export default function AdminPackagesPage() {
    const [search, setSearch] = useState("");
    const [destination, setDestination] = useState("");
    const [travelStyle, setTravelStyle] = useState("");
    const [availability, setAvailability] = useState("");
    const [featuredOnly, setFeaturedOnly] = useState(false);

    const destinations = useMemo(() => {
        return Array.from(
            new Set(travelPackages.map((item) => item.destination)),
        ).sort();
    }, []);

    const travelStyles = useMemo(() => {
        return Array.from(
            new Set(travelPackages.map((item) => item.travelStyle)),
        ).sort();
    }, []);

    const availabilityOptions = useMemo(() => {
        return Array.from(
            new Set(
                travelPackages
                    .map((item) => item.availability)
                    .filter((value): value is string => Boolean(value)),
            ),
        ).sort();
    }, []);

    const filteredPackages = useMemo(() => {
        const query = search.trim().toLowerCase();

        return travelPackages.filter((item) => {
            const matchesSearch =
                !query ||
                item.title.toLowerCase().includes(query) ||
                item.destination.toLowerCase().includes(query) ||
                item.country.toLowerCase().includes(query) ||
                item.departureCity.toLowerCase().includes(query) ||
                item.id.toLowerCase().includes(query);

            const matchesDestination =
                !destination || item.destination === destination;

            const matchesStyle =
                !travelStyle || item.travelStyle === travelStyle;

            const matchesAvailability =
                !availability || item.availability === availability;

            const matchesFeatured =
                !featuredOnly || item.featured === true;

            return (
                matchesSearch &&
                matchesDestination &&
                matchesStyle &&
                matchesAvailability &&
                matchesFeatured
            );
        });
    }, [
        search,
        destination,
        travelStyle,
        availability,
        featuredOnly,
    ]);

    const totalPackages = travelPackages.length;
    const featuredPackages = travelPackages.filter(
        (item) => item.featured,
    ).length;
    const availablePackages = travelPackages.filter(
        (item) => item.availability?.toLowerCase() === "available",
    ).length;
    const destinationCount = destinations.length;

    const hasFilters =
        Boolean(search) ||
        Boolean(destination) ||
        Boolean(travelStyle) ||
        Boolean(availability) ||
        featuredOnly;

    function clearFilters() {
        setSearch("");
        setDestination("");
        setTravelStyle("");
        setAvailability("");
        setFeaturedOnly(false);
    }

    return (
        <main className="min-w-0 w-full overflow-hidden">
            <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                {/* Header */}
                <section className="mb-7">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-600">
                                <span>Fulfillment</span>
                                <span className="text-slate-800">/</span>
                                <span className="text-slate-500">Packages</span>
                            </div>

                            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                                Travel Packages
                            </h1>

                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                                Manage and review the curated travel packages currently
                                available across the TISA Global public marketplace.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Link
                                href="/packages"
                                target="_blank"
                                className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 text-xs font-medium text-slate-400 transition hover:border-white/[0.14] hover:bg-white/[0.04] hover:text-white"
                            >
                                <span>↗</span>
                                <span>View marketplace</span>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Metrics */}
                <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        label="Total packages"
                        value={totalPackages}
                        hint="Curated catalog"
                        icon="▤"
                    />

                    <MetricCard
                        label="Featured"
                        value={featuredPackages}
                        hint="Highlighted packages"
                        icon="✦"
                    />

                    <MetricCard
                        label="Available"
                        value={availablePackages}
                        hint="Currently listed"
                        icon="✓"
                    />

                    <MetricCard
                        label="Destinations"
                        value={destinationCount}
                        hint="Unique destinations"
                        icon="◇"
                    />
                </section>

                {/* Filters */}
                <section className="mt-6 rounded-2xl border border-white/[0.07] bg-white/[0.018] p-4 sm:p-5">
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                            {/* Search */}
                            <div className="relative min-w-0 flex-1">
                                <span
                                    aria-hidden="true"
                                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-600"
                                >
                                    ⌕
                                </span>

                                <input
                                    type="search"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Search packages, destinations, countries..."
                                    className="h-11 w-full rounded-xl border border-white/[0.07] bg-[#080d15] pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-700 transition focus:border-sky-400/30"
                                />
                            </div>

                            {/* Featured toggle */}
                            <button
                                type="button"
                                onClick={() => setFeaturedOnly((value) => !value)}
                                className={[
                                    "inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border px-4 text-xs font-medium transition",
                                    featuredOnly
                                        ? "border-sky-400/20 bg-sky-400/10 text-sky-300"
                                        : "border-white/[0.07] bg-[#080d15] text-slate-500 hover:border-white/[0.12] hover:text-slate-300",
                                ].join(" ")}
                            >
                                <span>✦</span>
                                <span>Featured only</span>
                            </button>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                            <FilterSelect
                                label="Destination"
                                value={destination}
                                onChange={setDestination}
                                options={destinations}
                                placeholder="All destinations"
                            />

                            <FilterSelect
                                label="Travel style"
                                value={travelStyle}
                                onChange={setTravelStyle}
                                options={travelStyles}
                                placeholder="All styles"
                                capitalize
                            />

                            <FilterSelect
                                label="Availability"
                                value={availability}
                                onChange={setAvailability}
                                options={availabilityOptions}
                                placeholder="All availability"
                            />
                        </div>

                        {hasFilters && (
                            <div className="flex items-center justify-between border-t border-white/[0.06] pt-3">
                                <p className="text-xs text-slate-600">
                                    Showing{" "}
                                    <span className="text-slate-400">
                                        {filteredPackages.length}
                                    </span>{" "}
                                    of {totalPackages} packages
                                </p>

                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="text-xs font-medium text-sky-400 transition hover:text-white"
                                >
                                    Clear filters
                                </button>
                            </div>
                        )}
                    </div>
                </section>

                {/* Results header */}
                <section className="mt-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-700">
                            Package catalog
                        </p>

                        <h2 className="mt-1 text-lg font-semibold text-white">
                            {filteredPackages.length}{" "}
                            {filteredPackages.length === 1 ? "package" : "packages"}
                        </h2>
                    </div>

                    <p className="text-xs text-slate-600">
                        Public marketplace data
                    </p>
                </section>

                {/* Desktop table */}
                <section className="mt-4 hidden overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.015] lg:block">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1050px] text-left">
                            <thead className="border-b border-white/[0.06] bg-white/[0.015]">
                                <tr>
                                    <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-700">
                                        Package
                                    </th>
                                    <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-700">
                                        Destination
                                    </th>
                                    <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-700">
                                        Duration
                                    </th>
                                    <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-700">
                                        Price
                                    </th>
                                    <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-700">
                                        Style
                                    </th>
                                    <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-700">
                                        Availability
                                    </th>
                                    <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-700">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-white/[0.05]">
                                {filteredPackages.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="group transition hover:bg-white/[0.025]"
                                    >
                                        <td className="px-5 py-4">
                                            <div className="flex min-w-0 items-center gap-3">
                                                <div className="relative flex h-11 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.03]">
                                                    <Image
                                                        src={item.imageUrl}
                                                        alt=""
                                                        fill
                                                        sizes="56px"
                                                        quality={75}
                                                        className="object-cover"
                                                    />
                                                </div>

                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="truncate text-sm font-medium text-white">
                                                            {item.title}
                                                        </p>

                                                        {item.featured && (
                                                            <span
                                                                title="Featured"
                                                                className="shrink-0 text-[11px] text-sky-400"
                                                            >
                                                                ✦
                                                            </span>
                                                        )}
                                                    </div>

                                                    <p className="mt-0.5 truncate text-[11px] text-slate-600">
                                                        {item.id}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-4 py-4">
                                            <p className="text-sm text-slate-300">
                                                {item.destination}
                                            </p>
                                            <p className="mt-0.5 text-[11px] text-slate-600">
                                                {item.country}
                                            </p>
                                        </td>

                                        <td className="px-4 py-4">
                                            <p className="text-sm text-slate-300">
                                                {item.durationDays} days
                                            </p>
                                            <p className="mt-0.5 text-[11px] text-slate-600">
                                                {item.durationNights} nights
                                            </p>
                                        </td>

                                        <td className="px-4 py-4">
                                            <p className="text-sm font-medium text-white">
                                                {formatPrice(item.price, item.currency)}
                                            </p>
                                            {item.pricePerPerson && (
                                                <p className="mt-0.5 text-[11px] text-slate-600">
                                                    per person
                                                </p>
                                            )}
                                        </td>

                                        <td className="px-4 py-4">
                                            <span
                                                className={[
                                                    "inline-flex rounded-full border px-2.5 py-1 text-[10px] font-medium capitalize",
                                                    styleClasses(item.travelStyle),
                                                ].join(" ")}
                                            >
                                                {item.travelStyle}
                                            </span>
                                        </td>

                                        <td className="px-4 py-4">
                                            <span
                                                className={[
                                                    "inline-flex rounded-full border px-2.5 py-1 text-[10px] font-medium",
                                                    availabilityClasses(item.availability),
                                                ].join(" ")}
                                            >
                                                {item.availability || "Not specified"}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4 text-right">
                                            <Link
                                                href={`/packages/${item.id}`}
                                                target="_blank"
                                                className="inline-flex h-8 items-center rounded-lg border border-white/[0.07] px-3 text-[11px] font-medium text-slate-500 transition hover:border-white/[0.14] hover:bg-white/[0.04] hover:text-white"
                                            >
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Mobile / tablet cards */}
                <section className="mt-4 grid gap-3 lg:hidden">
                    {filteredPackages.map((item) => (
                        <article
                            key={item.id}
                            className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.018]"
                        >
                            <div className="flex gap-4 p-4">
                                <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.03]">
                                    <Image
                                        src={item.imageUrl}
                                        alt=""
                                        fill
                                        sizes="96px"
                                        quality={75}
                                        className="object-cover"
                                    />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="truncate text-sm font-semibold text-white">
                                                    {item.title}
                                                </h3>

                                                {item.featured && (
                                                    <span className="shrink-0 text-xs text-sky-400">
                                                        ✦
                                                    </span>
                                                )}
                                            </div>

                                            <p className="mt-1 truncate text-xs text-slate-600">
                                                {item.destination} · {item.country}
                                            </p>
                                        </div>

                                        <span
                                            className={[
                                                "shrink-0 rounded-full border px-2 py-1 text-[9px] font-medium",
                                                availabilityClasses(item.availability),
                                            ].join(" ")}
                                        >
                                            {item.availability || "N/A"}
                                        </span>
                                    </div>

                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                        <span
                                            className={[
                                                "rounded-full border px-2 py-1 text-[9px] font-medium capitalize",
                                                styleClasses(item.travelStyle),
                                            ].join(" ")}
                                        >
                                            {item.travelStyle}
                                        </span>

                                        <span className="text-[11px] text-slate-600">
                                            {item.durationDays}d / {item.durationNights}n
                                        </span>

                                        <span className="text-[11px] text-slate-500">
                                            {formatPrice(item.price, item.currency)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-white/[0.05] px-4 py-3">
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.12em] text-slate-700">
                                        Departure
                                    </p>
                                    <p className="mt-0.5 text-xs text-slate-400">
                                        {item.departureCity}
                                    </p>
                                </div>

                                <Link
                                    href={`/packages/${item.id}`}
                                    target="_blank"
                                    className="inline-flex h-9 items-center rounded-lg border border-white/[0.07] px-3 text-xs font-medium text-slate-400 transition hover:border-white/[0.14] hover:bg-white/[0.04] hover:text-white"
                                >
                                    View package
                                </Link>
                            </div>
                        </article>
                    ))}
                </section>

                {/* Empty state */}
                {filteredPackages.length === 0 && (
                    <section className="mt-4 rounded-2xl border border-white/[0.07] bg-white/[0.018] px-6 py-16 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.025] text-slate-600">
                            ⌕
                        </div>

                        <h3 className="mt-4 text-base font-semibold text-white">
                            No packages found
                        </h3>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                            No package matches the current search and filter
                            combination.
                        </p>

                        <button
                            type="button"
                            onClick={clearFilters}
                            className="mt-5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-xs font-medium text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
                        >
                            Clear filters
                        </button>
                    </section>
                )}

                {/* Data note */}
                <section className="mt-6 rounded-2xl border border-amber-400/[0.12] bg-amber-400/[0.025] p-4 sm:p-5">
                    <div className="flex gap-3">
                        <span className="mt-0.5 text-amber-300">!</span>

                        <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-300">
                                Package catalog note
                            </p>

                            <p className="mt-1 text-xs leading-5 text-slate-600">
                                These packages are currently maintained in the
                                application package catalog. Pricing, availability,
                                inclusions, visa assistance, and provider details
                                should be verified before customer confirmation.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}

function MetricCard({
    label,
    value,
    hint,
    icon,
}: {
    label: string;
    value: number;
    hint: string;
    icon: string;
}) {
    return (
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.018] p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-700">
                        {label}
                    </p>

                    <p className="mt-2 text-2xl font-semibold tracking-tight text-white">
                        {value}
                    </p>

                    <p className="mt-1 text-[11px] text-slate-600">{hint}</p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-sm text-slate-500">
                    {icon}
                </div>
            </div>
        </div>
    );
}

function FilterSelect({
    label,
    value,
    onChange,
    options,
    placeholder,
    capitalize = false,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: string[];
    placeholder: string;
    capitalize?: boolean;
}) {
    return (
        <label className="min-w-0">
            <span className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.14em] text-slate-700">
                {label}
            </span>

            <select
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="h-10 w-full rounded-xl border border-white/[0.07] bg-[#080d15] px-3 text-xs text-slate-400 outline-none transition focus:border-sky-400/30"
            >
                <option value="">{placeholder}</option>

                {options.map((option) => (
                    <option key={option} value={option}>
                        {capitalize
                            ? option.charAt(0).toUpperCase() + option.slice(1)
                            : option}
                    </option>
                ))}
            </select>
        </label>
    );
}