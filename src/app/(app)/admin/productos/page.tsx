import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSchools, getActiveSchool } from "@/lib/school";

export default async function ProductosPage() {
  const schools = await getSchools();
  const school = await getActiveSchool(schools);

  if (!school) {
    return (
      <div className="px-6 py-8">
        <p className="text-sm text-neutral-500">
          No hay colegio activo. Elegí uno en el selector de la izquierda.
        </p>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, name, category, gender, active, product_variants(count)")
    .eq("school_id", school.id)
    .order("name");

  const list = products ?? [];

  return (
    <div className="px-6 py-8 max-w-5xl">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Productos</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Catálogo de {school.name} · {list.length}{" "}
            {list.length === 1 ? "prenda" : "prendas"}
          </p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-4 py-2 text-sm font-medium"
        >
          Nueva prenda
        </Link>
      </header>

      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 p-10 text-center">
          <p className="text-sm text-neutral-500">
            Todavía no hay prendas en {school.name}.
          </p>
          <Link
            href="/admin/productos/nuevo"
            className="inline-block mt-3 text-sm underline"
          >
            Crear la primera
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 dark:bg-neutral-900/50 text-neutral-500">
              <tr>
                <th className="text-left font-medium px-4 py-2.5">Prenda</th>
                <th className="text-left font-medium px-4 py-2.5">Categoría</th>
                <th className="text-left font-medium px-4 py-2.5">Género</th>
                <th className="text-right font-medium px-4 py-2.5">Talles</th>
                <th className="text-right font-medium px-4 py-2.5">Estado</th>
              </tr>
            </thead>
            <tbody>
              {list.map((p) => {
                const variantCount =
                  (p.product_variants as { count: number }[] | null)?.[0]
                    ?.count ?? 0;
                return (
                  <tr
                    key={p.id}
                    className="border-t border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/40"
                  >
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/admin/productos/${p.id}`}
                        className="font-medium hover:underline"
                      >
                        {p.name}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-neutral-500">
                      {p.category ?? "—"}
                    </td>
                    <td className="px-4 py-2.5 text-neutral-500">
                      {p.gender ?? "—"}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">
                      {variantCount}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {p.active ? (
                        <span className="text-emerald-600 dark:text-emerald-400 text-xs">
                          activo
                        </span>
                      ) : (
                        <span className="text-neutral-400 text-xs">inactivo</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
