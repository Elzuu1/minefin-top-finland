import { supabase } from "@/integrations/supabase/client";

export type Banner = {
  id: string;
  text: string;
  link_url: string | null;
  speed_seconds: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export async function fetchActiveBanners(): Promise<Banner[]> {
  const { data, error } = await supabase
    .from("banners" as any)
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as Banner[];
}

export async function fetchAllBanners(): Promise<Banner[]> {
  const { data, error } = await supabase
    .from("banners" as any)
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as Banner[];
}

export async function createBanner(input: { text: string; speed_seconds?: number; link_url?: string | null }) {
  const { error } = await supabase.from("banners" as any).insert({
    text: input.text.trim(),
    speed_seconds: input.speed_seconds ?? 30,
    link_url: input.link_url?.trim() || null,
    is_active: true,
    sort_order: 0,
  });
  if (error) throw error;
}

export async function updateBanner(id: string, patch: Partial<Banner>) {
  const { error } = await supabase.from("banners" as any).update(patch as any).eq("id", id);
  if (error) throw error;
}

export async function deleteBanner(id: string) {
  const { error } = await supabase.from("banners" as any).delete().eq("id", id);
  if (error) throw error;
}
