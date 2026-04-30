import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const sesion = cookieStore.get("sesion");
  return NextResponse.json({ rol: sesion?.value ?? null });
}