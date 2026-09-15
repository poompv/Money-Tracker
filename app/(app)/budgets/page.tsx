import Link from "next/link";
import { getCategories } from "@/lib/queries/categories";
import { getBudgetProgress } from "@/lib/queries/budgets";
import { addMonthsISO, currentMonthISO, formatThaiMonthYear } from "@/lib/utils/date";
import { BudgetRow } from "@/components/budgets/BudgetRow";

export default async function BudgetsPage({
  searchParams,
}: PageProps<"/budgets">) {
  const params = await searchParams;
  const month =
    typeof params.month === "string" && params.month
      ? params.month
      : currentMonthISO();

  const [categories, progress] = await Promise.all([
    getCategories("expense"),
    getBudgetProgress(month),
  ]);
  const progressByCategory = new Map(progress.map((p) => [p.category_id, p]));

  return (
    <div className="mx-auto max-w-xl space-y-4 px-4 py-6">
      <div className="flex items-center justify-between">
        <Link
          href={`/budgets?month=${addMonthsISO(month, -1)}`}
          className="rounded-lg px-3 py-2 text-zinc-500 hover:bg-zinc-100"
        >
          ← เดือนก่อน
        </Link>
        <h1 className="text-sm font-semibold text-zinc-900">
          {formatThaiMonthYear(month)}
        </h1>
        <Link
          href={`/budgets?month=${addMonthsISO(month, 1)}`}
          className="rounded-lg px-3 py-2 text-zinc-500 hover:bg-zinc-100"
        >
          เดือนถัดไป →
        </Link>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white px-4">
        {categories.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-400">
            ยังไม่มีหมวดหมู่รายจ่าย
          </p>
        ) : (
          categories.map((c) => (
            <BudgetRow
              key={c.id}
              category={c}
              progress={progressByCategory.get(c.id)}
              month={month}
            />
          ))
        )}
      </div>
    </div>
  );
}
