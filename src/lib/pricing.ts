import { createClient } from "@/lib/supabase/server";

// Última lista de precios ACTIVA (final) del colegio.
export async function getActivePriceList(schoolId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("price_lists")
    .select("id, version_code, effective_date")
    .eq("school_id", schoolId)
    .eq("status", "active")
    .order("effective_date", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

// Mapa variant_id -> {cost, price} de una lista.
export async function getPriceMap(priceListId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("price_list_items")
    .select("variant_id, cost, price")
    .eq("price_list_id", priceListId);
  const m = new Map<string, { cost: number; price: number }>();
  for (const i of data ?? [])
    m.set(i.variant_id, { cost: Number(i.cost), price: Number(i.price) });
  return m;
}
