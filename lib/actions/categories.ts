"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export interface CategoryActionState {
  error?: string;
  success?: boolean;
}

const categorySchema = z.object({
  name: z.string().trim().min(1, "กรุณาใส่ชื่อหมวดหมู่").max(50),
  type: z.enum(["income", "expense"]),
  icon: z.string().trim().max(10).optional(),
});

export async function createCategory(
  _prevState: CategoryActionState | undefined,
  formData: FormData
): Promise<CategoryActionState> {
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    icon: formData.get("icon") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "กรุณาเข้าสู่ระบบใหม่" };

  const { error } = await supabase.from("categories").insert({
    user_id: user.id,
    name: parsed.data.name,
    type: parsed.data.type,
    icon: parsed.data.icon || null,
  });
  if (error) return { error: error.message };

  revalidatePath("/categories");
  revalidatePath("/");
  return { success: true };
}

export async function deleteCategory(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/categories");
  revalidatePath("/");
}
