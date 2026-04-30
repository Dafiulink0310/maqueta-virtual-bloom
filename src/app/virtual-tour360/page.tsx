"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Hand } from "lucide-react";
import Lottie, { LottieRefCurrentProps } from "lottie-react";

import mascarasData from "./mascaras.json";

const PIXELS_PER_SECOND = 15;
const VIDEO_DURATION = 15;

// ── Tipos ──
interface Apartamento360 {
  id: string;
  nombre: string;
  area: string;
  hab: number;
  banos: number;
  precio: string;
  estado: string;
}

interface Piso {
  id: string;
  nombre: string;
  descripcion: string;
  indices: number[];
  apartamentos: Apartamento360[];
}

const generarApartamentos = (pisoPrefix: string): Apartamento360[] => [
  { id: `${pisoPrefix}01`, nombre: `Floor ${pisoPrefix}01`, area: "65 m²", hab: 2, banos: 2, precio: "$320.000.000", estado: "DISPONIBLE" },
  { id: `${pisoPrefix}02`, nombre: `Floor ${pisoPrefix}02`, area: "68 m²", hab: 2, banos: 2, precio: "$325.000.000", estado: "DISPONIBLE" },
  { id: `${pisoPrefix}03`, nombre: `Floor ${pisoPrefix}03`, area: "65 m²", hab: 2, banos: 2, precio: "$320.000.000", estado: "DISPONIBLE" },
  { id: `${pisoPrefix}04`, nombre: `Floor ${pisoPrefix}04`, area: "70 m²", hab: 3, banos: 2, precio: "$340.000.000", estado: "DISPONIBLE" },
  { id: `${pisoPrefix}05`, nombre: `Floor ${pisoPrefix}05`, area: "60 m²", hab: 1, banos: 1, precio: "$280.000.000", estado: "DISPONIBLE" },
];

const INITIAL_PISOS: Piso[] = [
  { id: "Floor 09", nombre: "Floor 09", descripcion: "Penthouse con vista panorámica 360°.", indices: [1, 29, 31, 33], apartamentos: generarApartamentos("9") },
  { id: "Floor 08", nombre: "Floor 08", descripcion: "Apartamentos de gran altura.", indices: [5, 35, 37, 39], apartamentos: generarApartamentos("8") },
  { id: "Floor 07", nombre: "Floor 07", descripcion: "Ubicación ideal.", indices: [9, 41, 43, 45], apartamentos: generarApartamentos("7") },
  { id: "Floor 06", nombre: "Floor 06", descripcion: "Ubicación ideal.", indices: [49, 51, 13, 47], apartamentos: generarApartamentos("6") },
  { id: "Floor 05", nombre: "Floor 05", descripcion: "Ubicación ideal.", indices: [53, 17, 55, 57], apartamentos: generarApartamentos("5") },
  { id: "Floor 04", nombre: "Floor 04", descripcion: "Ubicación ideal.", indices: [63, 21, 59, 61], apartamentos: generarApartamentos("4") },
  { id: "Floor 03", nombre: "Floor 03", descripcion: "Ubicación ideal.", indices: [25, 65, 67, 69], apartamentos: generarApartamentos("3") },
];

export default function VirtualTourV2() {
  const [pisos, setPisos] = useState<Piso[]>(INITIAL_PISOS);
  const [seleccionado, setSeleccionado] = useState<Piso | null>(null);
  const [dragging, setDragging] = useState(false);


  const videoRef = useRef<HTMLVideoElement>(null);
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  
  const isDragging = useRef(false);
  const hasDragged = useRef(false); 
  const startX = useRef(0);
  const lastX = useRef(0);

  const virtualTime = useRef(0);
  const pendingDelta = useRef(0);
  const rafRef = useRef<number | undefined>(undefined);
  const lastSeekTime = useRef(0);

  const router = useRouter();

  useEffect(() => {
    const sincronizarConCRM = () => {
      const data = localStorage.getItem("bloom_inventory");
      if (!data) return;

      try {
        const inventarioDelCRM: Array<{ id: string | number; estado: string }> = JSON.parse(data);

        setPisos(prevPisos => {
          let huboCambio = false;
          const nuevosPisos = prevPisos.map(piso => ({
            ...piso,
            apartamentos: piso.apartamentos.map(apto => {
              const match = inventarioDelCRM.find(u => u.id.toString() === apto.id.toString());
              if (!match) return apto;

              const nuevoEstado =
                match.estado === "AVAILABLE" ? "DISPONIBLE" :
                (match.estado === "RESERVED" || match.estado === "LEGAL PROCESS") ? "RESERVADO" :
                "VENDIDO";

              if (apto.estado !== nuevoEstado) {
                huboCambio = true;
                return { ...apto, estado: nuevoEstado };
              }
              return apto;
            }),
          }));

          if (!huboCambio) return prevPisos;

          // Sincronizar el panel lateral si hay un piso seleccionado
          setSeleccionado(prev => {
            if (!prev) return null;
            const pisoActualizado = nuevosPisos.find(p => p.id === prev.id);
            return pisoActualizado ? { ...pisoActualizado } : prev;
          });

          return nuevosPisos;
        });
      } catch (e) {
        console.error("Error sincronizando:", e);
      }
    };

    window.addEventListener("storage", sincronizarConCRM);
    sincronizarConCRM();

    return () => window.removeEventListener("storage", sincronizarConCRM);
  }, []);
  const handleVolver = () => router.push("/explorar");
  
  const stopAutoPlay = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      virtualTime.current = videoRef.current.currentTime;
    }
  }, []);

  const scrub = useCallback((deltaX: number) => {
    pendingDelta.current += deltaX;
    if (rafRef.current !== undefined) return;

    rafRef.current = requestAnimationFrame(() => {
      const video = videoRef.current;
      if (video && video.duration) {
        const duration = video.duration || VIDEO_DURATION;
        virtualTime.current += pendingDelta.current / PIXELS_PER_SECOND;
        virtualTime.current = ((virtualTime.current % duration) + duration) % duration;
        
        const now = Date.now();
        if (now - lastSeekTime.current > 40) {
          video.currentTime = virtualTime.current;
          lastSeekTime.current = now;
        }
      }
      pendingDelta.current = 0;
      rafRef.current = undefined;
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        stopAutoPlay();
        if (videoRef.current && !videoRef.current.paused) {
          videoRef.current.pause();
          virtualTime.current = videoRef.current.currentTime;
        }
        const deltaX = e.key === "ArrowLeft" ? -15 : 15;
        scrub(deltaX);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [scrub, stopAutoPlay]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let callbackId: number;
    const onFrame = (_now: number, metadata: { mediaTime: number }) => {
      if (lottieRef.current) {
        lottieRef.current.goToAndStop(metadata.mediaTime * 1000, false);
      }
      callbackId = video.requestVideoFrameCallback(onFrame);
    };
    callbackId = video.requestVideoFrameCallback(onFrame);
    return () => {
      if (callbackId !== undefined) video.cancelVideoFrameCallback(callbackId);
    };
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    stopAutoPlay();
    isDragging.current = true;
    hasDragged.current = false; 
    startX.current = e.clientX;
    lastX.current = e.clientX;
    setDragging(true);
    e.preventDefault();
  };

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current) return;
    if (Math.abs(e.clientX - startX.current) > 5) hasDragged.current = true; 
    scrub(lastX.current - e.clientX);
    lastX.current = e.clientX;
  }, [scrub]);

  const onMouseUp = useCallback(() => {
    isDragging.current = false;
    setDragging(false);
  }, []);

  const onTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest("button") || (e.target as HTMLElement).closest(".sidebar-scroll")) return;
    stopAutoPlay();
    isDragging.current = true;
    hasDragged.current = false;
    startX.current = e.touches[0].clientX;
    lastX.current = e.touches[0].clientX;
  };

  const onTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging.current) return;
    if (Math.abs(e.touches[0].clientX - startX.current) > 5) hasDragged.current = true;
    scrub(lastX.current - e.touches[0].clientX);
    lastX.current = e.touches[0].clientX;
  }, [scrub]);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onMouseUp);
    };
  }, [onMouseMove, onMouseUp, onTouchMove]);

  const handleLottieClick = (e: React.MouseEvent) => {
    if (hasDragged.current) return;
    const target = e.target as HTMLElement;
    if (target.tagName.toLowerCase() === 'path') {
      const todosLosPaths = Array.from(document.querySelectorAll('.lottie-wrapper svg path'));
      const indexTocado = todosLosPaths.indexOf(target as unknown as SVGPathElement);
      const pisoEncontrado = pisos.find(p => p.indices.includes(indexTocado));
      if (pisoEncontrado) {
        setSeleccionado(prev => prev?.id === pisoEncontrado.id ? null : pisoEncontrado);
      } else {
        setSeleccionado(null); 
      }
    } else {
      setSeleccionado(null); 
    }
  };

  useEffect(() => {
    const todosLosPaths = document.querySelectorAll('.lottie-wrapper svg path');
    todosLosPaths.forEach((path, index) => {
      if (seleccionado && seleccionado.indices && seleccionado.indices.includes(index)) {
        path.setAttribute("data-activo", "true");
      } else {
        path.removeAttribute("data-activo");
      }
    });
  }, [seleccionado]);

  const getBadgeStyles = (estado: string) => {
    switch(estado) {
      case "AVAILABLE": case "DISPONIBLE": return { bg: "rgba(16, 185, 129, 0.2)", color: "#34d399", border: "rgba(16, 185, 129, 0.4)" };
      case "RESERVED": case "RESERVADO": return { bg: "rgba(245, 158, 11, 0.2)", color: "#fbbf24", border: "rgba(245, 158, 11, 0.4)" };
      case "SOLD": case "VENDIDO": return { bg: "rgba(239, 68, 68, 0.15)", color: "#f87171", border: "rgba(239, 68, 68, 0.3)" };
      default: return { bg: "rgba(255,255,255,0.1)", color: "#fff", border: "rgba(255,255,255,0.2)" };
    }
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 50, background: "#08080f" }}
      onMouseDown={onMouseDown} 
      onTouchStart={onTouchStart}
    >
      <video
        ref={videoRef}
        src="/videos/edificio-rotacion.mp4"
        autoPlay muted playsInline loop preload="auto"
        style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          objectFit: "cover", objectPosition: "center",
          pointerEvents: "none", userSelect: "none", zIndex: 0,
        }}
      />

      <div
        className={`lottie-wrapper ${seleccionado ? 'activo' : ''}`}
        onClick={handleLottieClick}
        style={{
          position: "absolute", inset: 0, zIndex: 5,
          pointerEvents: "none"
        }}
      >
        <Lottie
          lottieRef={lottieRef}
          animationData={mascarasData}
          autoplay={false}
          loop={false}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          rendererSettings={{ preserveAspectRatio: 'xMidYMid slice' }}
        />
      </div>

      <div style={{ position: "absolute", bottom: "40px", left: "50%", transform: "translateX(-50%)", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", opacity: dragging ? 0 : 0.6, transition: "opacity 0.3s", pointerEvents: "none" }}>
        <Hand color="white" size={24} className="animate-bounce" />
        <span style={{ color: "white", fontSize: "12px", letterSpacing: "2px", fontWeight: 300 }}>ARRASTRA PARA ROTAR</span>
      </div>



      <div style={{ position: "absolute", inset: 0, zIndex: 20, pointerEvents: "none" }}>
        <button
          onClick={handleVolver}
          style={{
            position: "absolute", top: "24px", left: "24px",
            display: "flex", alignItems: "center", gap: "8px",
            background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.25)", borderRadius: "12px",
            color: "#ffffff", fontSize: "13px", fontWeight: 600,
            padding: "10px 18px", cursor: "pointer", pointerEvents: "auto",
          }}
        >
          <ArrowLeft size={16} strokeWidth={2} /> Volver
        </button>
      </div>

      <div 
        className="sidebar-scroll"
        style={{
          position: "absolute", right: 0, top: 0, bottom: 0, zIndex: 40,
          width: seleccionado ? "360px" : "0px", transition: "all 0.4s ease", 
          overflowY: "auto", overflowX: "hidden", pointerEvents: seleccionado ? "auto" : "none",
          background: "rgba(20, 20, 25, 0.65)", backdropFilter: "blur(24px)", 
          borderLeft: seleccionado ? "1px solid rgba(255,255,255,0.15)" : "none",
      }}>
        {seleccionado && (
          <div style={{ padding: "40px 28px", color: "#ffffff", width: "360px" }}>
            <button
              onClick={() => setSeleccionado(null)}
              style={{
                background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px",
                color: "#fff", cursor: "pointer", padding: "6px 12px", fontSize: "12px",
                marginBottom: "24px", display: "block", marginLeft: "auto",
              }}
            >
              ✕ Cerrar
            </button>
            <h2 style={{ margin: 0, fontSize: "26px", fontWeight: 700 }}>{seleccionado.nombre}</h2>
            <p style={{ margin: "10px 0 24px", opacity: 0.7, fontSize: "14px", lineHeight: 1.5 }}>{seleccionado.descripcion}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {seleccionado.apartamentos.map((apto: Apartamento360) => {
                const bStyle = getBadgeStyles(apto.estado);
                return (
                  <div key={apto.id} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "14px", padding: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                      <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}>{apto.nombre}</h3>
                      <span style={{ background: bStyle.bg, color: bStyle.color, border: `1px solid ${bStyle.border}`, padding: "4px 10px", borderRadius: "20px", fontSize: "10px", fontWeight: 700 }}>
                        {apto.estado}
                      </span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "13px" }}>
                      <div><span style={{ opacity: 0.5, fontSize: "11px" }}>Área</span><br/>{apto.area}</div>
                      <div><span style={{ opacity: 0.5, fontSize: "11px" }}>Hab</span><br/>{apto.hab}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}