"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

// APARTAMENTOS — SVG definidos como datos puros (evita recrear componentes en cada render)
const apartamentos = [
  {
    id: "Floor 09",
    nombre: "Floor 09",
    area: "65 m²",
    habitaciones: 2,
    banos: 2,
    precio: "$320.000.000",
    descripcion: "Apartamento con vista al jardín.",
    top: "31%",
    left: "55.3%",
    width: "33%",
    svgViewBox: "0 0 854 492",
    svgPath: "M0 435 426-1l428 303v69L426 102 0 491z",
  },
  {
    id: "Floor 08",
    nombre: "Floor 08",
    area: "65 m²",
    habitaciones: 2,
    banos: 2,
    precio: "$320.000.000",
    descripcion: "Apartamento con vista al jardín.",
    top: "37%",
    left: "55.3%",
    width: "33%",
    svgViewBox: "0 0 854 442",
    svgPath: "M0 389 426 0l428 269v68L426 103 0 442z",
  },
  {
    id: "Floor 07",
    nombre: "Floor 07",
    area: "65 m²",
    habitaciones: 2,
    banos: 2,
    precio: "$320.000.000",
    descripcion: "Apartamento con vista al jardín.",
    top: "43.2%",
    left: "55.3%",
    width: "33%",
    svgViewBox: "0 0 854 389",
    svgPath: "M0 336 426 0l428 234v68L426 103 0 389z",
  },
  {
    id: "Floor 06",
    nombre: "Floor 06",
    area: "65 m²",
    habitaciones: 2,
    banos: 2,
    precio: "$320.000.000",
    descripcion: "Apartamento con vista al jardín.",
    top: "49.7%",
    left: "55.3%",
    width: "33%",
    svgViewBox: "0 0 854 340",
    svgPath: "M0 287 426 0l428 199v68L426 103 0 340z",
  },
  {
    id: "Floor 05",
    nombre: "Floor 05",
    area: "65 m²",
    habitaciones: 2,
    banos: 2,
    precio: "$320.000.000",
    descripcion: "Apartamento con vista al jardín.",
    top: "56%",
    left: "55.3%",
    width: "33%",
    svgViewBox: "0 0 854 294",
    svgPath: "M0 238 426 0l428 165v71L426 104 0 294z",
  },
  {
    id: "Floor 04",
    nombre: "Floor 04",
    area: "65 m²",
    habitaciones: 2,
    banos: 2,
    precio: "$320.000.000",
    descripcion: "Apartamento con vista al jardín.",
    top: "62.5%",
    left: "55.3%",
    width: "33%",
    svgViewBox: "0 0 854 243",
    svgPath: "M0 187 426 0l428 129v71l-428-96L0 243z",
  },
  {
    id: "Floor 03",
    nombre: "Floor 03",
    area: "65 m²",
    habitaciones: 2,
    banos: 2,
    precio: "$320.000.000",
    descripcion: "Apartamento con vista al jardín.",
    top: "68.5%",
    left: "55.3%",
    width: "33%",
    svgViewBox: "0 0 854 187",
    svgPath: "M0 138 426 0l428 96v71l-428-63L0 187z",
  },
];

type Apartamento = typeof apartamentos[0];

export default function VirtualTourPage() {
  const [seleccionado, setSeleccionado] = useState<Apartamento | null>(null);
  const [rol, setRol] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/rol")
      .then((res) => res.json())
      .then((data) => setRol(data.rol))
      .catch((err) => console.error("Error obteniendo rol:", err));
  }, []);

  const handleVolver = () => {
    if (rol === "invitado") {
      router.push("/explorar");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", zIndex: 50 }}>

      <div style={{ flex: 1, position: "relative" }}>
        <Image
          src="/images/virtual-tour.webp"
          alt="Maqueta virtual"
          fill
          priority
          style={{
            objectFit: "cover", // Recuerda que puedes usar "contain" si necesitas que no se recorte
            objectPosition: "center",
          }}
        />

        <button
          onClick={handleVolver}
          style={{
            position: "absolute",
            top: "24px",
            left: "24px",
            zIndex: 20,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: "12px",
            color: "#ffffff",
            fontSize: "13px",
            fontWeight: 600,
            padding: "10px 18px",
            cursor: "pointer",
            letterSpacing: "0.05em",
            transition: "all 0.2s ease",
          }}
        >
          <ArrowLeft size={16} strokeWidth={2} />
          Volver
        </button>

        {/* 2. Renderizado de los planos usando RenderPlano */}
        {apartamentos.map((apto) => (
          <button
            key={apto.id}
            onClick={() => setSeleccionado(seleccionado?.id === apto.id ? null : apto)}
            style={{
              position: "absolute",
              top: apto.top,
              left: apto.left,
              width: apto.width,
              transform: "translate(-50%, -50%)",
              background: "transparent",
              border: "none",
              outline: "none",
              padding: 0,
              zIndex: 10,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              /* 🚨 Hace que el "cuadrado" de la caja no intercepte el mouse */
              pointerEvents: "none", 
            }}
          >
            {/* SVG renderizado desde datos puros */}
            <div 
              className={`plano-svg ${seleccionado?.id === apto.id ? 'activo' : ''}`}
              style={{ 
                width: "100%", 
                display: "block",
                pointerEvents: "visiblePainted" 
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox={apto.svgViewBox}
                style={{ width: "100%", height: "auto" }}
              >
                <path
                  fill="#7e5ec6"
                  fillRule="evenodd"
                  d={apto.svgPath}
                />
              </svg>
            </div>
          </button>
        ))}
      </div>

      {/* Panel lateral */}
      <div style={{
        position: "absolute", /* 🚨 Lo hace flotar sobre el mapa */
        right: 0,             /* 🚨 Lo pega al borde derecho */
        top: 0,               /* 🚨 Lo estira hasta arriba */
        bottom: 0,            /* 🚨 Lo estira hasta abajo */
        zIndex: 40,           /* 🚨 Asegura que esté por encima de los planos */
        width: seleccionado ? "320px" : "0px",
        transition: "all 0.4s ease",
        overflow: "hidden",
        background: "rgba(255,255,255,0.12)",
        backdropFilter: "blur(24px)",
        borderLeft: "1px solid rgba(255,255,255,0.2)",
      }}>
        {seleccionado && (
          <div style={{ padding: "40px 32px", color: "#ffffff", width: "320px" }}>
            <button
              onClick={() => setSeleccionado(null)}
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: "8px",
                color: "#fff",
                cursor: "pointer",
                padding: "6px 12px",
                fontSize: "12px",
                marginBottom: "28px",
                display: "block",
                marginLeft: "auto",
              }}
            >
              ✕ Cerrar
            </button>

            <h2 style={{ margin: "0 0 8px", fontSize: "22px", fontWeight: 700 }}>
              {seleccionado.nombre}
            </h2>

            <div style={{ height: "1px", background: "rgba(255,255,255,0.2)", margin: "16px 0" }} />

            <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "15px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ opacity: 0.7 }}>Área</span>
                <span style={{ fontWeight: 600 }}>{seleccionado.area}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ opacity: 0.7 }}>Habitaciones</span>
                <span style={{ fontWeight: 600 }}>{seleccionado.habitaciones}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ opacity: 0.7 }}>Baños</span>
                <span style={{ fontWeight: 600 }}>{seleccionado.banos}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ opacity: 0.7 }}>Precio</span>
                <span style={{ fontWeight: 600 }}>{seleccionado.precio}</span>
              </div>
            </div>

            <div style={{ height: "1px", background: "rgba(255,255,255,0.2)", margin: "16px 0" }} />

            <p style={{ opacity: 0.8, fontSize: "14px", lineHeight: 1.6 }}>
              {seleccionado.descripcion}
            </p>

            <button style={{
              marginTop: "28px",
              width: "100%",
              padding: "14px",
              borderRadius: "12px",
              border: "none",
              background: "linear-gradient(180deg, rgba(255,255,255,0.95), rgba(236,253,245,0.92))",
              color: "#0a0a0a",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.2em",
              cursor: "pointer",
              textTransform: "uppercase",
            }}>
              Ver planos
            </button>
          </div>
        )}
      </div>
    </div>
  );
}