import { DeleteCategoryButton } from "./DeleteCategoryButton";
import type { Category } from "@/lib/types/database";

export function CategoryList({
  title,
  categories,
}: {
  title: string;
  categories: Category[];
}) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-4">
      <h2 className="mb-3 text-sm font-semibold text-zinc-900">{title}</h2>
      {categories.length === 0 ? (
        <p className="py-2 text-sm text-zinc-400">ยังไม่มีหมวดหมู่</p>
      ) : (
        <ul className="space-y-1">
          {categories.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between border-b border-zinc-100 py-2 last:border-0"
            >
              <span className="flex items-center gap-2 text-sm text-zinc-800">
                <span>{c.icon ?? "🏷️"}</span>
                {c.name}
              </span>
              <DeleteCategoryButton id={c.id} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
