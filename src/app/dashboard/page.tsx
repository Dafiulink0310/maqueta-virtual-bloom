"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  Search, Edit2, Home, Building2, Users, Calendar, LogOut,
  Maximize, Bed, ArrowLeft
} from "lucide-react";

// ─── DATA DE LOS 35 APARTAMENTOS (FIJA Y SEGURA) ───
const pisosConfig = [{ id: "9", n: "Floor 9" }, { id: "8", n: "Floor 8" }, { id: "7", n: "Floor 7" }, { id: "6", n: "Floor 6" }, { id: "5", n: "Floor 5" }, { id: "4", n: "Floor 4" }, { id: "3", n: "Floor 3" }];
const INITIAL_UNITS = pisosConfig.flatMap((p) => [
  { id: `${p.id}01`, nombre: `Floor ${p.id}01`, piso: p.n, area: "65", hab: 2, banos: 2, precio: "$320,000,000", estado: "AVAILABLE" },
  { id: `${p.id}02`, nombre: `Floor ${p.id}02`, piso: p.n, area: "68", hab: 2, banos: 2, precio: "$325,000,000", estado: "SOLD" },
  { id: `${p.id}03`, nombre: `Floor ${p.id}03`, piso: p.n, area: "65", hab: 2, banos: 2, precio: "$320,000,000", estado: "AVAILABLE" },
  { id: `${p.id}04`, nombre: `Floor ${p.id}04`, piso: p.n, area: "70", hab: 3, banos: 2, precio: "$340,000,000", estado: "RESERVED" },
  { id: `${p.id}05`, nombre: `Floor ${p.id}05`, piso: p.n, area: "60", hab: 1, banos: 1, precio: "$280,000,000", estado: "AVAILABLE" },
]);

// ─── CONFIGURACIÓN DE ETAPAS Y COMPRADORES ───
const STAGES = [
  { id: "lead", name: "NEW LEADS", color: "#a78bfa" },
  { id: "reservation", name: "RESERVATION", color: "#fbbf24" },
  { id: "legal", name: "LEGAL PROCESS", color: "#60a5fa" },
  { id: "sold", name: "CLOSED / SOLD", color: "#34d399" },
];

const INITIAL_BUYERS = [
  { id: "buyer-1", name: "Alexander Miller", unitId: "901", unitName: "Floor 901", stage: "lead", phone: "+1 234 567", email: "alex@example.com" },
  { id: "buyer-2", name: "Sarah Jenkins", unitId: "805", unitName: "Floor 805", stage: "reservation", phone: "+1 987 654", email: "sarah@test.com" },
  { id: "buyer-3", name: "Roberto Gomez", unitId: "702", unitName: "Floor 702", stage: "legal", phone: "+57 300 123", email: "roberto@gomez.com" },
  { id: "buyer-4", name: "Elena Petrova", unitId: "902", unitName: "Floor 902", stage: "sold", phone: "+7 900 456", email: "elena@web.com" },
];

export default function CRMMaster() {
  const [activeTab, setActiveTab] = useState("PROPERTY"); 
  const [isOpen, setIsOpen] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("ALL");
  const [highlightedBuyer, setHighlightedBuyer] = useState<string | null>(null);
  
  const [unidades, setUnidades] = useState(INITIAL_UNITS);
  const [buyers, setBuyers] = useState(INITIAL_BUYERS);
  const router = useRouter();
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup del timeout de highlight al desmontar
  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
    };
  }, []);

  // 🚨 Función para vincular Inventario con Clientes
  const viewBuyerDetails = useCallback((unitId: string) => {
    const buyer = buyers.find(b => b.unitId === unitId);
    if (buyer) {
      setHighlightedBuyer(buyer.id);
      setActiveTab("CLIENTS");
      if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
      highlightTimeoutRef.current = setTimeout(() => setHighlightedBuyer(null), 3000);
    }
  }, [buyers]);

  // 🚨 Lógica de Inventario
  const unidadesFiltradas = useMemo(() => {
    return unidades.filter((u) => {
      const matchSearch = u.nombre.toLowerCase().includes(busqueda.toLowerCase()) || u.precio.includes(busqueda);
      const matchEstado = filtroEstado === "ALL" || u.estado === filtroEstado;
      return matchSearch && matchEstado;
    });
  }, [busqueda, filtroEstado, unidades]);

  // 🚨 Lógica de Pipeline Sincronizada
  const moveStage = (id: string, currentStage: string, direction: 'next' | 'back') => {
    const currentIndex = STAGES.findIndex(s => s.id === currentStage);
    let nextIndex = currentIndex;
    
    if (direction === 'next' && currentIndex < STAGES.length - 1) nextIndex = currentIndex + 1;
    else if (direction === 'back' && currentIndex > 0) nextIndex = currentIndex - 1;
    
    if (nextIndex !== currentIndex) {
      const nextStageId = STAGES[nextIndex].id;

      // 1. Mover al comprador en el estado local del CRM
      setBuyers(prev => prev.map(b => b.id === id ? { ...b, stage: nextStageId } : b));

      // 2. Sincronizar con el Inventario y el Visor 360
      const buyer = buyers.find(b => b.id === id);
      if (buyer) {
        // TRADUCCIÓN: Si es 'sold' -> SOLD | Si es 'reservation' o 'legal' -> RESERVED | Si es 'lead' -> AVAILABLE
        const nuevoEstado = (nextStageId === "sold") ? "SOLD" : 
                            (nextStageId === "reservation" || nextStageId === "legal") ? "RESERVED" : 
                            "AVAILABLE";
        
        const nuevoInventario = unidades.map(u => {
            // Buscamos el apartamento por ID (ej: "901")
            if (u.id.includes(buyer.unitId)) return { ...u, estado: nuevoEstado };
            return u;
        });

        // 3. Guardar y Notificar
        setUnidades(nuevoInventario);
        localStorage.setItem("bloom_inventory", JSON.stringify(nuevoInventario));
        window.dispatchEvent(new Event("storage")); 
      }
    }
  };

  const getBadgeStyles = (estado: string) => {
    switch(estado) {
      case "AVAILABLE": return { bg: "rgba(52, 211, 153, 0.1)", color: "#34d399", border: "rgba(52, 211, 153, 0.2)" };
      case "RESERVED": return { bg: "rgba(251, 191, 36, 0.1)", color: "#fbbf24", border: "rgba(251, 191, 36, 0.2)" };
      case "SOLD": return { bg: "rgba(248, 113, 113, 0.1)", color: "#f87171", border: "rgba(248, 113, 113, 0.2)" };
      default: return { bg: "rgba(255,255,255,0.05)", color: "#fff", border: "rgba(255,255,255,0.1)" };
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#08080f", color: "#fff", overflow: "hidden" }}>
      
      {/* ─── SIDEBAR BLOOM ─── */}
      <aside className="fixed left-0 top-0 flex h-screen w-[320px] flex-col py-[80px]"
        style={{
          background: "linear-gradient(180deg, #9bb0f7 0%, #c1b3e4 50%, #e6afc1 100%)",
          transform: isOpen ? "translateX(0)" : "translateX(-320px)",
          transition: "transform 0.4s ease", zIndex: 100
        }}>
        <div className="flex w-full justify-start px-[40px]">
          <Image src="/images/Logo-Bloom.webp" alt="Logo" width={180} height={70} className="brightness-0 invert" priority />
        </div>

        <nav className="flex flex-col items-start px-[40px]" style={{ gap: "25px", paddingTop: "280px" }}>
          <button onClick={() => setActiveTab("HOME")} style={{ color: "#fff", display: "flex", alignItems: "center", gap: "12px", fontSize: "20px", fontWeight: "600", background: "none", border: "none", cursor: "pointer", opacity: activeTab === "HOME" ? 1 : 0.8 }}><Home size={20}/> HOME</button>
          <button onClick={() => setActiveTab("PROPERTY")} style={{ color: "#fff", display: "flex", alignItems: "center", gap: "12px", fontSize: "20px", fontWeight: "600", background: "none", border: "none", cursor: "pointer", opacity: activeTab === "PROPERTY" ? 1 : 0.8 }}><Building2 size={20}/> PROPERTY</button>
          <button onClick={() => setActiveTab("CLIENTS")} style={{ color: "#fff", display: "flex", alignItems: "center", gap: "12px", fontSize: "20px", fontWeight: "600", background: "none", border: "none", cursor: "pointer", opacity: activeTab === "CLIENTS" ? 1 : 0.8 }}><Users size={20}/> CLIENTS</button>
          <button onClick={() => setActiveTab("SCHEDULE")} style={{ color: "#fff", display: "flex", alignItems: "center", gap: "12px", fontSize: "20px", fontWeight: "600", background: "none", border: "none", cursor: "pointer", opacity: activeTab === "SCHEDULE" ? 1 : 0.8 }}><Calendar size={20}/> SCHEDULE</button>
          <button onClick={() => router.push("/login")} style={{ color: "#fff", display: "flex", alignItems: "center", gap: "12px", fontSize: "20px", fontWeight: "600", background: "none", border: "none", cursor: "pointer", marginTop: "10px" }}><LogOut size={20}/> LOG OUT</button>
        </nav>
      </aside>

      {/* TOGGLE BUTTON */}
      <button onClick={() => setIsOpen(!isOpen)} style={{ position: "fixed", top: "50%", left: isOpen ? "320px" : "0px", transform: "translateY(-50%)", transition: "left 0.4s ease", zIndex: 110, background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.4)", borderRadius: "0 8px 8px 0", width: "24px", height: "60px", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{isOpen ? "‹" : "›"}</button>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, marginLeft: isOpen ? "320px" : "0px", transition: "margin-left 0.4s ease", padding: "50px", width: "100%", overflowY: "auto" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
          <div>
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px", fontWeight: "bold", letterSpacing: "2.5px" }}>{activeTab} PANEL</span>
            <h1 style={{ fontSize: "32px", fontWeight: "700", margin: "5px 0 0 0" }}>Welcome, Alexander</h1>
          </div>
          {activeTab === "PROPERTY" && (
            <div style={{ position: "relative" }}>
              <Search style={{ position: "absolute", left: "15px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.2)" }} size={18} />
              <input type="text" placeholder="Search by unit..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} style={{ background: "#121217", border: "1px solid #222", borderRadius: "10px", padding: "10px 15px 10px 42px", color: "#fff", width: "300px", outline: "none", fontSize: "14px" }} />
            </div>
          )}
        </div>

        {/* ─── VISTA PROPERTY ─── */}
        {activeTab === "PROPERTY" && (
          <div style={{ background: "#0d0d12", borderRadius: "40px", border: "1px solid rgba(255,255,255,0.03)", padding: "45px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "35px" }}>
                <h2 style={{ fontSize: "34px", fontWeight: "800", letterSpacing: "-1px" }}>Inventory</h2>
                <div style={{ display: "flex", gap: "8px" }}>
                  {["ALL", "AVAILABLE", "RESERVED", "SOLD"].map((estado) => (
                    <button key={estado} onClick={() => setFiltroEstado(estado)} style={{ padding: "10px 22px", borderRadius: "10px", border: "none", background: filtroEstado === estado ? "#fff" : "rgba(255,255,255,0.06)", color: filtroEstado === estado ? "#000" : "#fff", cursor: "pointer", fontWeight: "700", fontSize: "12px" }}>{estado}</button>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "60vh", overflowY: "auto" }} className="custom-scroll">
                {unidadesFiltradas.map((apto) => {
                  const s = getBadgeStyles(apto.estado);
                  const hasBuyer = buyers.some(b => b.unitId === apto.id.replace(/\D/g,''));

                  return (
                    <div key={apto.id} style={{ background: "rgba(255, 255, 255, 0.02)", borderRadius: "22px", padding: "22px 35px", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid rgba(255,255,255,0.01)" }}>
                      <div style={{ display: "flex", gap: "45px" }}>
                        <div style={{ minWidth: "100px" }}>
                          <div style={{ fontSize: "19px", fontWeight: "700" }}>{apto.nombre}</div>
                          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>{apto.piso}</div>
                        </div>
                        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "15px", display: "flex", alignItems: "center", gap: "20px" }}>
                          <span><Maximize size={15}/> {apto.area}m²</span>
                          <span><Bed size={15}/> {apto.hab} Beds</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "25px" }}>
                        <span style={{ fontSize: "20px", fontWeight: "700" }}>{apto.precio}</span>
                        <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, padding: "8px 18px", borderRadius: "12px", fontSize: "12px", fontWeight: "800", minWidth: "100px", textAlign: "center" }}>{apto.estado}</span>
                        
                        {hasBuyer ? (
                          <button onClick={() => viewBuyerDetails(apto.id)} style={{ background: "rgba(193, 179, 228, 0.2)", border: "1px solid rgba(193, 179, 228, 0.4)", color: "#c1b3e4", padding: "10px 15px", borderRadius: "10px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: "700" }}>
                            <Users size={16} /> VIEW BUYER
                          </button>
                        ) : (
                          <button style={{ background: "rgba(255,255,255,0.05)", border: "none", color: "rgba(255,255,255,0.2)", padding: "10px", borderRadius: "10px", cursor: "not-allowed" }}>
                            <Edit2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
          </div>
        )}

        {/* ─── VISTA CLIENTS ─── */}
        {activeTab === "CLIENTS" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" }}>
            {STAGES.map(stage => (
              <div key={stage.id} style={{ background: "rgba(255,255,255,0.02)", borderRadius: "30px", padding: "20px", border: "1px solid rgba(255,255,255,0.05)", minHeight: "75vh" }}>
                <h3 style={{ fontSize: "13px", fontWeight: "800", color: stage.color, marginBottom: "20px", textAlign: "center", letterSpacing: "1px" }}>{stage.name}</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                  {buyers.filter(b => b.stage === stage.id).map(buyer => (
                    <div key={buyer.id} style={{ background: "#0d0d12", borderRadius: "22px", padding: "20px", border: highlightedBuyer === buyer.id ? `2px solid ${stage.color}` : "1px solid rgba(255,255,255,0.03)", boxShadow: highlightedBuyer === buyer.id ? `0 0 20px ${stage.color}44` : "none", transition: "all 0.5s ease", transform: highlightedBuyer === buyer.id ? "scale(1.05)" : "scale(1)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                        <span style={{ fontSize: "11px", fontWeight: "800", color: "#c1b3e4" }}>{buyer.unitName}</span>
                        <span style={{ color: "rgba(255,255,255,0.3)" }}>⋮</span>
                      </div>
                      <div style={{ fontSize: "17px", fontWeight: "700", marginBottom: "15px" }}>{buyer.name}</div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        {stage.id !== "lead" && (
                          <button onClick={() => moveStage(buyer.id, buyer.stage, 'back')} style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "none", color: "#fff", padding: "10px", borderRadius: "12px", cursor: "pointer" }}><ArrowLeft size={14}/></button>
                        )}
                        {stage.id !== "sold" ? (
                          <button onClick={() => moveStage(buyer.id, buyer.stage, 'next')} style={{ flex: 3, background: "rgba(193, 179, 228, 0.1)", color: "#c1b3e4", padding: "10px", borderRadius: "12px", fontSize: "11px", fontWeight: "700", cursor: "pointer" }}>NEXT STAGE</button>
                        ) : (
                          <div style={{ flex: 3, color: "#34d399", fontSize: "11px", fontWeight: "800", textAlign: "center" }}>SOLD</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      
    </div>
  );
}