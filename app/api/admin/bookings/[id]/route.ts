import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { notifyCustomer } from "@/lib/notifications/notify";

const allowed = new Set(["pending","processing","confirmed","travel_ready","completed","cancelled","on_hold"]);
const transitions: Record<string,string[]> = {
  pending:["processing","cancelled","on_hold"], processing:["confirmed","cancelled","on_hold"], confirmed:["travel_ready","completed","on_hold","cancelled"], travel_ready:["completed","on_hold","cancelled"], on_hold:["processing","cancelled"], cancelled:[], completed:[]
};

export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}) {
  const {id}=await params; const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser();
  if(!user) return NextResponse.json({success:false,error:{code:"UNAUTHORIZED",message:"Please sign in."}},{status:401});
  const {data:p}=await supabase.from("profiles").select("role").eq("id",user.id).single();
  if(p?.role !== "admin") return NextResponse.json({success:false,error:{code:"FORBIDDEN",message:"Operations access required."}},{status:403});
  const {data,error}=await supabase.from("bookings").select("*, service_requests(id,user_id,destination_country,destination_city,priority,travel_start_date,travel_end_date,profiles!service_requests_user_id_fkey(full_name,email,phone,organization,profession)), booking_items(*,service_catalog(id,name))").eq("id",id).single();
  if(error||!data) return NextResponse.json({success:false,error:{code:"NOT_FOUND",message:"Booking not found."}},{status:404});
  return NextResponse.json({success:true,data});
}

export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}) {
  const {id}=await params; const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser();
  if(!user) return NextResponse.json({success:false,error:{code:"UNAUTHORIZED",message:"Please sign in."}},{status:401});
  const {data:p}=await supabase.from("profiles").select("role").eq("id",user.id).single();
  if(p?.role !== "admin") return NextResponse.json({success:false,error:{code:"FORBIDDEN",message:"Operations access required."}},{status:403});
  const body=await request.json() as {status?:string;notes?:string|null;confirmation_status?:string;item_id?:string;item_status?:string;provider_name?:string|null;provider_reference?:string|null};
  const {data:booking}=await supabase.from("bookings").select("id,request_id,status").eq("id",id).single();
  if(!booking) return NextResponse.json({success:false,error:{code:"NOT_FOUND",message:"Booking not found."}},{status:404});
  if(body.item_id && body.item_status) {
    const itemAllowed=new Set(["pending","processing","confirmed","completed","cancelled","on_hold"]);
    if(!itemAllowed.has(body.item_status)) return NextResponse.json({success:false,error:{code:"VALIDATION_ERROR",message:"Invalid booking item status."}},{status:422});
    const {data:item,error}=await supabase.from("booking_items").update({status:body.item_status,provider_name:body.provider_name??undefined,provider_reference:body.provider_reference??undefined}).eq("id",body.item_id).eq("booking_id",id).select().single();
    if(error||!item) return NextResponse.json({success:false,error:{code:"NOT_FOUND",message:"Booking item not found."}},{status:404});
    await supabase.from("activity_logs").insert({actor_id:user.id,entity_type:"booking_item",entity_id:body.item_id,action:"booking_item_updated",metadata:{booking_id:id,status:body.item_status}});
    return NextResponse.json({success:true,data:item});
  }
  if(body.status) {
    if(!allowed.has(body.status)) return NextResponse.json({success:false,error:{code:"VALIDATION_ERROR",message:"Invalid booking status."}},{status:422});
    if(!transitions[booking.status]?.includes(body.status)) return NextResponse.json({success:false,error:{code:"INVALID_STATE",message:`Booking cannot move from ${booking.status} to ${body.status}.`}},{status:409});
    const update:{status:string;notes?:string|null;confirmation_status?:string;confirmed_at?:string;confirmed_by?:string}={status:body.status};
    if(body.notes!==undefined) update.notes=body.notes;
    if(body.confirmation_status) update.confirmation_status=body.confirmation_status;
    if(body.status==="confirmed"||body.status==="travel_ready") {update.confirmed_at=new Date().toISOString();update.confirmed_by=user.id;update.confirmation_status="confirmed";}
    const {data:updated,error}=await supabase.from("bookings").update(update).eq("id",id).select().single();
    if(error) return NextResponse.json({success:false,error:{code:"DATABASE_ERROR",message:"Unable to update booking."}},{status:500});
    const {data:req}=await supabase.from("service_requests").select("user_id").eq("id",booking.request_id).single();
    if(req?.user_id) await notifyCustomer({userId:req.user_id,type:"booking_status",title:`Booking ${body.status.replaceAll("_"," ")}`,message:`Your booking has been updated to ${body.status.replaceAll("_"," ")}.`,relatedRequestId:booking.request_id,channels:["in_app","email","whatsapp"]});
    await supabase.from("activity_logs").insert({actor_id:user.id,entity_type:"booking",entity_id:id,action:"booking_status_changed",metadata:{from:booking.status,to:body.status,request_id:booking.request_id}});
    if(["confirmed","travel_ready","completed"].includes(body.status)) await supabase.from("service_requests").update({status:body.status==="completed"?"completed":body.status==="travel_ready"?"confirmed":"confirmed"}).eq("id",booking.request_id);
    return NextResponse.json({success:true,data:updated});
  }
  return NextResponse.json({success:false,error:{code:"VALIDATION_ERROR",message:"No booking action supplied."}},{status:422});
}
