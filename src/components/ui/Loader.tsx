// src/components/ui/Loader.tsx
"use client";

import { useEffect, useRef } from "react";

interface LoaderProps {
  isLoading: boolean;
}

export default function Loader({ isLoading }: LoaderProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isLoading && videoRef.current) {
      videoRef.current.play().catch(error => {
        console.error("El auto-play falló:", error);
      });
    }
  }, [isLoading]);

  return (
    <div
      className={`fixed top-0 left-0 z-[9999] flex flex-col items-center justify-center bg-black transition-opacity duration-1000 ease-in-out ${
        isLoading ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      style={{ width: '100vw', height: '100vh' }}
    >
      {/* 1. VIDEO DE FONDO */}
      <video
        ref={videoRef}
        src="/videos/Loader-Bloom.mp4"
        muted
        loop
        playsInline
        className="absolute top-0 left-0"
        style={{ width: '100vw', height: '100vh', objectFit: 'cover' }} 
      />
      
      {/* 2. CAPA DE TRANSPARENCIA: oscurece el video para que no protagonice */}
      {/* Capa base sólida oscura + desenfoque medio */}
      <div className="absolute top-0 left-0 bg-black/92 backdrop-blur-md" style={{ width: '100vw', height: '100vh' }} />
      {/* Gradiente extra: más oscuro en los bordes */}
      <div
        className="absolute top-0 left-0"
        style={{
          width: '100vw',
          height: '100vh',
          background: 'radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.7) 100%)',
        }}
      />
    </div>
  );
}
