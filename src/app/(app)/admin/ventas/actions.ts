"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveSchool } from "@/lib/school";
import { getActivePriceList, getPriceMap } from "@/lib/pricing";

export type FormState = { error: string | null };

function str(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  return s === "" ? null : s;
}

// Registra una venta completa: pedido + ítems (con snapshot de costo/precio de
// la lista activa) + movimientos de stock (salida).
export async function createSale(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const school = await getActiveSchool();
  if (!school) return { error: "No hay colegio activo." };

  const supabase = await createClient();
  const activeList = await getActivePriceList(school.id);
  if (!activeList)
    return { error: "No hay lista de precios activa. Finalizá una antes de vender." };
  const priceMap = await getPriceMap(activeList.id);

  let parsed: { variantId: string; qty: number }[];
  try {
    parsed = JSON.parse(String(formData.get("items") ?? "[]"));
  } catch {
    return { error: "Ítems inválidos." };
  }
  parsed = (parsed || []).filter((i) => i.variantId && i.qty > 0);
  if (parsed.length === 0) return { error: "Agregá al menos un ítem." };

  // Cliente: existente o nuevo (opcional).
  let customerId: string | null = String(formData.get("customer_id") ?? "") || null;
  const newName = String(formData.get("new_customer_name") ?? "").trim();
  if (!customerId && newName) {
    const { data: cust, error: cErr } = await supabase
      .from("customers")
      .insert({
        school_id: school.id,
        name: newName,
        phone: str(formData.get("new_customer_phone")),
      })
      .select("id")
      .single();
    if (cErr) return { error: cErr.message };
    customerId = cust.id;
  }

  const shipping = Number(formData.get("shipping_charge") ?? 0) || 0;
  const discount = Number(formData.get("discount") ?? 0) || 0;

  const { data: order, error: oErr } = await supabase
    .from("orders")
    .insert({
      school_id: school.id,
      customer_id: customerId,
      shipping_charge: shipping,
      discount,
    })
    .select("id")
    .single();
  if (oErr) return { error: oErr.message };

  const orderItems = parsed.map((i) => {
    const pr = priceMap.get(i.variantId) ?? { cost: 0, price: 0 };
    return {
      order_id: order.id,
      variant_id: i.variantId,
      qty: i.qty,
      ownership: "propio" as const,
      unit_cost_snapshot: pr.cost,
      unit_price_snapshot: pr.price,
      price_list_id: activeList.id,
    };
  });
  const { error: oiErr } = await supabase.from("order_items").insert(orderItems);
  if (oiErr) return { error: oiErr.message };

  // Salida de stock (ledger)
  await supabase.from("inventory_movements").insert(
    parsed.map((i) => ({
      variant_id: i.variantId,
      type: "venta" as const,
      qty: -i.qty,
      ref_table: "order_items",
      ref_id: order.id,
    })),
  );

  revalidatePath("/admin/ventas");
  redirect(`/admin/ventas/${order.id}`);
}

// Registra un cobro y recalcula el estado de pago del pedido.
export async function createPayment(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const orderId = String(formData.get("order_id") ?? "");
  const amount = Number(formData.get("amount") ?? 0) || 0;
  if (!orderId) return { error: "Falta la venta." };
  if (amount <= 0) return { error: "El monto debe ser mayor a 0." };

  const supabase = await createClient();
  const { error } = await supabase.from("payments").insert({
    order_id: orderId,
    amount,
    method: str(formData.get("method")),
  });
  if (error) return { error: error.message };

  const { data: bal } = await supabase
    .from("v_order_balance")
    .select("total, pagado, saldo")
    .eq("order_id", orderId)
    .single();

  let status: "impago" | "parcial" | "pagado" = "impago";
  if (bal) {
    if (Number(bal.saldo) <= 0) status = "pagado";
    else if (Number(bal.pagado) > 0) status = "parcial";
  }
  await supabase.from("orders").update({ payment_status: status }).eq("id", orderId);

  revalidatePath(`/admin/ventas/${orderId}`);
  return { error: null };
}
