"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveSchool } from "@/lib/school";

export type FormState = { error: string | null };

function str(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  return s === "" ? null : s;
}

export async function createProduct(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "El nombre de la prenda es obligatorio." };

  const school = await getActiveSchool();
  if (!school) return { error: "No hay colegio activo." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .insert({
      school_id: school.id,
      name,
      category: str(formData.get("category")),
      gender: str(formData.get("gender")),
      description: str(formData.get("description")),
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505")
      return { error: "Ya existe una prenda con ese nombre en este colegio." };
    return { error: error.message };
  }

  revalidatePath("/admin/productos");
  redirect(`/admin/productos/${data.id}`);
}

export async function createSize(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const code = String(formData.get("code") ?? "").trim();
  if (!code) return { error: "El código del talle es obligatorio." };

  const school = await getActiveSchool();
  if (!school) return { error: "No hay colegio activo." };

  const supabase = await createClient();
  const { error } = await supabase.from("sizes").insert({
    school_id: school.id,
    code,
    label: str(formData.get("label")),
    sort_order: Number(formData.get("sort_order") ?? 0) || 0,
  });

  if (error) {
    if (error.code === "23505")
      return { error: "Ese talle ya existe en este colegio." };
    return { error: error.message };
  }

  revalidatePath("/admin/productos", "layout");
  return { error: null };
}

export async function createVariant(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const productId = String(formData.get("product_id") ?? "");
  const sizeId = String(formData.get("size_id") ?? "");
  if (!productId || !sizeId)
    return { error: "Elegí un talle para crear la variante." };

  const supabase = await createClient();
  // El sku lo genera el trigger make_sku (snake_case, sin tildes).
  const { error } = await supabase
    .from("product_variants")
    .insert({ product_id: productId, size_id: sizeId });

  if (error) {
    if (error.code === "23505")
      return { error: "Esa prenda ya tiene ese talle." };
    return { error: error.message };
  }

  revalidatePath(`/admin/productos/${productId}`);
  return { error: null };
}

export async function toggleProductActive(formData: FormData) {
  const productId = String(formData.get("product_id") ?? "");
  const active = String(formData.get("active") ?? "") === "true";
  if (!productId) return;

  const supabase = await createClient();
  await supabase.from("products").update({ active }).eq("id", productId);

  revalidatePath("/admin/productos");
  revalidatePath(`/admin/productos/${productId}`);
}
