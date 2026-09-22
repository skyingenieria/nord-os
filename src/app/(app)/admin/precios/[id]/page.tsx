import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const money = (n: number) =>
  "$" + n.toLocaleString("es-AR", { maximumFractionDigits: 0 });

export default async function PrecioDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: list } = await supabase
    .from("price_lists")
    .select("id, version_code, effective_date, note")
    .eq("id", id)
    .single();

  if (!list) notFound();

  const { data: items } = await supabase
    .from("price_list_items")
    .select("cost, price, variant_id")
    .eq("price_list_id", id);

  const variantIds = (items ?? []).map((i) => i.variant_id);
  const { data: variants } = variantIds.length
    ? await supabase
        .from("product_variants")
        .select("id, sku, products(name), sizes(code)")
        .in("id", variantIds)
    : { data: [] };

  const vmap = new Map(
    (variants ?? []).map((v) => [
      v.id,
      {
        sku: v.sku,
        name: (v.products as { name: string } | null)?.name ?? "",
        code: (v.sizes as { code: string } | null)?.code ?? "",
      },
    ]),
  );

  const rows = (items ?? [])
    .map((i) => {
      const v = vmap.get(i.variant_id);
      const cost = Number(i.cost);
      const price = Number(i.price);
      return {
        name: v?.name ?? "",
        code: v?.code ?? "",
        sku: v?.sku ?? "",
        cost,
        price,
        gain: price - cost,
        margin: price > 0 ? ((price - cost) / price) * 100 : 0,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name) || a.sku.localeCompare(b.sku));

  return (
    <div className="px-6 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/admin/precios" className="text-sm text-neutral-500">
          ← Listas de precio
        </Link>
        <h1 className="text-2xl font-semibold mt-2">Versión {list.version_code}</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Vigencia {list.effective_date} · {rows.length} ítems
          {list.note ? ` · ${list.note}` : ""}
        </p>
      </div>

      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 dark:bg-neutral-900/50 text-neutral-500">
            <tr>
              <th className="text-left font-medium px-4 py-2.5">Prenda</th>
              <th className="text-left font-medium px-4 py-2.5">Talle</th>
              <th className="text-right font-medium px-4 py-2.5">Costo</th>
              <th className="text-right font-medium px-4 py-2.5">Precio</th>
              <th className="text-right font-medium px-4 py-2.5">Ganancia</th>
              <th className="text-right font-medium px-4 py-2.5">Margen</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr
                key={r.sku + idx}
                className="border-t border-neutral-100 dark:border-neutral-800"
              >
                <td className="px-4 py-2 font-mono text-xs">{r.sku}</td>
                <td className="px-4 py-2">{r.code}</td>
                <td className="px-4 py-2 text-right tabular-nums">
                  {money(r.cost)}
                </td>
                <td className="px-4 py-2 text-right tabular-nums">
                  {money(r.price)}
                </td>
                <td className="px-4 py-2 text-right tabular-nums text-neutral-500">
                  {money(r.gain)}
                </td>
                <td className="px-4 py-2 text-right tabular-nums text-neutral-500">
                  {r.margin.toFixed(0)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
