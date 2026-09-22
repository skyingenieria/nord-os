import { cache } from "react";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { ACTIVE_SCHOOL_COOKIE, type School } from "@/lib/school-constants";

export { ACTIVE_SCHOOL_COOKIE, type School };

// Colegios visibles para el usuario (ya filtrados por RLS). Cacheado por request.
export const getSchools = cache(async (): Promise<School[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("schools")
    .select("id, name, slug, organization_id")
    .eq("active", true)
    .order("name");
  return data ?? [];
});

// Colegio activo: el de la cookie si es válido, si no el primero.
export async function getActiveSchool(schools?: School[]): Promise<School | null> {
  const list = schools ?? (await getSchools());
  if (list.length === 0) return null;
  const cookieStore = await cookies();
  const id = cookieStore.get(ACTIVE_SCHOOL_COOKIE)?.value;
  return list.find((s) => s.id === id) ?? list[0];
}
