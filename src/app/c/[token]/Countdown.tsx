"use client";
import { useEffect, useState } from "react";

export default function Countdown({ iso, color }: { iso: string; color: string }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (now == null) return null;
  const diff = Math.max(0, new Date(iso).getTime() - now);
  const parts = [
    [Math.floor(diff / 86400000), "dias"],
    [Math.floor(diff / 3600000) % 24, "horas"],
    [Math.floor(diff / 60000) % 60, "min"],
    [Math.floor(diff / 1000) % 60, "seg"],
  ] as const;
  if (diff === 0) return <p className="mt-6 text-center text-xl font-bold" style={{ color }}>🎉 É hoje!</p>;
  return (
    <div className="mt-6 flex justify-center gap-2">
      {parts.map(([v, l]) => (
        <div key={l} className="w-16 rounded-xl bg-white py-2 text-center shadow-sm">
          <p className="text-2xl font-bold tabular-nums" style={{ color }}>{v}</p>
          <p className="text-xs text-zinc-500">{l}</p>
        </div>
      ))}
    </div>
  );
}
