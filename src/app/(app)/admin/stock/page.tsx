import { createClient } from "@/lib/supabase/server";
import { getActiveSchool } from "@/lib/school";
import { IngresoForm } from "./ingreso-form";

export default async function StockPage() {
  const school = await getActiveSchool();
  if (!school) {
    return (
      <div className="px-6 py-8">
        <p className="text-sm text-neutral-500">No hay colegio activo.</p>
      </div>
    );
  }

  const supabase = await createClient();

  const [{ data: variants }, { data: suppliers }] = await Promise.all([
    supabase
      .from("product_variants")
      .select("id, sku, products!inner(name, school_id), sizes(code)")
      .eq("products.school_id", school.id),
    supabase
      .from("suppliers")
      .select("id, name")
      .eq("organization_id", school.organization_id)
      .order("name"),
  ]);

  const variantIds = (variants ?? []).map((v) => v.id);

  const { data: movements } = variantIds.length
    ? await supabase
        .from("inventory_movements")
        .select("variant_id, qty")
        .in("variant_id", variantIds)
    : { data: [] };

  const stock = new Map<string, number>();
  for (const m of movements ?? []) {
    stock.set(m.variant_id, (stock.get(m.variant_id) ?? 0) + Number(m.qty));
  }

  const rows = (variants ?? [])
    .map((v) => ({
      id: v.id,
      sku: v.sku ?? "",
      name: (v.products as { name: string } | null)?.name ?? "",
      code: (v.sizes as { code: string } | null)?.code ?? "",
      stock: stock.get(v.id) ?? 0,
    }))
    .sort(
      (a, b) => b.stock - a.stock || a.name.localeCompare(b.name) || a.sku.localeCompare(b.sku),
    );

  const totalUnidades = rows.reduce((acc, r) => acc + r.stock, 0);
  const conStock = rows.filter((r) => r.stock > 0).length;

  return (
    <div className="px-6 py-8 max-w-4xl space-y-8">
      <header>
        <h1 className="text-2xl font-semibold">Stock</h1>
        <p className="text-sm text-neutral-500 mt-1">
          {school.name} · {totalUnidades} unidades · {conStock} SKUs con stock ·{" "}
          {rows.length} variantes
        </p>
      </header>

      <IngresoForm
        variants={(variants ?? [])
          .map((v) => ({ id: v.id, sku: v.sku ?? "" }))
          .sort((a, b) => a.sku.localeCompare(b.sku))}
        suppliers={suppliers ?? []}
      />

      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 dark:bg-neutral-900/50 text-neutral-500">
            <tr>
              <th className="text-left font-medium px-4 py-2.5">SKU</th>
              <th className="text-left font-medium px-4 py-2.5">Talle</th>
              <th className="text-right font-medium px-4 py-2.5">Stock</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.id}
                className="border-t border-neutral-100 dark:border-neutral-800"
              >
                <td className="px-4 py-2 font-mono text-xs">{r.sku}</td>
                <td className="px-4 py-2">{r.code}</td>
                <td
                  className={`px-4 py-2 text-right tabular-nums ${
                    r.stock > 0
                      ? "font-medium"
                      : "text-neutral-400 dark:text-neutral-600"
                  }`}
                >
                  {r.stock}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
