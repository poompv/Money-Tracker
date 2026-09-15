import { getCategories } from "@/lib/queries/categories";
import { CategoryForm } from "@/components/categories/CategoryForm";
import { CategoryList } from "@/components/categories/CategoryList";

export default async function CategoriesPage() {
  const categories = await getCategories();
  const expense = categories.filter((c) => c.type === "expense");
  const income = categories.filter((c) => c.type === "income");

  return (
    <div className="mx-auto max-w-xl space-y-4 px-4 py-6">
      <h1 className="text-sm font-semibold text-zinc-900">จัดการหมวดหมู่</h1>
      <CategoryForm />
      <CategoryList title="หมวดหมู่รายจ่าย" categories={expense} />
      <CategoryList title="หมวดหมู่รายรับ" categories={income} />
    </div>
  );
}
