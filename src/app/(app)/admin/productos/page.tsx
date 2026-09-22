import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getActiveSchool } from "@/lib/school";
import { ProductList, type ProductRow } from "./product-list";

export default async function ProductosPage() {
  const school = await getActiveSchool();
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

  const [{ data: products }, { data: variants }] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, category, gender, active")
      .eq("school_id", school.id)
      .order("name"),
    supabase
      .from("product_variants")
      .select("id, product_id, sku, sizes(code, sort_order), products!inner(school_id)")
      .eq("products.school_id", school.id),
  ]);

  const byProduct = new Map<string, { sku: string; code: string; sort: number }[]>();
  for (const v of variants ?? []) {
    const size = v.sizes as { code: string; sort_order: number } | null;
    const arr = byProduct.get(v.product_id) ?? [];
    arr.push({ sku: v.sku ?? "", code: size?.code ?? "—", sort: size?.sort_order ?? 0 });
    byProduct.set(v.product_id, arr);
  }

  const rows: ProductRow[] = (products ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    gender: p.gender,
    active: p.active,
    variants: (byProduct.get(p.id) ?? [])
      .sort((a, b) => a.sort - b.sort || a.code.localeCompare(b.code))
      .map((v) => ({ sku: v.sku, code: v.code })),
  }));

  return (
    <div className="px-6 py-8 max-w-5xl">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Productos</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Catálogo de {school.name} · {rows.length}{" "}
            {rows.length === 1 ? "prenda" : "prendas"}
          </p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-4 py-2 text-sm font-medium"
        >
          Nueva prenda
        </Link>
      </header>

      {rows.length === 0 ? (
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
        <ProductList products={rows} />
      )}
    </div>
  );
}
