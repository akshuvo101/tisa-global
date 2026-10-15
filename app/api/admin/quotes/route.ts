import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

async function ctx() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return {
            supabase,
            user: null,
            role: null,
        };
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    return {
        supabase,
        user,
        role: profile?.role,
    };
}

const money = (value: unknown) => {
    const number = Number(value);

    return Number.isFinite(number) && number >= 0
        ? Math.round(number * 100) / 100
        : 0;
};

/* -------------------------------------------------------------------------- */
/* GET — Admin quote queue                                                    */
/* -------------------------------------------------------------------------- */

export async function GET() {
    const { supabase, user, role } = await ctx();

    if (!user) {
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: "UNAUTHORIZED",
                    message: "Please sign in.",
                },
            },
            { status: 401 },
        );
    }

    if (role !== "admin") {
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: "FORBIDDEN",
                    message: "Operations access required.",
                },
            },
            { status: 403 },
        );
    }

    /*
     * Keep the main quote query simple.
     * We intentionally avoid deeply nested Supabase relations here
     * because the project has already encountered relation inference
     * issues elsewhere.
     */
    const { data: quotes, error } = await supabase
        .from("quotes")
        .select(
            `
        id,
        request_id,
        quote_number,
        status,
        subtotal,
        service_fee,
        discount,
        tax,
        total_amount,
        currency,
        valid_until,
        created_by,
        created_at,
        updated_at
      `,
        )
        .order("created_at", { ascending: false });

    if (error) {
        console.error("POST /api/admin/quotes failed", error);

        return NextResponse.json(
            {
                success: false,
                error: {
                    code: "DATABASE_ERROR",
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                },
            },
            { status: 500 },
        );
    }

    const quoteRows = quotes ?? [];

    if (quoteRows.length === 0) {
        return NextResponse.json({
            success: true,
            data: [],
        });
    }

    /* ---------------------------------------------------------------------- */
    /* Related requests                                                       */
    /* ---------------------------------------------------------------------- */

    const requestIds = Array.from(
        new Set(
            quoteRows
                .map((quote) => quote.request_id)
                .filter((id): id is string => Boolean(id)),
        ),
    );

    const { data: requests, error: requestsError } = await supabase
        .from("service_requests")
        .select(
            `
        id,
        user_id,
        destination_country,
        destination_city,
        status,
        priority,
        created_at
      `,
        )
        .in("id", requestIds);

    if (requestsError) {
        console.error(
            "GET /api/admin/quotes request lookup failed",
            requestsError,
        );
    }

    const requestMap = new Map(
        (requests ?? []).map((request) => [request.id, request]),
    );

    /* ---------------------------------------------------------------------- */
    /* Customers                                                              */
    /* ---------------------------------------------------------------------- */

    const userIds = Array.from(
        new Set(
            (requests ?? [])
                .map((request) => request.user_id)
                .filter((id): id is string => Boolean(id)),
        ),
    );

    const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id,full_name,email")
        .in("id", userIds);

    if (profilesError) {
        console.error(
            "GET /api/admin/quotes customer lookup failed",
            profilesError,
        );
    }

    const profileMap = new Map(
        (profiles ?? []).map((profile) => [profile.id, profile]),
    );

    /* ---------------------------------------------------------------------- */
    /* Response                                                               */
    /* ---------------------------------------------------------------------- */

    const data = quoteRows.map((quote) => {
        const request = requestMap.get(quote.request_id);
        const customer = request
            ? profileMap.get(request.user_id)
            : undefined;

        return {
            ...quote,

            request: request
                ? {
                    id: request.id,
                    destination_country: request.destination_country,
                    destination_city: request.destination_city,
                    status: request.status,
                    priority: request.priority,
                    created_at: request.created_at,
                }
                : null,

            customer: customer
                ? {
                    id: customer.id,
                    full_name: customer.full_name,
                    email: customer.email,
                }
                : null,
        };
    });

    return NextResponse.json({
        success: true,
        data,
    });
}

/* -------------------------------------------------------------------------- */
/* POST — Create quote                                                        */
/* -------------------------------------------------------------------------- */

export async function POST(req: Request) {
    const { supabase, user, role } = await ctx();

    if (!user) {
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: "UNAUTHORIZED",
                    message: "Please sign in.",
                },
            },
            { status: 401 },
        );
    }

    if (role !== "admin") {
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: "FORBIDDEN",
                    message: "Operations access required.",
                },
            },
            { status: 403 },
        );
    }

    const body = (await req.json()) as {
        request_id?: string;
        currency?: string;
        valid_until?: string | null;
        service_fee?: number;
        discount?: number;
        tax?: number;
        items?: Array<{
            service_id?: string | null;
            description?: string;
            quantity?: number;
            unit_price?: number;
        }>;
    };

    if (!body.request_id || !body.items?.length) {
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: "VALIDATION_ERROR",
                    message:
                        "Request and at least one quote item are required.",
                },
            },
            { status: 422 },
        );
    }

    const { data: serviceRequest } = await supabase
        .from("service_requests")
        .select("id,user_id,status")
        .eq("id", body.request_id)
        .single();

    if (!serviceRequest) {
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: "NOT_FOUND",
                    message: "Request not found.",
                },
            },
            { status: 404 },
        );
    }

    if (
        ![
            "reviewing",
            "documents_received",
            "quoted",
            "on_hold",
        ].includes(serviceRequest.status)
    ) {
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: "INVALID_STATE",
                    message: "This request is not ready for a quote.",
                },
            },
            { status: 409 },
        );
    }

    const items = body.items.map((item) => {
        const quantity = Math.max(
            1,
            Math.floor(Number(item.quantity) || 1),
        );

        const unit_price = money(item.unit_price);

        return {
            service_id: item.service_id || null,
            description: (item.description || "Service").trim(),
            quantity,
            unit_price,
            total_price: money(quantity * unit_price),
        };
    });

    const subtotal = money(
        items.reduce((sum, item) => sum + item.total_price, 0),
    );

    const service_fee = money(body.service_fee);

    const discount = Math.min(
        money(body.discount),
        subtotal + service_fee,
    );

    const tax = money(body.tax);

    const total_amount = money(
        subtotal + service_fee - discount + tax,
    );

    const quoteNumber = `TISA-${new Date().getFullYear()}-${crypto
        .randomUUID()
        .slice(0, 8)
        .toUpperCase()}`;

    const { data: quote, error } = await supabase
        .from("quotes")
        .insert({
            request_id: serviceRequest.id,
            quote_number: quoteNumber,
            status: "draft",
            subtotal,
            service_fee,
            discount,
            tax,
            total_amount,
            currency: (body.currency || "USD").toUpperCase(),
            valid_until: body.valid_until || null,
            created_by: user.id,
        })
        .select()
        .single();

    if (error) {
        console.error("POST /api/admin/quotes failed", error);

        return NextResponse.json(
            {
                success: false,
                error: {
                    code: "DATABASE_ERROR",
                    message: "Unable to create quote.",
                },
            },
            { status: 500 },
        );
    }

    const { error: itemError } = await supabase
        .from("quote_items")
        .insert(
            items.map((item) => ({
                ...item,
                quote_id: quote.id,
            })),
        );

    if (itemError) {
        await supabase
            .from("quotes")
            .delete()
            .eq("id", quote.id);

        return NextResponse.json(
            {
                success: false,
                error: {
                    code: "DATABASE_ERROR",
                    message: "Unable to create quote items.",
                },
            },
            { status: 500 },
        );
    }

    await supabase.from("activity_logs").insert({
        actor_id: user.id,
        entity_type: "quote",
        entity_id: quote.id,
        action: "quote_created",
        metadata: {
            request_id: serviceRequest.id,
            total_amount,
            currency: quote.currency,
        },
    });

    return NextResponse.json(
        {
            success: true,
            data: quote,
        },
        { status: 201 },
    );
}