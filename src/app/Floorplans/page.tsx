"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

const plantas = [
  { id: "Urbanismo", nombre: "Urban Site Plant", imagen: "/Plans/URB.webp" },
  { id: "Planta Piso Tipo", nombre: "Typical Floor Plan", imagen: "/Plans/PT.webp" },
  { id: "Planta Apartamento Tipo A", nombre: "Type A Apartment", area: "79.71 m²", habitaciones: "1", banos: "2,5", imagen: "/Plans/Apto_A.webp" },
  { id: "Planta Apartamento Tipo B", nombre: "Type B Apartment", area: "94.99 m²", habitaciones: "2", banos: "2,5", imagen: "/Plans/Apto_B.webp" },
  { id: "Planta Apartamento Tipo B1", nombre: "Type B1 Apartment", area: "94.99 m²", habitaciones: "2", banos: "2,5", imagen: "/Plans/Apto_B1.webp" },
  { id: "Planta Apartamento Tipo B2", nombre: "Type B2 Apartment", area: "94.99 m²", habitaciones: "2", banos: "2,5", imagen: "/Plans/Apto_B2.webp" },
  { id: "Planta Apartamento Tipo C", nombre: "Type C Apartment", area: "94.99 m²", habitaciones: "2", banos: "2,5", imagen: "/Plans/Apto_C.webp" },
  { id: "Planta Apartamento Tipo D", nombre: "Type D Apartment", area: "146,67 m²", habitaciones: "3", banos: "3", imagen: "/Plans/Apto_D.webp" },
  { id: "Planta Apartamento Tipo E", nombre: "Type E Apartment", area: "146,67 m²", habitaciones: "3", banos: "3", imagen: "/Plans/Apto_E.webp" },
  { id: "Planta Apartamento Tipo F", nombre: "Type F Apartment", area: "146,67 m²", habitaciones: "3", banos: "3", imagen: "/Plans/Apto_F.webp" },
  { id: "Planta Apartamento Tipo G", nombre: "Type G Apartment", area: "146,67 m²", habitaciones: "3", banos: "3", imagen: "/Plans/Apto_G.webp" },
];

export default function FloorPlansPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [rol, setRol] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // 🚨 Estado del loader
  
  const router = useRouter();

  useEffect(() => {
    fetch("/api/rol")
      .then((res) => res.json())
      .then((data) => setRol(data.rol))
      .catch(console.error);
  }, []);

  const handleVolver = () => {
    router.push(rol === "invitado" ? "/explorar" : "/dashboard");
  };

  // 🚨 Función unificada para cambiar de plano y asegurar que el loader se encienda
  const cambiarPlano = (nuevoIndice: number) => {
    if (nuevoIndice === currentIndex) return;
    setIsLoading(true); // Encendemos el loader
    setCurrentIndex(nuevoIndice);
  };

  const nextPlano = () => cambiarPlano(currentIndex === plantas.length - 1 ? 0 : currentIndex + 1);
  const prevPlano = () => cambiarPlano(currentIndex === 0 ? plantas.length - 1 : currentIndex - 1);

  const planoActual = plantas[currentIndex];

  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", zIndex: 50, background: "#0a0a0f" }}>
      
      {/* --- IMAGEN DE FONDO SÓLIDA --- */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <Image
          src="/images/login-bg.webp" 
          alt="Fondo de plantas"
          fill
          priority
          unoptimized
          style={{ objectFit: "cover" }} 
        />
      </div>

      {/* --- BOTÓN VOLVER --- */}
      <button
        onClick={handleVolver}
        style={{
          position: "absolute", top: "24px", left: "24px", zIndex: 30,
          display: "flex", alignItems: "center", gap: "8px",
          background: "rgba(255,255,255,0.1)", backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.2)", borderRadius: "12px",
          color: "#fff", padding: "10px 18px", cursor: "pointer", fontWeight: 600,
        }}
      >
        <ArrowLeft size={16} /> Volver
      </button>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div style={{ position: "relative", zIndex: 10, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px" }}>
        
        {/* Cabecera Info */}
        <div style={{ textAlign: "center", marginBottom: "30px", height: "60px" }}>
          <h1 style={{ color: "#fff", fontSize: "32px", fontWeight: 700, margin: "0 0 8px 0" }}>{planoActual.nombre}</h1>
          {planoActual.area && (
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", letterSpacing: "1px", margin: 0 }}>
              ÁREA: {planoActual.area} &nbsp;|&nbsp; HABS: {planoActual.habitaciones} &nbsp;|&nbsp; BAÑOS: {planoActual.banos}
            </p>
          )}
        </div>

        {/* Visor de Plano */}
        <div style={{ position: "relative", display: "flex", alignItems: "center", width: "100%", maxWidth: "1100px" }}>
          
          <button onClick={prevPlano} className="nav-btn" style={{ left: "-20px" }}>
            <ChevronLeft size={30} />
          </button>

          {/* CONTENEDOR DEL PLANO */}
          <div style={{
            position: "relative",
            flex: 1,
            height: "65vh",
            background: "rgba(255,255,255,0.03)", 
            borderRadius: "24px",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
          }}>
            <div style={{ 
              position: "absolute", inset: 0, opacity: 0.1, 
              backgroundImage: "radial-gradient(#fff 0.5px, transparent 0.5px)", 
              backgroundSize: "20px 20px" 
            }} />

            {/* 🚨 EL LOADER VISUAL 🚨 */}
            {isLoading && (
              <div style={{ position: "absolute", zIndex: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                <Loader2 size={40} color="#7e5ec6" className="spin-animation" />
                <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "12px", letterSpacing: "2px", textTransform: "uppercase" }}>Cargando plano...</span>
              </div>
            )}

            {/* 🚨 EL PLANO PNG (Se oculta hasta que onLoad dispare false) 🚨 */}
            <div style={{ position: "relative", width: "85%", height: "85%" }}>
              <Image
                key={planoActual.imagen} // Fuerza a React a considerar esto como una imagen totalmente nueva
                src={planoActual.imagen}
                alt={planoActual.nombre}
                fill
                priority
                unoptimized
                onLoad={() => setIsLoading(false)} // Cuando termina de cargar, apaga el loader
                style={{ 
                  objectFit: "contain", 
                  filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.4))",
                  opacity: isLoading ? 0 : 1, // Invisible mientras carga
                  transition: "opacity 0.4s ease-in-out" 
                }}
              />
            </div>
          </div>

          <button onClick={nextPlano} className="nav-btn" style={{ right: "-20px" }}>
            <ChevronRight size={30} />
          </button>
        </div>

        {/* Dots de Navegación */}
        <div style={{ display: "flex", gap: "10px", marginTop: "30px" }}>
          {plantas.map((_, i) => (
            <div 
              key={i} 
              style={{ 
                width: i === currentIndex ? "24px" : "8px", 
                height: "8px", 
                borderRadius: "4px", 
                background: i === currentIndex ? "#7e5ec6" : "rgba(255,255,255,0.2)",
                transition: "all 0.3s ease",
                cursor: "pointer"
              }}
              onClick={() => cambiarPlano(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}