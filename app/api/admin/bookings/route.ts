import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { notifyCustomer } from "@/lib/notifications/notify";

async function getContext() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, role: null };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return { supabase, user, role: profile?.role };
}

export async function GET() {
  const { supabase, user, role } = await getContext();
  if (!user) return NextResponse.json({ success:false, error:{code:"UNAUTHORIZED",message:"Please sign in."} }, {status:401});
  if (role !== "admin") return NextResponse.json({ success:false, error:{code:"FORBIDDEN",message:"Operations access required."} }, {status:403});
  const { data, error } = await supabase.from("bookings").select("*, service_requests(id,user_id,destination_country,destination_city,priority,profiles!service_requests_user_id_fkey(full_name,email)), booking_items(*,service_catalog(id,name))").order("created_at", {ascending:false});
  if (error) return NextResponse.json({success:false,error:{code:"DATABASE_ERROR",message:"Unable to load bookings."}}, {status:500});
  return NextResponse.json({success:true,data});
}

export async function POST(request: Request) {
  const { supabase, user, role } = await getContext();
  if (!user) return NextResponse.json({success:false,error:{code:"UNAUTHORIZED",message:"Please sign in."}}, {status:401});
  if (role !== "admin") return NextResponse.json({success:false,error:{code:"FORBIDDEN",message:"Operations access required."}}, {status:403});
  const body = await request.json() as { request_id?:string; quote_id?:string; booking_type?:string; start_date?:string|null; end_date?:string|null; notes?:string|null };
  if (!body.request_id || !body.quote_id) return NextResponse.json({success:false,error:{code:"VALIDATION_ERROR",message:"Request and accepted quote are required."}}, {status:422});
  const { data: quote } = await supabase.from("quotes").select("id,request_id,status,total_amount,currency,quote_items(*)").eq("id",body.quote_id).eq("request_id",body.request_id).single();
  if (!quote) return NextResponse.json({success:false,error:{code:"NOT_FOUND",message:"Quote not found."}}, {status:404});
  if (quote.status !== "accepted") return NextResponse.json({success:false,error:{code:"INVALID_STATE",message:"Only an accepted quote can create a booking."}}, {status:409});
  const { data: existing } = await supabase.from("bookings").select("id").eq("request_id",body.request_id).in("status",["pending","processing","confirmed","travel_ready"]).limit(1);
  if (existing?.length) return NextResponse.json({success:false,error:{code:"CONFLICT",message:"An active booking already exists for this request."}}, {status:409});
  const reference = `TISA-${new Date().getFullYear()}-${crypto.randomUUID().slice(0,8).toUpperCase()}`;
  const { data: booking, error } = await supabase.from("bookings").insert({request_id:body.request_id,booking_reference:reference,status:"pending",confirmation_status:"pending",booking_type:body.booking_type||"travel_service",total_amount:quote.total_amount,currency:quote.currency,start_date:body.start_date||null,end_date:body.end_date||null,notes:body.notes||null}).select().single();
  if (error) return NextResponse.json({success:false,error:{code:"DATABASE_ERROR",message:"Unable to create booking."}}, {status:500});
  const items = (quote.quote_items ?? []).map((item:{service_id:string|null;description:string;quantity:number;unit_price:number;total_price:number}) => ({booking_id:booking.id,service_id:item.service_id,item_type:"service",provider_name:null,provider_reference:null,status:"pending",amount:item.total_price,details:{description:item.description,quantity:item.quantity,unit_price:item.unit_price}}));
  if (items.length) {
    const { error:itemError } = await supabase.from("booking_items").insert(items);
    if (itemError) { await supabase.from("bookings").delete().eq("id",booking.id); return NextResponse.json({success:false,error:{code:"DATABASE_ERROR",message:"Unable to create booking items."}}, {status:500}); }
  }
  await supabase.from("service_requests").update({status:"processing"}).eq("id",body.request_id);
  const { data: reqRow } = await supabase.from("service_requests").select("user_id").eq("id",body.request_id).single();
  if (reqRow?.user_id) await notifyCustomer({userId:reqRow.user_id,type:"booking_created",title:"Your TISA booking is being processed",message:`Booking ${reference} has been created and is now being processed.`,relatedRequestId:body.request_id,channels:["in_app","email","whatsapp"]});
  await supabase.from("activity_logs").insert({actor_id:user.id,entity_type:"booking",entity_id:booking.id,action:"booking_created",metadata:{request_id:body.request_id,quote_id:body.quote_id}});
  return NextResponse.json({success:true,data:booking},{status:201});
}
