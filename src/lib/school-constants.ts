import type { Tables } from "@/types/database";

// Client-safe: sin imports de server (next/headers, supabase server).
export type School = Pick<
  Tables<"schools">,
  "id" | "name" | "slug" | "organization_id"
>;

export const ACTIVE_SCHOOL_COOKIE = "nordos_school";
