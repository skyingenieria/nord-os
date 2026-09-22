import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { toggleProductActive } from "../actions";
import { AddVariantForm, AddSizeForm } from "./forms";

export default async function ProductoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("id, name, category, gender, description, active, school_id")
    .eq("id", id)
    .single();

  if (!product) notFound();

  const [{ data: variants }, { data: sizes }] = await Promise.all([
    supabase
      .from("product_variants")
      .select("id, size_id, sku, active, sizes(code, label)")
      .eq("product_id", id)
      .order("sku"),
    supabase
      .from("sizes")
      .select("id, code, label, sort_order")
      .eq("school_id", product.school_id)
      .order("sort_order")
      .order("code"),
  ]);

  const usedSizeIds = new Set((variants ?? []).map((v) => v.size_id));
  const availableSizes = (sizes ?? []).filter((s) => !usedSizeIds.has(s.id));

  return (
    <div className="px-6 py-8 max-w-3xl">
      <div className="mb-6">
        <Link href="/admin/productos" className="text-sm text-neutral-500">
          ← Productos
        </Link>
        <div className="mt-2 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{product.name}</h1>
            <p className="text-sm text-neutral-500 mt-1">
              {[product.category, product.gender].filter(Boolean).join(" · ") ||
                "Sin categoría"}
            </p>
          </div>
          <form action={toggleProductActive}>
            <input type="hidden" name="product_id" value={product.id} />
            <input
              type="hidden"
              name="active"
              value={(!product.active).toString()}
            />
            <button
              type="submit"
              className="rounded-lg border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-xs"
            >
              {product.active ? "Desactivar" : "Activar"}
            </button>
          </form>
        </div>
        {product.description && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-3">
            {product.description}
          </p>
        )}
      </div>

      {/* Variantes */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 mb-3">
          Variantes (talle → SKU)
        </h2>

        {variants && variants.length > 0 ? (
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden mb-4">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 dark:bg-neutral-900/50 text-neutral-500">
                <tr>
                  <th className="text-left font-medium px-4 py-2.5">Talle</th>
                  <th className="text-left font-medium px-4 py-2.5">SKU</th>
                </tr>
              </thead>
              <tbody>
                {variants.map((v) => {
                  const size = v.sizes as {
                    code: string;
                    label: string | null;
                  } | null;
                  return (
                    <tr
                      key={v.id}
                      className="border-t border-neutral-100 dark:border-neutral-800"
                    >
                      <td className="px-4 py-2.5">{size?.code ?? "—"}</td>
                      <td className="px-4 py-2.5 font-mono text-xs">{v.sku}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-neutral-500 mb-4">
            Todavía no hay variantes. Agregá un talle abajo (el SKU se genera
            solo).
          </p>
        )}

        <AddVariantForm productId={product.id} availableSizes={availableSizes} />
      </section>

      {/* Talles del colegio */}
      <section className="border-t border-neutral-200 dark:border-neutral-800 pt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 mb-1">
          Crear talle nuevo
        </h2>
        <p className="text-xs text-neutral-500 mb-3">
          Los talles son por colegio y se comparten entre todas las prendas.
        </p>
        <AddSizeForm />
      </section>
    </div>
  );
}
