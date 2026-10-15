
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const allowedTypes = new Set([
  "Flights & Travel",
  "Visa & Documents",
  "Travel Packages",
  "Education & Conferences",
  "Medical Travel",
  "Other Assistance",
]);

function cleanString(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "Please submit valid form data." },
        { status: 415 },
      );
    }

    const body = await request.json();

    const name = cleanString(body.name, 100);
    const email = cleanString(body.email, 254).toLowerCase();
    const assistanceType = cleanString(body.assistanceType, 80);
    const destination = cleanString(body.destination, 150);
    const message = cleanString(body.message, 5000);

    if (
      name.length < 2 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !allowedTypes.has(assistanceType) ||
      message.length < 10
    ) {
      return NextResponse.json(
        { error: "Please check the required fields and try again." },
        { status: 400 },
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publishableKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !publishableKey) {
      console.error("Missing Supabase environment variables.");

      return NextResponse.json(
        { error: "The contact service is temporarily unavailable." },
        { status: 503 },
      );
    }

    const supabase = createClient(supabaseUrl, publishableKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { error } = await supabase
      .from("contact_messages")
      .insert({
        name,
        email,
        assistance_type: assistanceType,
        destination: destination || null,
        message,
        status: "new",
      });

    if (error) {
      console.error("Unable to save contact enquiry:", {
        code: error.code,
        message: error.message,
      });

      return NextResponse.json(
        { error: "We couldn't save your enquiry. Please try again later." },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Your enquiry has been received.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Contact API request failed:", error);

    return NextResponse.json(
      { error: "Invalid request. Please check your details and try again." },
      { status: 400 },
    );
  }
}