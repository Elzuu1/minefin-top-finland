import { createFileRoute } from "@tanstack/react-router";
import { status } from "minecraft-server-util";

type McStatusIoResponse = {
  online: boolean;
  players?: { online?: number; max?: number };
  version?: { name_clean?: string; name_raw?: string };
  motd?: { clean?: string; raw?: string };
  icon?: string;
};

const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, OPTIONS",
  "access-control-allow-headers": "Content-Type, Authorization, X-Requested-With, Accept, Origin",
  "access-control-max-age": "86400",
};

function statusJson(body: Record<string, unknown>, init?: ResponseInit) {
  return Response.json(body, {
    ...init,
    headers: {
      "cache-control": "no-store",
      ...corsHeaders,
      ...init?.headers,
    },
  });
}

function offline(error?: string, statusCode = 200) {
  return statusJson(
    { online: false, players: 0, maxPlayers: 0, motd: "", version: "", favicon: "", ...(error ? { error } : {}) },
    { status: statusCode },
  );
}

async function fetchHttpFallback(ip: string, port: number) {
  const host = port === 25565 ? ip : `${ip}:${port}`;
  const res = await fetch(`https://api.mcstatus.io/v2/status/java/${host}`, {
    headers: { "user-agent": "Minefin/1.0" },
  });
  if (!res.ok) throw new Error(`fallback status ${res.status}`);
  const data = (await res.json()) as McStatusIoResponse;
  if (!data.online) return null;
  return {
    online: true,
    players: data.players?.online ?? 0,
    maxPlayers: data.players?.max ?? 0,
    motd: data.motd?.clean ?? data.motd?.raw ?? "",
    version: data.version?.name_clean ?? data.version?.name_raw ?? "",
    favicon: data.icon ?? "",
  };
}

export const Route = createFileRoute("/api/minecraft-status")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: corsHeaders }),
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const ip = url.searchParams.get("ip")?.trim();
        const portRaw = url.searchParams.get("port");

        if (!ip) {
          return offline("Missing ip", 400);
        }

        if (ip.length > 253 || !/^[a-zA-Z0-9.-]+$/.test(ip)) {
          return offline("Invalid ip", 400);
        }

        const port = portRaw ? Number(portRaw) : 25565;
        if (Number.isNaN(port) || port < 1 || port > 65535) {
          return offline("Invalid port", 400);
        }

        try {
          const data = await status(ip, port, { timeout: 8_000, enableSRV: true });
          return statusJson(
            {
              online: true,
              players: data.players.online,
              maxPlayers: data.players.max,
              motd: data.motd.clean,
              version: data.version.name,
              favicon: data.favicon ?? "",
              pingMs: data.roundTripLatency,
            },
          );
        } catch (primaryError) {
          console.error("minecraft-server-util ping failed", primaryError);
          try {
            const fallback = await fetchHttpFallback(ip, port);
            return fallback ? statusJson(fallback) : offline();
          } catch (fallbackError) {
            console.error("Minecraft HTTP fallback failed", fallbackError);
            return offline();
          }
        }
      },
    },
  },
});
