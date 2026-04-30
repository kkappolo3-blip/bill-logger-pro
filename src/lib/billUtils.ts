import type { Bill, Arrears } from "@/types/bill";

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
