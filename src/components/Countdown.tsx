"use client";

import { useEffect, useState } from "react";

const units = [
  ["Дн", 86_400_000],
  ["Ч", 3_600_000],
  ["Мин", 60_000],
  ["Сек", 1000],
] as const;

// shortcut: deadline is "end of this week" on the client, move to promo data in DB if promos become real
function endOfWeek() {
  const d = new Date();
  d.setDate(d.getDate() + ((7 - d.getDay()) % 7));
  d.setHours(23, 59, 59, 0);
  return d.getTime();
}

export function Countdown() {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const deadline = endOfWeek();
    const tick = () => setLeft(Math.max(0, deadline - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex gap-2" role="timer" aria-label="До конца акции">
      {units.map(([label, ms], i) => {
        const value = left === null ? null : Math.floor((i === 0 ? left : left % units[i - 1][1]) / ms);
        return (
          <div key={label} className="flex size-14 flex-col items-center justify-center rounded-full bg-card">
            <span className="text-base font-semibold tabular-nums">{value === null ? "--" : String(value).padStart(2, "0")}</span>
            <span className="text-[10px] text-muted">{label}</span>
          </div>
        );
      })}
    </div>
  );
}
