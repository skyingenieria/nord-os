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
  const [{ data: sources }, { data: products }] = await Promise.all([
    supabase
      .from("price_lists")
      .select("id, version_code, effective_date")
      .eq("school_id", school.id)
      .eq("status", "active")
      .order("effective_date", { ascending: false }),
    supabase
      .from("products")
      .select("id, name")
      .eq("school_id", school.id)
      .order("name"),
  ]);

  return (
    <div className="px-6 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/admin/precios" className="text-sm text-neutral-500">
          ← Listas de precio
        </Link>
        <h1 className="text-2xl font-semibold mt-2">Asistente de aumento</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Genera un <strong>borrador</strong> en {school.name} a partir de una
          versión existente. Elegí a qué prendas aplicar el aumento; después
          podés ajustar precios ítem por ítem y recién ahí finalizar.
        </p>
      </div>

      {sources && sources.length > 0 ? (
        <VersionForm sources={sources} products={products ?? []} />
      ) : (
        <p className="text-sm text-neutral-500">
          Todavía no hay ninguna lista base activa para este colegio.
        </p>
      )}
    </div>
  );
}
