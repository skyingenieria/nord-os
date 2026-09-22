import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getActiveSchool } from "@/lib/school";

export default async function PreciosPage() {
  const school = await getActiveSchool();
  if (!school) {
    return (
      <div className="px-6 py-8">
        <p className="text-sm text-neutral-500">No hay colegio activo.</p>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: lists } = await supabase
    .from("price_lists")
    .select("id, version_code, effective_date, note, status, price_list_items(count)")
    .eq("school_id", school.id)
    .order("effective_date", { ascending: false });

  const rows = lists ?? [];

  return (
    <div className="px-6 py-8 max-w-4xl">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Listas de precio</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {school.name} · {rows.length} versiones · precio histórico congelado
            por versión
          </p>
        </div>
        {rows.length > 0 && (
          <Link
            href="/admin/precios/nueva"
            className="rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-4 py-2 text-sm font-medium"
          >
            Nueva versión (aumento)
          </Link>
        )}
      </header>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 p-10 text-center">
          <p className="text-sm text-neutral-500">
            No hay listas de precio en {school.name} todavía.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 dark:bg-neutral-900/50 text-neutral-500">
              <tr>
                <th className="text-left font-medium px-4 py-2.5">Versión</th>
                <th className="text-left font-medium px-4 py-2.5">Vigencia</th>
                <th className="text-left font-medium px-4 py-2.5">Nota</th>
                <th className="text-right font-medium px-4 py-2.5">Ítems</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((l) => {
                const count =
                  (l.price_list_items as { count: number }[] | null)?.[0]
                    ?.count ?? 0;
                return (
                  <tr
                    key={l.id}
                    className="border-t border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/40"
                  >
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/admin/precios/${l.id}`}
                        className="font-medium hover:underline"
                      >
                        {l.version_code}
                      </Link>
                      {l.status === "draft" && (
                        <span className="ml-2 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 text-[10px] uppercase tracking-wide">
                          borrador
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-neutral-500 tabular-nums">
                      {l.effective_date}
                    </td>
                    <td className="px-4 py-2.5 text-neutral-500">
                      {l.note ?? "—"}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">
                      {count}
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
