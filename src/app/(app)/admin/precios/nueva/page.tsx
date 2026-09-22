import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getActiveSchool } from "@/lib/school";
import { VersionForm } from "./version-form";

export default async function NuevaVersionPage() {
  const school = await getActiveSchool();
  if (!school) {
    return (
      <div className="px-6 py-8">
        <p className="text-sm text-neutral-500">No hay colegio activo.</p>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: sources } = await supabase
    .from("price_lists")
    .select("id, version_code, effective_date")
    .eq("school_id", school.id)
    .order("effective_date", { ascending: false });

  return (
    <div className="px-6 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/admin/precios" className="text-sm text-neutral-500">
          ← Listas de precio
        </Link>
        <h1 className="text-2xl font-semibold mt-2">Asistente de aumento</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Genera una versión nueva en {school.name} a partir de una existente,
          aplicando un % a costo y a precio. La versión anterior queda intacta
          (precio histórico).
        </p>
      </div>

      {sources && sources.length > 0 ? (
        <VersionForm sources={sources} />
      ) : (
        <p className="text-sm text-neutral-500">
          Todavía no hay ninguna lista base para este colegio.
        </p>
      )}
    </div>
  );
}
