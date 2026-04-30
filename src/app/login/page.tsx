"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import { Eye, EyeOff } from "lucide-react";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export default function LoginPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);

  const fieldBaseClassName =
    "box-border w-full rounded-[12px] border px-[18px] py-[15px] text-[14px] font-medium leading-[1.4] tracking-[0.04em] text-white outline-none transition-all duration-[250ms] placeholder:text-[13px] placeholder:font-normal placeholder:tracking-[0.05em] placeholder:text-white/58";
  const labelBaseClassName =
    "mb-[10px] block pl-[2px] text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors duration-[250ms]";

  const fieldAnimationClassNames = [
    "animate-[fadeSlideUp_0.45s_ease_both] [animation-delay:0.05s]",
    "animate-[fadeSlideUp_0.45s_ease_both] [animation-delay:0.12s]",
    "animate-[fadeSlideUp_0.45s_ease_both] [animation-delay:0.19s]",
    "animate-[fadeSlideUp_0.45s_ease_both] [animation-delay:0.26s]",
    "animate-[fadeSlideUp_0.45s_ease_both] [animation-delay:0.33s]",
  ];

  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [errorMail, setErrorMail] = useState("");
  const [errorPass, setErrorPass] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const emailFocused = focusedField === "email";
  const passwordFocused = focusedField === "password";

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
    const savedMail = localStorage.getItem("mail");
    if (savedMail) setEmail(savedMail);
    const timeoutId = window.setTimeout(() => setIsLoading(false), 1200);
    return () => window.clearTimeout(timeoutId);
  }, []);

  // 👇 Reemplazamos la validación para usar /api/login
  const validar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMail("");
    setErrorPass("");
    let valido = true;

    if (!email) {
      setErrorMail("Debes introducir un mail");
      valido = false;
    } else if (!email.includes("@")) {
      setErrorMail("El mail debe ser válido");
      valido = false;
    }

    if (!password) {
      setErrorPass("Debes introducir una contraseña");
      valido = false;
    } else if (
      !/[A-Z]/.test(password) ||
      !/[0-9]/.test(password) ||
      !/\W/.test(password)
    ) {
      setErrorPass("Debe tener Mayúscula, Número y Símbolo");
      valido = false;
    }

    if (valido) {
      setIsSubmitting(true);

      try {
        const res = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ usuario: email, contrasena: password }),
        });

        if (res.ok) {
          if (remember) localStorage.setItem("mail", email);
          router.push("/dashboard");
        } else {
          setErrorPass("Credenciales incorrectas");
        }
      } catch {
        setErrorPass("Error de conexión. Intenta de nuevo.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const accederInvitado = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/invitado", { method: "POST" });
      if (res.ok) {
        router.push("/explorar");
      } else {
        setErrorPass("No se pudo acceder como invitado.");
      }
    } catch {
      setErrorPass("Error de conexión. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <svg className="absolute h-0 w-0" aria-hidden="true">
        <defs>
          <filter id="noiseFilter">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.75"
              numOctaves="4"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
      </svg>

      <div className={`relative flex min-h-screen w-screen items-center justify-center overflow-hidden bg-black ${montserrat.className}`}>
        <video
          ref={videoRef}
          src="/videos/Loader-Bloom.mp4"
          autoPlay muted loop playsInline preload="auto"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[rgba(0,0,0,0.18)] backdrop-blur-[1px]" />

        <div className={`relative z-10 w-[min(90%,400px)] transition-all duration-1000 ${
            isLoading ? "pointer-events-none translate-y-8 opacity-0" : "pointer-events-auto translate-y-0 opacity-100"
          }`}
        >
          <div className="relative flex w-full flex-col items-center overflow-hidden rounded-[36px] border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.10)] shadow-[0_24px_64px_rgba(0,0,0,0.40),inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-[48px]">
            <div className="pointer-events-none absolute inset-[-20%] h-[140%] w-[140%] animate-[noiseShift_0.15s_steps(1)_infinite] mix-blend-overlay opacity-[0.08] [filter:url(#noiseFilter)]" />
            <div className="absolute left-1/2 top-0 h-px w-[60%] -translate-x-1/2 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.30),transparent)]" />

            <div className="relative z-10 flex w-full flex-col items-center px-[40px] py-[48px] max-[640px]:px-[22px] max-[640px]:pb-[32px] max-[640px]:pt-[40px]">
              <div className="mb-[24px] flex justify-center">
                <Image
                  src="/images/Logo-Bloom.webp"
                  alt="Logo"
                  width={200}
                  height={80}
                  priority
                  className="h-auto w-[250px] object-contain [filter:drop-shadow(0_4px_16px_rgba(0,0,0,0.5))]"
                />
              </div>

              <div className="mb-[20px] text-center">
                <p className={`${cormorant.className} m-0 text-[28px] font-medium uppercase tracking-[0.14em] text-[rgba(255,255,255,0.92)] [text-shadow:0_8px_24px_rgba(0,0,0,0.28)] max-[640px]:text-[24px]`}>
                  Iniciar Sesión
                </p>
              </div>

              <div className="my-[4px] h-px w-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)]" />

              <form onSubmit={validar} className="mt-[28px] flex w-full flex-col gap-[20px]">
                <div className={`flex flex-col ${fieldAnimationClassNames[0]}`}>
                  <label htmlFor="email" className={`${labelBaseClassName} ${emailFocused ? "text-white/96" : "text-white/72"}`}>
                    Usuario
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="correo@dominio.com"
                    className={`${fieldBaseClassName} ${
                      errorMail ? "border-[rgba(248,113,113,0.80)] bg-[rgba(255,255,255,0.12)]" :
                      emailFocused ? "border-[rgba(255,255,255,0.60)] bg-[rgba(255,255,255,0.20)] shadow-[0_0_0_1px_rgba(255,255,255,0.08)]" :
                      "border-[rgba(255,255,255,0.40)] bg-[rgba(255,255,255,0.12)]"
                    }`}
                  />
                  {errorMail && <p className="mt-[8px] pl-[4px] text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(252,165,165,0.98)]">{errorMail}</p>}
                </div>

                <div className={`flex flex-col ${fieldAnimationClassNames[1]}`}>
                  <label htmlFor="password" className={`${labelBaseClassName} ${passwordFocused ? "text-white/96" : "text-white/72"}`}>
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="••••••••••"
                      className={`${fieldBaseClassName} pr-11 ${
                        errorPass ? "border-[rgba(248,113,113,0.80)] bg-[rgba(255,255,255,0.12)]" :
                        passwordFocused ? "border-[rgba(255,255,255,0.60)] bg-[rgba(255,255,255,0.20)] shadow-[0_0_0_1px_rgba(255,255,255,0.08)]" :
                        "border-[rgba(255,255,255,0.40)] bg-[rgba(255,255,255,0.12)]"
                      }`}
                    />
                    <button
                      type="button"
                      aria-label="Mostrar u ocultar contraseña"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-[14px] top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border-0 bg-transparent p-0 text-[rgba(255,255,255,0.48)] shadow-none outline-none transition-[color,transform,opacity,filter] duration-200 hover:scale-[1.03] hover:text-[rgba(255,255,255,0.82)] focus-visible:text-white focus-visible:shadow-none focus-visible:outline-none"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
                    </button>
                  </div>
                  {errorPass && <p className="mt-[8px] pl-[4px] text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(252,165,165,0.98)]">{errorPass}</p>}
                </div>

                <div className={`flex items-center gap-[12px] pt-[4px] ${fieldAnimationClassNames[2]}`}>
                  <button
                    type="button"
                    onClick={() => setRemember(!remember)}
                    className={`flex h-[14px] w-[14px] shrink-0 items-center justify-center rounded-[4px] border border-[rgba(255,255,255,0.30)] p-0 transition-all duration-200 ${remember ? "bg-[rgba(167,243,208,0.85)]" : "bg-[rgba(255,255,255,0.08)]"}`}
                  >
                    {remember && (
                      <svg viewBox="0 0 10 10" className="h-2 w-2">
                        <path d="M1.5 5L4 7.5L8.5 2.5" stroke="#0a0a0a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                      </svg>
                    )}
                  </button>
                  <label className="cursor-pointer text-[11px] font-medium uppercase tracking-[0.1em] text-[rgba(255,255,255,0.72)]" onClick={() => setRemember(!remember)}>
                    Recordar sesión
                  </label>
                </div>

                <div className={`pt-[4px] ${fieldAnimationClassNames[3]}`}>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group relative w-full overflow-hidden rounded-[12px] border border-[rgba(255,255,255,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(236,253,245,0.92))] px-[24px] py-[15px] text-[11px] font-bold uppercase tracking-[0.28em] text-[#0a0a0a] shadow-[0_14px_34px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.75)] transition-[transform,letter-spacing,box-shadow,background] duration-[280ms] hover:-translate-y-[1px] hover:bg-[linear-gradient(180deg,#ffffff,#a7f3d0)] hover:tracking-[0.3em] hover:shadow-[0_16px_36px_rgba(167,243,208,0.24),0_10px_24px_rgba(0,0,0,0.18)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none"
                  >
                    <span className="pointer-events-none absolute inset-x-[12%] top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.95),transparent)] opacity-90" />
                    <span className="pointer-events-none absolute inset-y-0 left-[-20%] w-[38%] skew-x-[-20deg] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.42),transparent)] opacity-0 transition-[left,opacity] duration-500 group-hover:left-[110%] group-hover:opacity-100" />
                    <span className="relative z-10">{isSubmitting ? "Verificando..." : "Entrar"}</span>
                  </button>
                </div>

                <div className={`pt-[4px] ${fieldAnimationClassNames[4]}`}>
                  <button
                    type="button"
                    onClick={accederInvitado}
                    className="group relative w-full overflow-hidden rounded-[12px] border border-[rgba(255,255,255,0.18)] bg-[linear-gradient(180deg,rgba(255,255,255,0.15),rgba(255,255,255,0.05))] px-[24px] py-[15px] text-[11px] font-bold uppercase tracking-[0.28em] text-white/80 shadow-[0_10px_25px_rgba(0,0,0,0.2)] transition-all duration-[280ms] hover:-translate-y-[1px] hover:bg-white/10 hover:text-white active:translate-y-0"
                  >
                    <span className="relative z-10">Acceder como invitado</span>
                  </button>
                </div>
              </form>
              <div className="mt-[32px]" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}