import { createClient } from "@/lib/supabase/server";
import { addMonthsISO } from "@/lib/utils/date";
import type {
  CategoryBreakdownItem,
  MonthlyTotals,
  MonthlyTrendItem,
  TransactionWithCategory,
} from "@/lib/types/database";

export async function getTransactionsByDay(
  dateISO: string
): Promise<TransactionWithCategory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("transactions")
    .select("*, category:categories(id, name, icon, color)")
    .eq("occurred_on", dateISO)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as unknown as TransactionWithCategory[]) ?? [];
}

export async function getTransactionsByMonth(
  monthISO: string
): Promise<TransactionWithCategory[]> {
  const supabase = await createClient();
  const monthEnd = addMonthsISO(monthISO, 1);
  const { data, error } = await supabase
    .from("transactions")
    .select("*, category:categories(id, name, icon, color)")
    .gte("occurred_on", monthISO)
    .lt("occurred_on", monthEnd)
    .order("occurred_on", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as unknown as TransactionWithCategory[]) ?? [];
}

export async function getMonthlyTotals(monthISO: string): Promise<MonthlyTotals> {
  const rows = await getTransactionsByMonth(monthISO);
  const income = rows
    .filter((r) => r.type === "income")
    .reduce((sum, r) => sum + Number(r.amount), 0);
  const expense = rows
    .filter((r) => r.type === "expense")
    .reduce((sum, r) => sum + Number(r.amount), 0);
  return { income, expense, net: income - expense };
}

export async function getCategoryBreakdown(
  monthISO: string,
  type: "income" | "expense"
): Promise<CategoryBreakdownItem[]> {
  const rows = await getTransactionsByMonth(monthISO);
  const byCategory = new Map<string, CategoryBreakdownItem>();

  for (const row of rows.filter((r) => r.type === type)) {
    const key = row.category_id ?? "uncategorized";
    const existing = byCategory.get(key);
    if (existing) {
      existing.total += Number(row.amount);
    } else {
      byCategory.set(key, {
        category_id: row.category_id,
        category_name: row.category?.name ?? "ไม่มีหมวดหมู่",
        color: row.category?.color ?? null,
        total: Number(row.amount),
      });
    }
  }

  return Array.from(byCategory.values()).sort((a, b) => b.total - a.total);
}

export async function getMonthlyTrend(
  monthsBack: number,
  fromMonthISO: string
): Promise<MonthlyTrendItem[]> {
  const months: string[] = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    months.push(addMonthsISO(fromMonthISO, -i));
  }

  const results = await Promise.all(
    months.map(async (month) => {
      const totals = await getMonthlyTotals(month);
      return { month, income: totals.income, expense: totals.expense };
    })
  );

  return results;
}
