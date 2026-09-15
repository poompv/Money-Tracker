import type { BudgetLevel } from "@/lib/types/database";

export const BUDGET_WARNING_THRESHOLD = 0.7;

export function getBudgetLevel(spent: number, limit: number): BudgetLevel {
  if (limit <= 0) return "ok";
  const ratio = spent / limit;
  if (ratio >= 1) return "over";
  if (ratio >= BUDGET_WARNING_THRESHOLD) return "warning";
  return "ok";
}

export function getBudgetPercent(spent: number, limit: number): number {
  if (limit <= 0) return 0;
  return Math.min((spent / limit) * 100, 999);
}

export const BUDGET_LEVEL_LABEL: Record<BudgetLevel, string> = {
  ok: "ปกติ",
  warning: "ใกล้ถึงวงเงิน",
  over: "เกินวงเงินแล้ว",
};

export const BUDGET_LEVEL_CLASS: Record<
  BudgetLevel,
  { bar: string; text: string; bg: string }
> = {
  ok: { bar: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50" },
  warning: { bar: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50" },
  over: { bar: "bg-red-500", text: "text-red-700", bg: "bg-red-50" },
};
