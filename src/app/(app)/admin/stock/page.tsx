import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getActiveSchool } from "@/lib/school";
import { getActivePriceList, getPriceMap } from "@/lib/pricing";
import { StockTable, type StockProduct } from "./stock-table";

const money = (n: number) =>
  "$" + n.toLocaleString("es-AR", { maximumFractionDigits: 0 });

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

  const activeList = await getActivePriceList(school.id);
  const priceMap = activeList ? await getPriceMap(activeList.id) : new Map();

  const [{ data: products }, { data: variants }] = await Promise.all([
    supabase
      .from("products")
      .select("id, name")
      .eq("school_id", school.id)
      .order("name"),
    supabase
      .from("product_variants")
      .select("id, product_id, sizes(code, sort_order), products!inner(school_id)")
      .eq("products.school_id", school.id),
  ]);

  const variantIds = (variants ?? []).map((v) => v.id);
  const { data: movements } = variantIds.length
    ? await supabase
        .from("inventory_movements")
        .select("variant_id, qty")
        .in("variant_id", variantIds)
    : { data: [] };

  const stock = new Map<string, number>();
  for (const m of movements ?? [])
    stock.set(m.variant_id, (stock.get(m.variant_id) ?? 0) + Number(m.qty));

  // Agrupar variantes por producto
  const byProduct = new Map<
    string,
    { code: string; sort: number; stock: number; cost: number; price: number }[]
  >();
  for (const v of variants ?? []) {
    const size = v.sizes as { code: string; sort_order: number } | null;
    const pr = priceMap.get(v.id) ?? { cost: 0, price: 0 };
    const arr = byProduct.get(v.product_id) ?? [];
    arr.push({
      code: size?.code ?? "—",
      sort: size?.sort_order ?? 0,
      stock: stock.get(v.id) ?? 0,
      cost: pr.cost,
      price: pr.price,
    });
    byProduct.set(v.product_id, arr);
  }

  const rows: StockProduct[] = (products ?? []).map((p) => {
    const vs = (byProduct.get(p.id) ?? []).sort(
      (a, b) => a.sort - b.sort || a.code.localeCompare(b.code),
    );
    const totalStock = vs.reduce((a, v) => a + v.stock, 0);
    const costVal = vs.reduce((a, v) => a + v.stock * v.cost, 0);
    const saleVal = vs.reduce((a, v) => a + v.stock * v.price, 0);
    return {
      id: p.id,
      name: p.name,
      totalStock,
      costVal,
      saleVal,
      variants: vs.map((v) => ({
        code: v.code,
        stock: v.stock,
        cost: v.cost,
        price: v.price,
      })),
    };
  });

  const totCost = rows.reduce((a, r) => a + r.costVal, 0);
  const totSale = rows.reduce((a, r) => a + r.saleVal, 0);
  const totU = rows.reduce((a, r) => a + r.totalStock, 0);

  return (
    <div className="px-6 py-8 max-w-4xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Stock</h1>
        <p className="text-sm text-neutral-500 mt-1">
          {school.name} · {totU} unidades · valor costo {money(totCost)} · valor
          venta {money(totSale)}
          {activeList ? ` · precios lista ${activeList.version_code}` : ""}
        </p>
        <p className="text-xs text-neutral-400 mt-1">
          Los ingresos de stock se cargan desde{" "}
          <Link href="/admin/compras" className="underline">
            Compras
          </Link>{" "}
          (módulo en construcción).
        </p>
      </header>

      <StockTable products={rows} />
    </div>
  );
}
