import { NextResponse } from "next/server";
import { requireCustomerApi } from "@/lib/auth/api";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const auth = await requireCustomerApi();
    if (!auth.ok) return auth.response;
    const { supabase, user } = auth;

    const body = await request.json() as { message?: string };
    const message = body.message?.trim();
    if (!message) return NextResponse.json({success:false,error:{code:"VALIDATION_ERROR",message:"Message cannot be empty."}}, {status:422});
    if (message.length > 4000) return NextResponse.json({success:false,error:{code:"VALIDATION_ERROR",message:"Message is too long."}}, {status:422});

    const { data: owned } = await supabase.from("service_requests").select("id").eq("id", id).eq("user_id", user.id).maybeSingle();
    if (!owned) return NextResponse.json({success:false,error:{code:"NOT_FOUND",message:"Request not found."}}, {status:404});

    const { data, error } = await supabase.from("request_messages").insert({request_id:id,sender_id:user.id,message}).select("id, sender_id, message, created_at").single();
    if (error) throw error;
    return NextResponse.json({success:true,data}, {status:201});
  } catch (error) {
    console.error("POST /api/requests/[id]/messages failed", error);
    return NextResponse.json({success:false,error:{code:"INTERNAL_ERROR",message:"Unable to send message."}}, {status:500});
  }
}
