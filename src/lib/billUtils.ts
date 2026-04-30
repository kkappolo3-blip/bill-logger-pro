import type { Bill, Arrears, ArrearsPeriod } from "@/types/bill";

const MONTH_NAMES = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

export function calculateArrears(bill: Bill): Arrears {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(bill.dueDate);
  if (today <= due || bill.paid) return { times: 0, total: bill.amount };

  let times = 1;
  if (bill.isRecurring) {
    const diffDays = Math.ceil(Math.abs(today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    if (bill.interval === "Bulanan") times = Math.floor(diffDays / 30) + 1;
    else if (bill.interval === "Mingguan") times = Math.floor(diffDays / 7) + 1;
    else if (bill.interval === "Tahunan") times = Math.floor(diffDays / 365) + 1;
  }
  return { times, total: bill.amount * times };
}

export function getArrearsPeriods(bill: Bill): ArrearsPeriod[] {
  if (!bill.isRecurring || bill.paid) return [];
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(bill.dueDate);
  due.setHours(0, 0, 0, 0);
  
  if (today <= due) return [];

  const periods: ArrearsPeriod[] = [];
  const totalPaid = getTotalPaid(bill);
  let paidSoFar = 0;

  const arrears = calculateArrears(bill);
  
  for (let i = 0; i < arrears.times; i++) {
    const periodDate = new Date(due);
    if (bill.interval === "Bulanan") periodDate.setMonth(due.getMonth() + i);
    else if (bill.interval === "Mingguan") periodDate.setDate(due.getDate() + i * 7);
    else if (bill.interval === "Tahunan") periodDate.setFullYear(due.getFullYear() + i);

    const label = bill.interval === "Bulanan"
      ? `${MONTH_NAMES[periodDate.getMonth()]} ${periodDate.getFullYear()}`
      : bill.interval === "Mingguan"
        ? `Minggu ${periodDate.toLocaleDateString("id-ID")}`
        : `Tahun ${periodDate.getFullYear()}`;

    const periodPaid = Math.min(bill.amount, Math.max(0, totalPaid - paidSoFar));
    paidSoFar += periodPaid;

    periods.push({
      label,
      dueDate: periodDate,
      amount: bill.amount,
      paidAmount: periodPaid,
      isPaid: periodPaid >= bill.amount,
    });
  }

  return periods;
}

export function getTotalPaid(bill: Bill): number {
  return (bill.payments || []).reduce((sum, p) => sum + p.amount, 0);
}

export function getRemainingAmount(bill: Bill): number {
  const arrears = calculateArrears(bill);
  const totalDue = bill.paid ? bill.amount : arrears.total;
  return Math.max(0, totalDue - getTotalPaid(bill));
}

export function formatCurrency(num: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);
}

export function getStatusLabel(dueDate: string, isPaid: boolean) {
  if (isPaid) return { label: "Lunas", variant: "success" as const };
  const due = new Date(dueDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { label: `Telat ${Math.abs(diffDays)} Hari`, variant: "destructive" as const };
  if (diffDays <= 3) return { label: `H-${diffDays}`, variant: "warning" as const };
  return { label: `${diffDays} Hari Lagi`, variant: "info" as const };
}
