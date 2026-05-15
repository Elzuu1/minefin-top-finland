import { createFileRoute } from "@tanstack/react-router";

type McsrvstatResponse = {
  online: boolean;
  players?: { online?: number; max?: number };
  version?: string;
  motd?: { clean?: string[] };
  icon?: string;
};

export const Route = createFileRoute("/api/minecraft-status")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const ip = url.searchParams.get("ip");
        const portRaw = url.searchParams.get("port");

        if (!ip) {
          return Response.json({ online: false, error: "Missing ip" }, { status: 400 });
        }

        const port = portRaw ? Number(portRaw) : 25565;
        if (Number.isNaN(port) || port < 1 || port > 65535) {
          return Response.json({ online: false, error: "Invalid port" }, { status: 400 });
        }

        const host = port === 25565 ? ip : `${ip}:${port}`;

        try {
          const res = await fetch(`https://api.mcsrvstat.us/3/${host}`, {
            headers: { "user-agent": "Minefin/1.0" },
          });
          if (!res.ok) throw new Error(`status ${res.status}`);
          const data = (await res.json()) as McsrvstatResponse;

          if (!data.online) {
            return Response.json(
              { online: false },
              { headers: { "cache-control": "public, max-age=20" } },
            );
          }

          return Response.json(
            {
              online: true,
              players: data.players?.online ?? 0,
              maxPlayers: data.players?.max ?? 0,
              motd: data.motd?.clean?.join("\n") ?? "",
              version: data.version ?? "",
              favicon: data.icon ?? "",
            },
            { headers: { "cache-control": "public, max-age=20" } },
          );
        } catch {
          return Response.json({ online: false });
        }
      },
    },
  },
});
