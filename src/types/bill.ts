export interface Payment {
  id: string;
  amount: number;
  date: string;
  label: string;
}

export interface Note {
  id: string;
  text: string;
  date: string;
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  category: string;
  isRecurring: boolean;
  interval?: string;
  paid: boolean;
  notes: Note[];
  payments: Payment[];
}

export interface Arrears {
  times: number;
  total: number;
}

export interface ArrearsPeriod {
  label: string;
  dueDate: Date;
  amount: number;
  paidAmount: number;
  isPaid: boolean;
}
