import {
  addMonths,
  addDays,
  format,
  parseISO,
  startOfMonth,
} from "date-fns";

const THAI_MONTHS = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

const THAI_MONTHS_SHORT = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];

export function todayISO(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function currentMonthISO(): string {
  return format(startOfMonth(new Date()), "yyyy-MM-dd");
}

export function monthStartISO(dateISO: string): string {
  return format(startOfMonth(parseISO(dateISO)), "yyyy-MM-dd");
}

export function addMonthsISO(monthISO: string, delta: number): string {
  return format(addMonths(parseISO(monthISO), delta), "yyyy-MM-dd");
}

export function addDaysISO(dateISO: string, delta: number): string {
  return format(addDays(parseISO(dateISO), delta), "yyyy-MM-dd");
}

/** Buddhist-era year, as Thai users expect (2026 CE -> 2569). */
function buddhistYear(dateISO: string): number {
  return parseISO(dateISO).getFullYear() + 543;
}

export function formatThaiMonthYear(monthISO: string): string {
  const d = parseISO(monthISO);
  return `${THAI_MONTHS[d.getMonth()]} ${buddhistYear(monthISO)}`;
}

export function formatThaiDateShort(dateISO: string): string {
  const d = parseISO(dateISO);
  return `${d.getDate()} ${THAI_MONTHS_SHORT[d.getMonth()]} ${buddhistYear(dateISO)}`;
}

export function formatThaiDateLong(dateISO: string): string {
  const d = parseISO(dateISO);
  return `${d.getDate()} ${THAI_MONTHS[d.getMonth()]} ${buddhistYear(dateISO)}`;
}

export function formatThaiMonthShort(monthISO: string): string {
  const d = parseISO(monthISO);
  return `${THAI_MONTHS_SHORT[d.getMonth()]} ${(buddhistYear(monthISO) % 100).toString().padStart(2, "0")}`;
}
