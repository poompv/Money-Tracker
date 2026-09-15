import { createClient } from "@/lib/supabase/server";
import type { Category, TransactionType } from "@/lib/types/database";

export async function getCategories(type?: TransactionType): Promise<Category[]> {
  const supabase = await createClient();
  let query = supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (type) query = query.eq("type", type);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}
