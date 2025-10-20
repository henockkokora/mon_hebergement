"use client";
import { useState } from 'react';
export default function AdminTheme() {
  const [accent, setAccent] = useState("#4A9B8E");
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Theme</h1>
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Identité visuelle</h2>
          <p className="text-sm text-neutral-600 mt-1">Logo, couleurs, variantes claires/sombres.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Logo du site</label>
            <div className="rounded-xl border border-dashed border-black/15 p-6 text-center bg-white/60">
              <div className="text-sm">Glissez-déposez votre logo ici ou cliquez pour sélectionner</div>
              <div className="mt-2 text-xs text-neutral-600">PNG/SVG, recommandé 256×256</div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Couleur d’accent</label>
            <div className="flex items-center gap-2">
              <input type="color" value={accent} onChange={(e)=>setAccent(e.target.value)} className="w-12 h-10 rounded-lg border border-black/10 bg-transparent" />
              <input value={accent} onChange={(e)=>setAccent(e.target.value)} className="flex-1 h-10 px-3 rounded-lg border border-black/10 bg-white/90 outline-none" />
            </div>
            <div className="mt-2 text-xs text-neutral-600">Aperçu</div>
            <div className="chip-glass px-4 py-2 inline-flex items-center gap-2" style={{ color: '#fff', backgroundColor: accent }}>Bouton principal</div>
          </div>
        </div>
      </section>
    </div>
  );
} 