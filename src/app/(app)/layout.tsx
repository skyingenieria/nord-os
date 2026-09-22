import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { createClient } from "@/lib/supabase/server";
import { getSchools, getActiveSchool } from "@/lib/school";

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

  const schools = await getSchools();
  const active = await getActiveSchool(schools);

  return (
    <div className="flex flex-1">
      <Sidebar
        schools={schools}
        activeSchoolId={active?.id ?? null}
        userEmail={user.email ?? null}
      />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
