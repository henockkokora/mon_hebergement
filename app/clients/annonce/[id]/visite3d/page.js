"use client";
import dynamic from "next/dynamic";
import { useState, Suspense } from "react";

// Dynamically import react-three-fiber and Drei only on client
const Canvas = dynamic(() => import('@react-three/fiber').then(m => m.Canvas), { ssr: false });
const OrbitControls = dynamic(() => import('@react-three/drei').then(m => m.OrbitControls), { ssr: false });
const PerspectiveCamera = dynamic(() => import('@react-three/drei').then(m => m.PerspectiveCamera), { ssr: false });

function IconBack({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function Room() {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#eeeeee" />
      </mesh>
      {/* Walls */}
      <mesh position={[0, 1.5, -5]} castShadow receiveShadow>
        <boxGeometry args={[10, 3, 0.2]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>
      <mesh position={[0, 1.5, 5]} castShadow receiveShadow>
        <boxGeometry args={[10, 3, 0.2]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>
      <mesh position={[5, 1.5, 0]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[10, 3, 0.2]} />
        <meshStandardMaterial color="#fafafa" />
      </mesh>
      <mesh position={[-5, 1.5, 0]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[10, 3, 0.2]} />
        <meshStandardMaterial color="#fafafa" />
      </mesh>
      {/* Simple furniture */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[1.5, 1, 1]} />
        <meshStandardMaterial color="#4A9B8E" />
      </mesh>
    </group>
  );
}

function Visite3DPage() {
  const [hint, setHint] = useState(true);
  return (
    <div className="min-h-screen vh-stable bg-gradient-to-b from-neutral-50 to-white text-neutral-900">
      <div className="max-w-[1200px] mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] leading-7 md:text-2xl font-semibold text-neutral-900">Visite 3D</h1>
          <span className="hidden lg:inline">
            <a href=".." className="chip-glass px-3 py-1.5 inline-flex items-center gap-2 text-[13px] font-medium"><IconBack className="w-4 h-4"/> Retour</a>
          </span>
        </div>
      </div>
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="relative rounded-2xl overflow-hidden border border-black/10 bg-white/70" style={{height: '70vh'}}>
          {/* Back control overlayed on top-left of the viewport */}
          <div className="absolute top-3 left-3 z-10">
            <a href=".." aria-label="Retour" className="lg:hidden inline-flex items-center justify-center border border-black/10 bg-white/95 rounded-full w-10 h-10 chip-glass">
              <IconBack className="w-5 h-5" />
            </a>
          </div>
          <Canvas shadows camera={{ position: [3, 2, 6], fov: 60 }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[4, 6, 4]} intensity={0.8} castShadow />
            <Room />
            <OrbitControls enableDamping dampingFactor={0.05} />
            <PerspectiveCamera makeDefault position={[3, 2, 6]} fov={60} />
          </Canvas>
          {hint && (
            <div className="absolute top-3 left-3 chip-glass px-3 py-1.5 text-[13px]">Astuce: pincez pour zoomer, glissez pour pivoter, double-tapez pour recadrer.</div>
          )}
        </div>
      </div>
      <div className="max-w-[1200px] mx-auto px-4 py-3 flex items-center gap-2">
        <button onClick={()=>setHint(false)} className="chip-glass px-3 py-1.5 text-[13px] font-medium">Masquer l’astuce</button>
        <a href="#" className="chip-glass px-3 py-1.5 text-[13px] font-medium">Visite extérieure</a>
        <a href="#" className="chip-glass px-3 py-1.5 text-[13px] font-medium">Salon</a>
        <a href="#" className="chip-glass px-3 py-1.5 text-[13px] font-medium">Cuisine</a>
        <a href="#" className="chip-glass px-3 py-1.5 text-[13px] font-medium">Chambre</a>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement de la visite 3D...</div>}>
      <Visite3DPage />
    </Suspense>
  );
}
