import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Subscribes to server_hypes table changes. Calls `onChange(serverId)` whenever
 * a hype is added or removed for any server. The caller is responsible for
 * deciding how to refresh state.
 */
export function useHypeRealtime(onChange: (serverId: string) => void) {
  useEffect(() => {
    const channel = supabase
      .channel("hype-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "server_hypes" },
        (payload) => {
          const row: any = payload.new ?? payload.old;
          const serverId = row?.server_id as string | undefined;
          if (serverId) onChange(serverId);
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [onChange]);
}
