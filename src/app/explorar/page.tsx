"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Building2,
  Trees,
  Play,
  LayoutGrid,
  Layers,
  View,
  LogOut,
} from "lucide-react";

export default function SidebarBasica() {
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();

  const navItems = [
    { name: "LOCATION", href: "/Location", icon: MapPin },
    { name: "ARCHITECTURE", href: "/architecture", icon: Building2 },
    { name: "COMMON AREAS", href: "/common-areas", icon: Trees },
    { name: "VIDEO", href: "/video", icon: Play },
    { name: "APARTMENT FLOOR PLANS", href: "/apartment-floor-plans", icon: LayoutGrid },
    { name: "FLOOR PLANS", href: "/Floorplans", icon: Layers },
    { name: "VIRTUAL TOUR", href: "/virtual-tour", icon: View },
    { name: "VIRTUAL TOUR 360°", href: "/virtual-tour360", icon: View },
  ];

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: isOpen ? "320px" : "0px",
          right: 0,
          bottom: "0",
          zIndex: -1,
          transition: "left 0.4s ease",
        }}
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center center",
            zIndex: 0, /* Asegúrate de que quede por debajo de tu contenido */
          }}
        >
          {/* Cambia la ruta por la ubicación real de tu video en la carpeta public */}
          <source src="/videos/sidebar-bg.mp4" type="video/mp4" />
          
          {/* Mensaje de respaldo por si el navegador es muy antiguo */}
          Tu navegador no soporta videos HTML5.
        </video>
      </div>

      <aside
        className="fixed left-0 top-0 flex h-screen w-[320px] flex-col py-[80px]"
        style={{
          background: "linear-gradient(180deg, #9bb0f7 0%, #c1b3e4 50%, #e6afc1 100%)",
          transform: isOpen ? "translateX(0)" : "translateX(-320px)",
          transition: "transform 0.4s ease",
          zIndex: 10,
        }}
      >
        {/* Logo */}
        <div className="flex w-full justify-start px-[40px]">
          <Image
            src="/images/Logo-Bloom.webp"
            alt="Bloom Logo"
            width={180}
            height={70}
            priority
            className="h-auto w-[220px] object-contain brightness-0 invert"
          />
        </div>

        {/* Navegación */}
        <nav className="flex flex-col items-start px-[40px]" style={{ gap: "25px", paddingTop: "280px" }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                style={{ color: "#ffffff", textDecoration: "none", fontSize: "20px", display: "flex", alignItems: "center", gap: "12px" }}
                className="font-[family-name:var(--font-poppins)] font-semibold tracking-wider antialiased transition-all duration-300 hover:translate-x-2 hover:opacity-90"
              >
                <Icon size={20} strokeWidth={2} />
                {item.name}
              </Link>
            );
          })}

          {/* LOG OUT — separado como botón */}
          <button
            onClick={handleLogout}
            style={{
              color: "#ffffff",
              fontSize: "20px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
            className="font-[family-name:var(--font-poppins)] font-semibold tracking-wider antialiased transition-all duration-300 hover:translate-x-2 hover:opacity-90"
          >
            <LogOut size={20} strokeWidth={2} />
            LOG OUT
          </button>
        </nav>
      </aside>

      {/* Botón toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          top: "50%",
          left: isOpen ? "320px" : "0px",
          transform: "translateY(-50%)",
          transition: "left 0.4s ease",
          zIndex: 100,
          background: "rgba(255,255,255,0.20)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.4)",
          borderRadius: "0 8px 8px 0",
          width: "24px",
          height: "60px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ffffff",
          fontSize: "16px",
        }}
      >
        {isOpen ? "‹" : "›"}
      </button>
    </>
  );
}