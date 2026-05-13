export type Server = {
  id: string;
  name: string;
  ip: string;
  players: number;
  maxPlayers: number;
  online: boolean;
  trend: "up" | "down" | "flat";
  iconColor: string; // oklch
  iconLetter: string;
};

// Mock data — structure ready for live API replacement
export const MOCK_SERVERS: Server[] = [
  { id: "1", name: "VanillaFinland", ip: "play.vanillafinland.fi", players: 842, maxPlayers: 1000, online: true, trend: "up", iconColor: "oklch(0.7 0.18 145)", iconLetter: "V" },
  { id: "2", name: "NordicCraft", ip: "mc.nordiccraft.fi", players: 671, maxPlayers: 800, online: true, trend: "up", iconColor: "oklch(0.7 0.18 220)", iconLetter: "N" },
  { id: "3", name: "SuomiSMP", ip: "play.suomismp.net", players: 528, maxPlayers: 600, online: true, trend: "down", iconColor: "oklch(0.75 0.17 60)", iconLetter: "S" },
  { id: "4", name: "FinlandSMP", ip: "play.finlandsmp.fi", players: 412, maxPlayers: 500, online: true, trend: "up", iconColor: "oklch(0.78 0.18 165)", iconLetter: "F" },
  { id: "5", name: "HelsinkiCraft", ip: "mc.helsinkicraft.fi", players: 387, maxPlayers: 500, online: true, trend: "flat", iconColor: "oklch(0.7 0.18 280)", iconLetter: "H" },
  { id: "6", name: "TampereMC", ip: "play.tamperemc.fi", players: 264, maxPlayers: 400, online: true, trend: "up", iconColor: "oklch(0.7 0.18 30)", iconLetter: "T" },
  { id: "7", name: "ArcticRealms", ip: "mc.arcticrealms.fi", players: 198, maxPlayers: 300, online: true, trend: "down", iconColor: "oklch(0.78 0.12 200)", iconLetter: "A" },
  { id: "8", name: "OuluNetwork", ip: "play.oulunetwork.fi", players: 142, maxPlayers: 250, online: true, trend: "up", iconColor: "oklch(0.7 0.18 320)", iconLetter: "O" },
  { id: "9", name: "MökkiCraft", ip: "mc.mokkicraft.fi", players: 87, maxPlayers: 150, online: true, trend: "flat", iconColor: "oklch(0.75 0.15 90)", iconLetter: "M" },
  { id: "10", name: "SaunaSMP", ip: "play.saunasmp.fi", players: 0, maxPlayers: 100, online: false, trend: "down", iconColor: "oklch(0.6 0.1 30)", iconLetter: "S" },
];

export async function fetchServers(): Promise<Server[]> {
  // TODO: Replace with live API. Simulate jitter for live feel.
  await new Promise((r) => setTimeout(r, 600));
  return MOCK_SERVERS.map((s) => ({
    ...s,
    players: s.online ? Math.max(0, s.players + Math.floor((Math.random() - 0.5) * 20)) : 0,
  }));
}
