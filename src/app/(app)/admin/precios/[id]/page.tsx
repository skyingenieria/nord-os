import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { finalizeDraft, discardDraft } from "../actions";
import { DraftEditor, type DraftItem } from "./draft-editor";

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
    .select("id, version_code, effective_date, note, status")
    .eq("id", id)
    .single();

  if (!list) notFound();

  const { data: items } = await supabase
    .from("price_list_items")
    .select("id, cost, price, variant_id")
    .eq("price_list_id", id);

  const variantIds = (items ?? []).map((i) => i.variant_id);
  const { data: variants } = variantIds.length
    ? await supabase
        .from("product_variants")
        .select("id, sku, products(name), sizes(code, sort_order)")
        .in("id", variantIds)
    : { data: [] };

  const vmap = new Map(
    (variants ?? []).map((v) => [
      v.id,
      {
        sku: v.sku ?? "",
        name: (v.products as { name: string } | null)?.name ?? "",
        code: (v.sizes as { code: string } | null)?.code ?? "",
        sort: (v.sizes as { sort_order: number } | null)?.sort_order ?? 0,
      },
    ]),
  );

  const rows = (items ?? [])
    .map((i) => {
      const v = vmap.get(i.variant_id);
      const cost = Number(i.cost);
      const price = Number(i.price);
      return {
        id: i.id,
        variantId: i.variant_id,
        name: v?.name ?? "",
        code: v?.code ?? "",
        sku: v?.sku ?? "",
        sort: v?.sort ?? 0,
        cost,
        price,
        gain: price - cost,
        margin: price > 0 ? ((price - cost) / price) * 100 : 0,
      };
    })
    .sort(
      (a, b) => a.name.localeCompare(b.name) || a.sort - b.sort || a.sku.localeCompare(b.sku),
    );

  const isDraft = list.status === "draft";

  return (
    <div className="px-6 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/admin/precios" className="text-sm text-neutral-500">
          ← Listas de precio
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="text-2xl font-semibold">Versión {list.version_code}</h1>
          {isDraft ? (
            <span className="rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 px-2.5 py-0.5 text-xs font-medium">
              Borrador
            </span>
          ) : (
            <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 text-xs font-medium">
              Activa
            </span>
          )}
        </div>
        <p className="text-sm text-neutral-500 mt-1">
          Vigencia {list.effective_date} · {rows.length} ítems
          {list.note ? ` · ${list.note}` : ""}
        </p>
      </div>

      {isDraft && (
        <div className="mb-4 flex items-center gap-3">
          <form action={finalizeDraft}>
            <input type="hidden" name="price_list_id" value={list.id} />
            <button
              type="submit"
              className="rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-4 py-2 text-sm font-medium"
            >
              Finalizar versión
            </button>
          </form>
          <form action={discardDraft}>
            <input type="hidden" name="price_list_id" value={list.id} />
            <button
              type="submit"
              className="rounded-lg border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-2 text-sm"
            >
              Descartar borrador
            </button>
          </form>
          <p className="text-xs text-neutral-500">
            Ajustá los valores y guardá; al finalizar quedan congelados.
          </p>
        </div>
      )}

      {isDraft ? (
        <DraftEditor
          listId={list.id}
          items={rows.map(
            (r): DraftItem => ({
              id: r.id,
              variantId: r.variantId,
              name: r.name,
              code: r.code,
              cost: r.cost,
              price: r.price,
            }),
          )}
        />
      ) : (
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
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className="border-t border-neutral-100 dark:border-neutral-800"
                >
                  <td className="px-4 py-2">{r.name}</td>
                  <td className="px-4 py-2 text-neutral-500">{r.code}</td>
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
      )}
    </div>
  );
}
