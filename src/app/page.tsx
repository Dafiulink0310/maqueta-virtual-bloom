// src/app/page.tsx
import { redirect } from "next/navigation";

export default function Home() {
  // Next.js se encarga de redirigir instantáneamente al usuario al servidor
  redirect("/login");
}