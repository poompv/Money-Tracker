export interface NavItem {
  href: string;
  label: string;
  icon: string;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "บันทึก", icon: "✏️" },
  { href: "/daily", label: "รายวัน", icon: "📅" },
  { href: "/monthly", label: "รายเดือน", icon: "📊" },
  { href: "/budgets", label: "งบประมาณ", icon: "🎯" },
  { href: "/trends", label: "เทรนด์", icon: "📈" },
];
