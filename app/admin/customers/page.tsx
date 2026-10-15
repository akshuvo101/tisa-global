import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminCustomersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (me?.role !== "admin") redirect("/account");

  const { data: customers } = await supabase.from("profiles").select("id,full_name,email,phone,country,city,created_at").eq("role", "customer").order("created_at", { ascending: false });
  const ids = (customers || []).map((c) => c.id);
  const { data: requests } = ids.length ? await supabase.from("service_requests").select("id,user_id,status,created_at").in("user_id", ids) : { data: [] as any[] };
  const countByUser = new Map<string, number>();
  for (const request of requests || []) countByUser.set(request.user_id, (countByUser.get(request.user_id) || 0) + 1);

  return <main className="min-h-screen bg-background text-foreground"><section className="mx-auto max-w-7xl px-6 py-10 lg:px-8"><Link href="/admin" className="text-sm text-muted">← Admin</Link><div className="mt-7"><p className="text-xs uppercase tracking-[0.2em] text-primary">Customer operations</p><h1 className="mt-2 text-3xl font-semibold">Customers</h1><p className="mt-2 text-sm text-muted">Customer profiles and journey history.</p></div><div className="mt-8 overflow-hidden rounded-3xl border border-white/8 bg-surface"><div className="divide-y divide-white/5">{(customers || []).map((customer)=><Link key={customer.id} href={`/admin/customers/${customer.id}`} className="flex flex-col gap-3 px-6 py-5 transition hover:bg-white/[0.03] sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium">{customer.full_name || "Unnamed customer"}</p><p className="mt-1 text-sm text-muted">{customer.email || "No email"}{customer.city || customer.country ? ` · ${[customer.city,customer.country].filter(Boolean).join(", ")}` : ""}</p></div><span className="text-sm text-muted">{countByUser.get(customer.id) || 0} request{countByUser.get(customer.id) === 1 ? "" : "s"} →</span></Link>)}{!customers?.length && <div className="px-6 py-10 text-sm text-muted">No customers found.</div>}</div></div></section></main>;
}
