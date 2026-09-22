"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveSchool } from "@/lib/school";

export type FormState = { error: string | null };

// Asistente de aumento: crea una versión nueva de lista clonando una existente
// y aplicando un % a costo y a precio (snapshot inmutable por versión).
export async function createPriceListVersion(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const versionCode = String(formData.get("version_code") ?? "").trim();
  const effectiveDate = String(formData.get("effective_date") ?? "").trim();
  const sourceId = String(formData.get("source_id") ?? "").trim();
  const costPct = Number(formData.get("cost_pct") ?? 0) || 0;
  const pricePct = Number(formData.get("price_pct") ?? 0) || 0;
  const note = String(formData.get("note") ?? "").trim() || null;

  if (!versionCode) return { error: "Poné un código de versión (ej: 26005)." };
  if (!effectiveDate) return { error: "Poné la fecha de vigencia." };
  if (!sourceId) return { error: "Elegí la lista base para el aumento." };

  const school = await getActiveSchool();
  if (!school) return { error: "No hay colegio activo." };

  const supabase = await createClient();

  const { data: items, error: itemsErr } = await supabase
    .from("price_list_items")
    .select("variant_id, cost, price")
    .eq("price_list_id", sourceId);

  if (itemsErr) return { error: itemsErr.message };
  if (!items || items.length === 0)
    return { error: "La lista base no tiene ítems." };

  const { data: list, error: listErr } = await supabase
    .from("price_lists")
    .insert({
      school_id: school.id,
      version_code: versionCode,
      effective_date: effectiveDate,
      note,
    })
    .select("id")
    .single();

  if (listErr) {
    if (listErr.code === "23505")
      return { error: "Ya existe una versión con ese código en este colegio." };
    return { error: listErr.message };
  }

  const cf = 1 + costPct / 100;
  const pf = 1 + pricePct / 100;
  const newItems = items.map((it) => ({
    price_list_id: list.id,
    variant_id: it.variant_id,
    cost: Math.round(Number(it.cost) * cf),
    price: Math.round(Number(it.price) * pf),
  }));

  const { error: insErr } = await supabase
    .from("price_list_items")
    .insert(newItems);

  if (insErr) return { error: insErr.message };

  revalidatePath("/admin/precios");
  redirect(`/admin/precios/${list.id}`);
}
