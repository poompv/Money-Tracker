import { createClient } from "@/lib/supabase/server";
import { getCategories } from "@/lib/queries/categories";
import { getBudgetLevel, getBudgetPercent } from "@/lib/utils/budget";
import type { Budget, BudgetProgress } from "@/lib/types/database";

export async function getBudgetsForMonth(monthISO: string): Promise<Budget[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("budgets")
    .select("*")
    .eq("month", monthISO);

  if (error) throw error;
  return data ?? [];
}

/** Budget limit + amount spent so far this month, per expense category. */
export async function getBudgetProgress(
  monthISO: string
): Promise<BudgetProgress[]> {
  const supabase = await createClient();

  const [categories, budgets, spendResult] = await Promise.all([
    getCategories("expense"),
    getBudgetsForMonth(monthISO),
    supabase.rpc("get_category_spend", { p_month: monthISO }),
  ]);

  if (spendResult.error) throw spendResult.error;
  const spendByCategory = new Map<string, number>(
    (spendResult.data ?? []).map((row) => [row.category_id, Number(row.spent)])
  );
  const budgetByCategory = new Map(budgets.map((b) => [b.category_id, b]));

  return categories
    .filter((c) => budgetByCategory.has(c.id))
    .map((c) => {
      const budget = budgetByCategory.get(c.id)!;
      const spent = spendByCategory.get(c.id) ?? 0;
      const limit = Number(budget.limit_amount);
      return {
        category_id: c.id,
        category_name: c.name,
        icon: c.icon,
        color: c.color,
        limit_amount: limit,
        spent,
        percent: getBudgetPercent(spent, limit),
        level: getBudgetLevel(spent, limit),
      };
    });
}
