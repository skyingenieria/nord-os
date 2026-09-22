"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error: string | null; ok?: boolean };

// Registra un ingreso de stock: crea el comprobante (stock_receipts) y el
// movimiento en el ledger (inventory_movements, qty positivo).
export async function registerIngreso(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const variantId = String(formData.get("variant_id") ?? "");
  const qty = Number(formData.get("qty") ?? 0);
  const unitCost = Number(formData.get("unit_cost") ?? 0);
  const supplierId = String(formData.get("supplier_id") ?? "") || null;
  const ownership =
    String(formData.get("ownership") ?? "propio") === "consignacion"
      ? "consignacion"
      : "propio";

  if (!variantId) return { error: "Elegí una prenda/talle." };
  if (!Number.isFinite(qty) || qty <= 0)
    return { error: "La cantidad debe ser mayor a 0." };
  if (!Number.isFinite(unitCost) || unitCost < 0)
    return { error: "Costo inválido." };

  const supabase = await createClient();

  const { data: receipt, error: rErr } = await supabase
    .from("stock_receipts")
    .insert({
      variant_id: variantId,
      supplier_id: supplierId,
      ownership,
      qty,
      unit_cost: unitCost,
    })
    .select("id")
    .single();

  if (rErr) return { error: rErr.message };

  const { error: mErr } = await supabase.from("inventory_movements").insert({
    variant_id: variantId,
    supplier_id: supplierId,
    type: "ingreso",
    qty,
    unit_cost: unitCost,
    ref_table: "stock_receipts",
    ref_id: receipt.id,
  });

  if (mErr) return { error: mErr.message };

  revalidatePath("/admin/stock");
  return { error: null, ok: true };
}
