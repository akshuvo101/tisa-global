import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { notifyCustomer } from "@/lib/notifications/notify";

const allowedStatuses = new Set(["requested","reviewing","need_documents","documents_received","quoted","quote_accepted","processing","confirmed","completed","cancelled","on_hold"]);
const transitions: Record<string,string[]> = { requested:["reviewing","cancelled","on_hold"], reviewing:["need_documents","quoted","processing","cancelled","on_hold"], need_documents:["documents_received","cancelled","on_hold"], documents_received:["reviewing","quoted","processing","on_hold"], quoted:["quote_accepted","reviewing","cancelled","on_hold"], quote_accepted:["processing","cancelled","on_hold"], processing:["confirmed","on_hold","cancelled"], confirmed:["completed","on_hold"], on_hold:["reviewing","processing","cancelled"], cancelled:[], completed:[] };

async function authorized() {
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) return {supabase,user:null,role:null};
  const {data:profile}=await supabase.from("profiles").select("role").eq("id",user.id).single();
  return {supabase,user,role:profile?.role};
}

export async function PATCH(request:Request,context:{params:Promise<{id:string}>}) {
  try {
    const {id}=await context.params; const {supabase,user,role}=await authorized();
    if(!user) return NextResponse.json({success:false,error:{code:"UNAUTHORIZED",message:"Please sign in."}},{status:401});
    if(role !== "admin") return NextResponse.json({success:false,error:{code:"FORBIDDEN",message:"You do not have access to operations."}},{status:403});
    const body=await request.json() as {action?:string;status?:string;note?:string;message?:string};
    const {data:current,error:currentError}=await supabase.from("service_requests").select("id,status,assigned_staff_id,user_id").eq("id",id).single();
    if(currentError||!current) return NextResponse.json({success:false,error:{code:"NOT_FOUND",message:"Request not found."}},{status:404});

    if(body.action==="status") {
      if(!body.status||!allowedStatuses.has(body.status)) return NextResponse.json({success:false,error:{code:"VALIDATION_ERROR",message:"Invalid status."}},{status:422});
      if(body.status!==current.status && !transitions[current.status]?.includes(body.status)) return NextResponse.json({success:false,error:{code:"INVALID_TRANSITION",message:`Cannot move a request from ${current.status} to ${body.status}.`}},{status:409});
      const timestamps:Record<string,unknown>={}; if(body.status==="reviewing")timestamps.reviewed_at=new Date().toISOString(); if(body.status==="quoted")timestamps.quoted_at=new Date().toISOString(); if(body.status==="completed")timestamps.completed_at=new Date().toISOString(); if(!current.assigned_staff_id)timestamps.first_response_at=new Date().toISOString();
      const {data,error}=await supabase.from("service_requests").update({status:body.status,...timestamps}).eq("id",id).select().single();
      if(error) throw error;
      await supabase.from("activity_logs").insert({actor_id:user.id,entity_type:"service_request",entity_id:id,action:"status_changed",metadata:{from:current.status,to:body.status}});
      return NextResponse.json({success:true,data});
    }
    if(body.action==="assign") {
      const {data,error}=await supabase.from("service_requests").update({assigned_staff_id:user.id,first_response_at:current.assigned_staff_id?undefined:new Date().toISOString()}).eq("id",id).select().single();
      if(error) throw error; await supabase.from("activity_logs").insert({actor_id:user.id,entity_type:"service_request",entity_id:id,action:"assigned",metadata:{assigned_to:user.id}}); return NextResponse.json({success:true,data});
    }
    if(body.action==="note") { if(!body.note?.trim()) return NextResponse.json({success:false,error:{code:"VALIDATION_ERROR",message:"Note is required."}},{status:422}); const {data,error}=await supabase.from("request_notes").insert({request_id:id,staff_id:user.id,note:body.note.trim()}).select().single(); if(error)throw error; return NextResponse.json({success:true,data}); }
    if(body.action==="message") { if(!body.message?.trim()) return NextResponse.json({success:false,error:{code:"VALIDATION_ERROR",message:"Message is required."}},{status:422}); const {data,error}=await supabase.from("request_messages").insert({request_id:id,sender_id:user.id,message:body.message.trim()}).select().single(); if(error)throw error; await notifyCustomer({userId:current.user_id,type:"request_message",title:"New message from TISA",message:body.message.trim(),relatedRequestId:id,channels:["in_app","email","whatsapp"]}); return NextResponse.json({success:true,data}); }
    return NextResponse.json({success:false,error:{code:"VALIDATION_ERROR",message:"Unsupported action."}},{status:422});
  } catch(error) { console.error("Admin request action failed",error); return NextResponse.json({success:false,error:{code:"INTERNAL_ERROR",message:"Unable to complete the operation."}},{status:500}); }
}
