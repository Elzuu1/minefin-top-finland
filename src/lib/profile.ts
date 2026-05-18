import { supabase } from "@/integrations/supabase/client";

export async function updateProfile(userId: string, patch: { display_name?: string | null; username?: string | null; avatar_url?: string | null }) {
  const { error } = await supabase.from("profiles").update(patch).eq("id", userId);
  if (error) throw error;
}
