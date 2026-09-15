"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export interface TransactionActionState {
  error?: string;
  success?: boolean;
}

const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.coerce.number().positive("จำนวนเงินต้องมากกว่า 0"),
  category_id: z.string().uuid("กรุณาเลือกหมวดหมู่"),
  occurred_on: z.string().min(1, "กรุณาเลือกวันที่"),
  note: z.string().trim().max(200).optional(),
});

function revalidateAllViews() {
  for (const path of [
    "/",
    "/daily",
    "/monthly",
    "/summary",
    "/trends",
    "/budgets",
  ]) {
    revalidatePath(path);
  }
}

export async function createTransaction(
  _prevState: TransactionActionState | undefined,
  formData: FormData
): Promise<TransactionActionState> {
  const parsed = transactionSchema.safeParse({
    type: formData.get("type"),
    amount: formData.get("amount"),
    category_id: formData.get("category_id"),
    occurred_on: formData.get("occurred_on"),
    note: formData.get("note") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "กรุณาเข้าสู่ระบบใหม่" };

  const { error } = await supabase.from("transactions").insert({
    user_id: user.id,
    ...parsed.data,
    note: parsed.data.note || null,
  });

  if (error) return { error: error.message };

  revalidateAllViews();
  return { success: true };
}

export async function deleteTransaction(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) throw error;
  revalidateAllViews();
}
