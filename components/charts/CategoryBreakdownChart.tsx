"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { formatTHB } from "@/lib/utils/currency";
import type { CategoryBreakdownItem } from "@/lib/types/database";

const PALETTE = [
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#6366f1",
  "#84cc16",
];

export function CategoryBreakdownChart({
  items,
}: {
  items: CategoryBreakdownItem[];
}) {
  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-zinc-400">
        ยังไม่มีข้อมูลในเดือนนี้
      </p>
    );
  }

  const data = items.map((item, i) => ({
    name: item.category_name,
    value: item.total,
    color: item.color ?? PALETTE[i % PALETTE.length],
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={2}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => formatTHB(Number(value))} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
