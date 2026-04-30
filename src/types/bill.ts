export interface BillNote {
  id: number;
  text: string;
  date: string;
}

export interface Payment {
  id: number;
  amount: number;
  date: string;       // ISO date string
  label: string;      // e.g. "Cicilan 1", "Bayar periode Maret 2026"
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  isRecurring: boolean;
  interval?: "Bulanan" | "Mingguan" | "Tahunan";
  paid: boolean;
  notes: BillNote[];
  payments: Payment[];
}

export interface Arrears {
  times: number;
  total: number;
}

export interface ArrearsPeriod {
  label: string;       // e.g. "Maret 2026"
  dueDate: Date;
  amount: number;
  paidAmount: number;
  isPaid: boolean;
}
