import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { createClient } from "@/lib/supabase/server";

// Shell del panel de administración: sidebar (colegios + módulos) + contenido.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Ruta protegida: sin sesión, al login.
  if (!user) redirect("/login");

  // Con RLS, esto devuelve solo los colegios de las organizaciones del usuario.
  // Sin sesión válida, devuelve vacío.
  const { data: schools } = await supabase
    .from("schools")
    .select("id, name, slug, organization_id")
    .eq("active", true)
    .order("name");

  return (
    <div className="flex flex-1">
      <Sidebar schools={schools ?? []} userEmail={user?.email ?? null} />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
