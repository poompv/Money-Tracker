import { getCategories } from "@/lib/queries/categories";
import { getTransactionsByDay } from "@/lib/queries/transactions";
import { getBudgetProgress } from "@/lib/queries/budgets";
import { todayISO, currentMonthISO, formatThaiDateLong } from "@/lib/utils/date";
import { formatTHB } from "@/lib/utils/currency";
import { QuickAddForm } from "@/components/quick-add/QuickAddForm";
import { TransactionList } from "@/components/transactions/TransactionList";

export default async function QuickAddPage() {
  const today = todayISO();
  const [categories, todaysTx, budgetProgress] = await Promise.all([
    getCategories(),
    getTransactionsByDay(today),
    getBudgetProgress(currentMonthISO()),
  ]);

  const todayExpense = todaysTx
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const todayIncome = todaysTx
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <div className="mx-auto max-w-xl space-y-6 px-4 py-6">
      <QuickAddForm
        categories={categories}
        budgetProgress={budgetProgress}
        defaultDate={today}
      />

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900">
            รายการวันนี้ · {formatThaiDateLong(today)}
          </h2>
          <div className="text-xs text-zinc-500">
            รับ {formatTHB(todayIncome)} · จ่าย {formatTHB(todayExpense)}
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white px-4">
          <TransactionList transactions={todaysTx} />
        </div>
      </section>
    </div>
  );
}
