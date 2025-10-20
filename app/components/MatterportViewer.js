"use client";

import React from "react";

/**
 * MatterportViewer
 *
 * Props:
 * - modelId: string (ex: "Hn3p9Qk1AbC")
 * - shareUrl: optional full share URL from Matterport (overrides modelId)
 * - title: optional, for accessibility
 * - height: CSS height (default: 500px)
 *
 * Renders a responsive iframe for a Matterport 3D tour.
 */
export default function MatterportViewer({ modelId, shareUrl, title = "Visite virtuelle", height = "500px" }) {
  if (!modelId && !shareUrl) {
    return (
      <div className="rounded-2xl border border-black/10 bg-gray-50 p-6 text-center text-gray-500">
        Aucune visite virtuelle disponible pour cette annonce.
      </div>
    );
  }

  const src = shareUrl || `https://my.matterport.com/show/?m=${encodeURIComponent(modelId)}&play=1&lang=fr`;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-black/10 bg-white">
      <iframe
        title={title}
        src={src}
        allow="xr-spatial-tracking; fullscreen; vr; autoplay"
        allowFullScreen
        className="w-full"
        style={{ height }}
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
