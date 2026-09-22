import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Convención "proxy" de Next 16 (reemplaza "middleware"). Refresca la sesión
// de Supabase en cada request.
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Todo salvo assets estáticos y archivos de imagen.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
