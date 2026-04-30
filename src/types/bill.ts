export interface BillNote {
  id: number;
  text: string;
  date: string;
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
}

export interface Arrears {
  times: number;
  total: number;
}
