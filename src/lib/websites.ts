import { supabase } from "@/integrations/supabase/client";

export type ExternalWebsite = {
  id: string;
  title: string;
  description: string | null;
  url: string;
  image_url: string | null;
  accent: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export async function fetchActiveWebsites(): Promise<ExternalWebsite[]> {
  const { data, error } = await supabase
    .from("external_websites" as any)
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as ExternalWebsite[];
}

export async function fetchAllWebsites(): Promise<ExternalWebsite[]> {
  const { data, error } = await supabase
    .from("external_websites" as any)
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as ExternalWebsite[];
}

export async function createWebsite(input: {
  title: string;
  url: string;
  description?: string | null;
  image_url?: string | null;
  accent?: string | null;
  sort_order?: number;
}) {
  const { error } = await supabase.from("external_websites" as any).insert({
    title: input.title.trim(),
    url: input.url.trim(),
    description: input.description?.trim() || null,
    image_url: input.image_url?.trim() || null,
    accent: input.accent?.trim() || null,
    sort_order: input.sort_order ?? 100,
    is_active: true,
  });
  if (error) throw error;
}

export async function updateWebsite(id: string, patch: Partial<ExternalWebsite>) {
  const { error } = await supabase
    .from("external_websites" as any)
    .update(patch as any)
    .eq("id", id);
  if (error) throw error;
}

export async function deleteWebsite(id: string) {
  const { error } = await supabase.from("external_websites" as any).delete().eq("id", id);
  if (error) throw error;
}
