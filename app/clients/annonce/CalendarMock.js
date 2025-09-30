"use client";
import { useMemo, useState } from "react";

export default function CalendarMock({ onSelect }) {
  const days = useMemo(() => Array.from({ length: 30 }).map((_, i) => i + 1), []);
  const [sel, setSel] = useState([]);
  return (
    <div className="rounded-2xl border border-black/10 bg-white/70 p-3">
      <div className="text-sm font-semibold">Disponibilités</div>
      <div className="mt-2 grid grid-cols-7 gap-2 text-sm">
        {days.map((d) => (
          <button
            key={d}
            onClick={() => {
              const s = sel.includes(d) ? sel.filter((x) => x !== d) : [...sel, d];
              setSel(s);
              onSelect?.(s);
            }}
            className={`h-10 rounded-md ${sel.includes(d) ? 'bg-neutral-900 text-white' : 'hover:bg-black/[.06]'}`}
          >
            {d}
          </button>
        ))}
      </div>
    </div>
  );
}
