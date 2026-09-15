"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export interface BudgetActionState {
  error?: string;
  success?: boolean;
}

const budgetSchema = z.object({
  category_id: z.string().uuid(),
  month: z.string().min(1),
  limit_amount: z.coerce.number().positive("วงเงินต้องมากกว่า 0"),
});

export async function upsertBudget(
  _prevState: BudgetActionState | undefined,
  formData: FormData
): Promise<BudgetActionState> {
  const parsed = budgetSchema.safeParse({
    category_id: formData.get("category_id"),
    month: formData.get("month"),
    limit_amount: formData.get("limit_amount"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "กรุณาเข้าสู่ระบบใหม่" };

  const { error } = await supabase
    .from("budgets")
    .upsert(
      { user_id: user.id, ...parsed.data },
      { onConflict: "user_id,category_id,month" }
    );
  if (error) return { error: error.message };

  revalidatePath("/budgets");
  revalidatePath("/");
  return { success: true };
}
