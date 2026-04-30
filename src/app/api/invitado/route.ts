import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set("sesion", "invitado", {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 2, // 2 horas
  });
  return NextResponse.json({ ok: true });
}