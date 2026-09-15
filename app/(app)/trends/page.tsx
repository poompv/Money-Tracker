import Link from "next/link";
import clsx from "clsx";
import { getMonthlyTrend } from "@/lib/queries/transactions";
import { currentMonthISO } from "@/lib/utils/date";
import { formatTHB } from "@/lib/utils/currency";
import { MonthlyTrendChart } from "@/components/charts/MonthlyTrendChart";

export default async function TrendsPage({
  searchParams,
}: PageProps<"/trends">) {
  const params = await searchParams;
  const monthsBack = params.months === "12" ? 12 : 6;

  const items = await getMonthlyTrend(monthsBack, currentMonthISO());
  const totalIncome = items.reduce((sum, i) => sum + i.income, 0);
  const totalExpense = items.reduce((sum, i) => sum + i.expense, 0);
  const avgNet = (totalIncome - totalExpense) / (items.length || 1);

  return (
    <div className="mx-auto max-w-xl space-y-6 px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-sm font-semibold text-zinc-900">
          แนวโน้มรายรับ-รายจ่าย
        </h1>
        <div className="flex gap-1 text-sm">
          <Link
            href="/trends?months=6"
            className={clsx(
              "rounded-lg px-3 py-1.5",
              monthsBack === 6
                ? "bg-emerald-600 text-white"
                : "bg-zinc-100 text-zinc-600"
            )}
          >
            6 เดือน
          </Link>
          <Link
            href="/trends?months=12"
            className={clsx(
              "rounded-lg px-3 py-1.5",
              monthsBack === 12
                ? "bg-emerald-600 text-white"
                : "bg-zinc-100 text-zinc-600"
            )}
          >
            12 เดือน
          </Link>
        </div>
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <MonthlyTrendChart items={items} />
      </section>

      <div
        className={clsx(
          "rounded-xl p-4 text-center",
          avgNet >= 0 ? "bg-emerald-50" : "bg-red-50"
        )}
      >
        <p className="text-xs text-zinc-500">
          เฉลี่ยต่อเดือน ({monthsBack} เดือนล่าสุด)
        </p>
        <p
          className={clsx(
            "text-xl font-bold",
            avgNet >= 0 ? "text-emerald-700" : "text-red-700"
          )}
        >
          {avgNet >= 0 ? "เหลือเก็บ" : "ขาดดุล"} {formatTHB(Math.abs(avgNet))}
        </p>
      </div>
    </div>
  );
}
