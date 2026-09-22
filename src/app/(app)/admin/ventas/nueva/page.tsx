import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getActiveSchool } from "@/lib/school";
import { getActivePriceList, getPriceMap } from "@/lib/pricing";
import { SaleForm } from "./sale-form";

export default async function NuevaVentaPage() {
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

  if (!activeList) {
    return (
      <div className="px-6 py-8 max-w-2xl">
        <Link href="/admin/ventas" className="text-sm text-neutral-500">
          ← Ventas
        </Link>
        <h1 className="text-2xl font-semibold mt-2">Nueva venta</h1>
        <p className="text-sm text-neutral-500 mt-3">
          No hay una lista de precios activa en {school.name}. Finalizá una
          versión en{" "}
          <Link href="/admin/precios" className="underline">
            Listas de precio
          </Link>{" "}
          para poder vender.
        </p>
      </div>
    );
  }

  const priceMap = await getPriceMap(activeList.id);

  const [{ data: variants }, { data: customers }] = await Promise.all([
    supabase
      .from("product_variants")
      .select("id, sku, products!inner(name, school_id, active), sizes(code, sort_order)")
      .eq("products.school_id", school.id),
    supabase
      .from("customers")
      .select("id, name")
      .eq("school_id", school.id)
      .order("name"),
  ]);

  const options = (variants ?? [])
    .filter((v) => (v.products as { active: boolean } | null)?.active)
    .map((v) => {
      const size = v.sizes as { code: string; sort_order: number } | null;
      const pr = priceMap.get(v.id);
      return {
        id: v.id,
        sku: v.sku ?? "",
        name: (v.products as { name: string } | null)?.name ?? "",
        code: size?.code ?? "",
        sort: size?.sort_order ?? 0,
        price: pr?.price ?? 0,
      };
    })
    .filter((v) => v.price > 0)
    .sort((a, b) => a.name.localeCompare(b.name) || a.sort - b.sort);

  return (
    <div className="px-6 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/admin/ventas" className="text-sm text-neutral-500">
          ← Ventas
        </Link>
        <h1 className="text-2xl font-semibold mt-2">Nueva venta</h1>
        <p className="text-sm text-neutral-500 mt-1">
          {school.name} · precios de la lista {activeList.version_code}. El costo
          y el precio quedan congelados en la venta.
        </p>
      </div>

      <SaleForm
        variants={options.map((o) => ({
          id: o.id,
          sku: o.sku,
          name: o.name,
          code: o.code,
          price: o.price,
        }))}
        customers={customers ?? []}
      />
    </div>
  );
}
