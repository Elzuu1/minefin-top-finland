import { supabase } from "@/integrations/supabase/client";

export type SubmissionStatus = "pending" | "approved" | "rejected";

export type ServerSubmission = {
  id: string;
  user_id: string;
  name: string;
  ip: string;
  port: number;
  description: string | null;
  version: string | null;
  category: string | null;
  banner_url: string | null;
  logo_url: string | null;
  status: SubmissionStatus;
  review_note: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type EligibilityResult = {
  eligible: boolean;
  hypes: number;
  comments: number;
  hypesRequired: number;
  commentsRequired: number;
};

export const HYPES_REQUIRED = 5;
export const COMMENTS_REQUIRED = 1;

export async function checkEligibility(userId: string): Promise<EligibilityResult> {
  const [{ count: hypes }, { count: comments }] = await Promise.all([
    supabase
      .from("server_hypes")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("server_comments")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId),
  ]);
  const h = hypes ?? 0;
  const c = comments ?? 0;
  return {
    eligible: h >= HYPES_REQUIRED && c >= COMMENTS_REQUIRED,
    hypes: h,
    comments: c,
    hypesRequired: HYPES_REQUIRED,
    commentsRequired: COMMENTS_REQUIRED,
  };
}

export type SubmissionInput = {
  name: string;
  ip: string;
  port: number;
  description?: string | null;
  version?: string | null;
  category?: string | null;
  banner_url?: string | null;
  logo_url?: string | null;
};

export function normalizeServerAddress(ip: string, port: number) {
  const trimmed = ip.trim();
  const match = trimmed.match(/^([^:\s]+):(\d{2,5})$/);
  if (!match) return { ip: trimmed, port: port || 25565 };

  const parsedPort = Number(match[2]);
  return {
    ip: match[1],
    port: Number.isInteger(parsedPort) && parsedPort > 0 && parsedPort <= 65535 ? parsedPort : port || 25565,
  };
}

export async function createSubmission(userId: string, input: SubmissionInput) {
  const address = normalizeServerAddress(input.ip, input.port);
  const { error } = await supabase.from("server_submissions" as any).insert({
    user_id: userId,
    name: input.name.trim(),
    ip: address.ip,
    port: address.port,
    description: input.description?.trim() || null,
    version: input.version?.trim() || null,
    category: input.category?.trim() || null,
    banner_url: input.banner_url?.trim() || null,
    logo_url: input.logo_url?.trim() || null,
  });
  if (error) throw error;
}

export async function fetchSubmissions(status?: SubmissionStatus): Promise<ServerSubmission[]> {
  let q = supabase.from("server_submissions" as any).select("*").order("created_at", { ascending: false });
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as unknown as ServerSubmission[];
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function approveSubmission(sub: ServerSubmission) {
  const address = normalizeServerAddress(sub.ip, sub.port);
  // Determine next sort_order
  const { count } = await supabase.from("servers").select("*", { count: "exact", head: true });
  const sort_order = (count ?? 0) + 1;

  // Ensure unique slug
  let slug = slugify(sub.name);
  const { data: existing } = await supabase.from("servers").select("slug").eq("slug", slug).maybeSingle();
  if (existing) slug = `${slug}-${Math.floor(Math.random() * 1000)}`;

  const { error: insertErr } = await supabase.from("servers").insert({
    name: sub.name,
    slug,
    ip: address.ip,
    port: address.port,
    description: sub.description,
    version: sub.version,
    category: sub.category,
    banner_url: sub.banner_url,
    icon_letter: sub.name.charAt(0).toUpperCase() || "M",
    sort_order,
    is_active: true,
    is_featured: false,
  });
  if (insertErr) throw insertErr;

  const { error: updErr } = await supabase
    .from("server_submissions" as any)
    .update({ status: "approved", reviewed_at: new Date().toISOString() })
    .eq("id", sub.id);
  if (updErr) throw updErr;
}

export async function rejectSubmission(id: string, note?: string) {
  const { error } = await supabase
    .from("server_submissions" as any)
    .update({ status: "rejected", review_note: note ?? null, reviewed_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteSubmission(id: string) {
  const { error } = await supabase.from("server_submissions" as any).delete().eq("id", id);
  if (error) throw error;
}
