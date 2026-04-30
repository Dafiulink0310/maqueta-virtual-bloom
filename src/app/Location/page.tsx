"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// --- INTERFAZ DE DATOS ---
// Esto le dice a TypeScript qué datos llevará cada pin cuando los agregues
interface POI {
  id: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  distancia: string;
  icon: LucideIcon;
  top: string;
  left: string;
  color: string;
  esPrincipal?: boolean;
}

// --- DATOS DE LOCALIZACIÓN VACÍOS ---
// Cuando tengas tus pines, solo llena este arreglo con los objetos.
const puntosDeInteres: POI[] = [];

export default function UbicacionPage() {
  const [seleccionado, setSeleccionado] = useState<POI | null>(null);
  const [rol, setRol] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/rol")
      .then((res) => res.json())
      .then((data) => setRol(data.rol))
      .catch(console.error);
  }, []);

  const handleVolver = () => {
    if (rol === "invitado") {
      router.push("/explorar");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", zIndex: 50, background: "#000" }}>
      
      {/* --- MAPA DE FONDO --- */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <Image
          src="/images/Location.webp" // Pon tu imagen aquí
          alt="Mapa de Localización"
          fill
          priority
          style={{ objectFit: "cover", objectPosition: "center" }}
        />

        {/* --- BOTÓN VOLVER --- */}
        <button
          onClick={handleVolver}
          style={{
            position: "absolute", top: "24px", left: "24px", zIndex: 20,
            display: "flex", alignItems: "center", gap: "8px",
            background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.3)", borderRadius: "12px",
            color: "#ffffff", fontSize: "13px", fontWeight: 600,
            padding: "10px 18px", cursor: "pointer", transition: "all 0.2s ease",
          }}
        >
          <ArrowLeft size={16} strokeWidth={2} />
          Volver
        </button>

        {/* --- PINES INTERACTIVOS (Aparecerán cuando llenes el arreglo) --- */}
        {puntosDeInteres.map((poi) => {
          const Icon = poi.icon;
          const esActivo = seleccionado?.id === poi.id;

          return (
            <button
              key={poi.id}
              onClick={() => setSeleccionado(esActivo ? null : poi)}
              style={{
                position: "absolute",
                top: poi.top,
                left: poi.left,
                transform: "translate(-50%, -50%)",
                background: esActivo ? poi.color : "rgba(255,255,255,0.9)",
                border: "none",
                borderRadius: "50%",
                width: poi.esPrincipal ? "52px" : "40px",
                height: poi.esPrincipal ? "52px" : "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: `0 0 20px ${esActivo ? poi.color : 'rgba(0,0,0,0.3)'}`,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                zIndex: esActivo ? 30 : 10,
              }}
            >
              <Icon size={poi.esPrincipal ? 24 : 18} color={esActivo ? "#fff" : poi.color} />
              
              {poi.esPrincipal && !esActivo && (
                <div className="pulse-ring" style={{ borderColor: poi.color }} />
              )}
            </button>
          );
        })}
      </div>

      {/* --- PANEL LATERAL --- */}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          zIndex: 40,
          width: seleccionado ? "320px" : "0px",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          overflow: "hidden",
          background: "rgba(10, 10, 15, 0.8)",
          backdropFilter: "blur(20px)",
          borderLeft: seleccionado ? "1px solid rgba(255,255,255,0.1)" : "none",
          color: "white",
        }}
      >
        {seleccionado && (
          <div style={{ padding: "40px 28px", width: "320px" }}>
            <button
              onClick={() => setSeleccionado(null)}
              style={{
                background: "rgba(255,255,255,0.1)", border: "none",
                color: "#fff", cursor: "pointer", float: "right",
                padding: "5px 10px", borderRadius: "5px"
              }}
            >
              ✕
            </button>
            
            <span style={{ 
              color: seleccionado.color, 
              fontSize: "11px", 
              fontWeight: 800, 
              textTransform: "uppercase", 
              letterSpacing: "0.2em" 
            }}>
              {seleccionado.categoria}
            </span>
            
            <h2 style={{ fontSize: "26px", margin: "12px 0 20px", fontWeight: 700 }}>
              {seleccionado.nombre}
            </h2>
            
            <div style={{ height: "1px", background: "rgba(255,255,255,0.1)", marginBottom: "20px" }} />
            
            <p style={{ fontSize: "15px", opacity: 0.8, lineHeight: "1.7", marginBottom: "30px" }}>
              {seleccionado.descripcion}
            </p>
            
            <div style={{ 
              padding: "20px", 
              background: "rgba(255,255,255,0.05)", 
              borderRadius: "16px",
              border: "1px solid rgba(255,255,255,0.1)"
            }}>
              <p style={{ fontSize: "12px", opacity: 0.5, marginBottom: "4px" }}>Distancia estimada</p>
              <p style={{ fontSize: "18px", fontWeight: 600 }}>{seleccionado.distancia}</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}