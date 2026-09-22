"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveSchool } from "@/lib/school";

export type FormState = { error: string | null };

// Asistente de aumento: crea una versión BORRADOR clonando una existente y
// aplicando un % a costo y precio SOLO a las prendas elegidas. El resto copia
// el precio de la lista base. Queda editable hasta que se finaliza.
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
  // Prendas a las que se aplica el aumento (checkboxes name="product_ids").
  const appliedProducts = new Set(formData.getAll("product_ids").map(String));

  if (!versionCode) return { error: "Poné un código de versión (ej: 26005)." };
  if (!effectiveDate) return { error: "Poné la fecha de vigencia." };
  if (!sourceId) return { error: "Elegí la lista base para el aumento." };

  const school = await getActiveSchool();
  if (!school) return { error: "No hay colegio activo." };

  const supabase = await createClient();

  const { data: items, error: itemsErr } = await supabase
    .from("price_list_items")
    .select("variant_id, cost, price, product_variants!inner(product_id)")
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
      status: "draft",
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
  const newItems = items.map((it) => {
    const productId = (it.product_variants as { product_id: string } | null)
      ?.product_id;
    const apply = appliedProducts.has(productId ?? "");
    return {
      price_list_id: list.id,
      variant_id: it.variant_id,
      cost: apply ? Math.round(Number(it.cost) * cf) : Number(it.cost),
      price: apply ? Math.round(Number(it.price) * pf) : Number(it.price),
    };
  });

  const { error: insErr } = await supabase
    .from("price_list_items")
    .insert(newItems);

  if (insErr) return { error: insErr.message };

  revalidatePath("/admin/precios");
  redirect(`/admin/precios/${list.id}`);
}

// Guarda ediciones manuales de costo/precio en un borrador (upsert de filas
// completas). Solo se permite sobre listas en estado draft.
export async function updateDraftItems(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const listId = String(formData.get("price_list_id") ?? "");
  if (!listId) return { error: "Falta la lista." };

  const supabase = await createClient();
  const { data: list } = await supabase
    .from("price_lists")
    .select("id, status")
    .eq("id", listId)
    .single();
  if (!list) return { error: "Lista inexistente." };
  if (list.status !== "draft")
    return { error: "La versión ya está finalizada; no se puede editar." };

  // Reconstruye filas completas desde item_<id>_variant / _cost / _price
  const ids = new Set<string>();
  for (const key of formData.keys()) {
    const m = key.match(/^item_([0-9a-f-]+)_variant$/);
    if (m) ids.add(m[1]);
  }
  const rows = [...ids].map((id) => ({
    id,
    price_list_id: listId,
    variant_id: String(formData.get(`item_${id}_variant`) ?? ""),
    cost: Number(formData.get(`item_${id}_cost`) ?? 0) || 0,
    price: Number(formData.get(`item_${id}_price`) ?? 0) || 0,
  }));

  if (rows.length === 0) return { error: null };

  const { error } = await supabase.from("price_list_items").upsert(rows);
  if (error) return { error: error.message };

  revalidatePath(`/admin/precios/${listId}`);
  return { error: null };
}

export async function finalizeDraft(formData: FormData) {
  const listId = String(formData.get("price_list_id") ?? "");
  if (!listId) return;
  const supabase = await createClient();
  await supabase
    .from("price_lists")
    .update({ status: "active" })
    .eq("id", listId)
    .eq("status", "draft");
  revalidatePath("/admin/precios");
  redirect(`/admin/precios/${listId}`);
}

export async function discardDraft(formData: FormData) {
  const listId = String(formData.get("price_list_id") ?? "");
  if (!listId) return;
  const supabase = await createClient();
  await supabase
    .from("price_lists")
    .delete()
    .eq("id", listId)
    .eq("status", "draft");
  revalidatePath("/admin/precios");
  redirect("/admin/precios");
}
