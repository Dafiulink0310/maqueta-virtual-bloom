import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const USUARIO = process.env.ADMIN_EMAIL ?? "";
const CONTRASENA = process.env.ADMIN_PASSWORD ?? "";

export async function POST(req: Request) {
  const { usuario, contrasena } = await req.json();

  if (usuario === USUARIO && contrasena === CONTRASENA) {
    const cookieStore = await cookies();
    cookieStore.set("sesion", "admin", {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 8,
    });
    return NextResponse.json({ ok: true, rol: "admin" });
  }

  return NextResponse.json({ ok: false }, { status: 401 });
}