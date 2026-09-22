import { createClient } from "@/lib/supabase/server";
import { getActiveSchool } from "@/lib/school";

type Metric = { label: string; value: number | string; hint?: string };

export default async function AdminDashboard() {
  const supabase = await createClient();
  const school = await getActiveSchool();

  if (!school) {
    return (
      <div className="px-6 py-8">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-neutral-500 mt-2">
          No hay colegio activo. Elegí uno en el selector de la izquierda.
        </p>
      </div>
    );
  }

  const countBySchool = (table: "products" | "sizes" | "price_lists" | "orders" | "customers") =>
    supabase
      .from(table)
      .select("*", { count: "exact", head: true })
      .eq("school_id", school.id);

  const [
    prendas,
    prendasActivas,
    talles,
    listas,
    pedidos,
    clientes,
    variantes,
  ] = await Promise.all([
    countBySchool("products"),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("school_id", school.id)
      .eq("active", true),
    countBySchool("sizes"),
    countBySchool("price_lists"),
    countBySchool("orders"),
    countBySchool("customers"),
    supabase
      .from("product_variants")
      .select("products!inner(school_id)", { count: "exact", head: true })
      .eq("products.school_id", school.id),
  ]);

  const catalogo: Metric[] = [
    { label: "Prendas", value: prendas.count ?? 0, hint: `${prendasActivas.count ?? 0} activas` },
    { label: "Variantes (SKU)", value: variantes.count ?? 0 },
    { label: "Talles", value: talles.count ?? 0 },
    { label: "Listas de precio", value: listas.count ?? 0 },
  ];

  const operacion: Metric[] = [
    { label: "Pedidos", value: pedidos.count ?? 0 },
    { label: "Clientes", value: clientes.count ?? 0 },
  ];

  return (
    <div className="px-6 py-8 max-w-5xl">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-neutral-500 mt-1">{school.name}</p>
      </header>

      <section className="mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-3">
          Catálogo
        </h2>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {catalogo.map((m) => (
            <MetricTile key={m.label} {...m} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-3">
          Operación
        </h2>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {operacion.map((m) => (
            <MetricTile key={m.label} {...m} />
          ))}
        </div>
      </section>
    </div>
  );
}

function MetricTile({ label, value, hint }: Metric) {
  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5">
      <div className="text-3xl font-semibold tabular-nums">{value}</div>
      <div className="text-sm text-neutral-500 mt-1">{label}</div>
      {hint && <div className="text-xs text-neutral-400 mt-0.5">{hint}</div>}
    </div>
  );
}
