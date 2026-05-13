export function ServerIcon({ color, letter }: { color: string; letter: string }) {
  return (
    <div
      className="relative grid h-12 w-12 shrink-0 place-items-center rounded-md font-mono text-lg font-bold text-background shadow-inner"
      style={{
        background: `linear-gradient(135deg, ${color}, oklch(0.3 0.05 260))`,
        boxShadow: `0 0 0 1px ${color}, inset 0 -6px 0 0 oklch(0 0 0 / 0.25)`,
      }}
    >
      <span className="drop-shadow">{letter}</span>
      <span className="absolute inset-0 rounded-md bg-[linear-gradient(45deg,transparent_45%,oklch(1_0_0_/_0.15)_50%,transparent_55%)]" />
    </div>
  );
}
