import { useState, useCallback } from "react";
import type { Bill } from "@/types/bill";

const STORAGE_KEY = "portable_bills_v3.5";

function loadBills(): Bill[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveBills(bills: Bill[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bills));
}

export function useBills() {
  const [bills, setBills] = useState<Bill[]>(loadBills);

  const update = useCallback((fn: (prev: Bill[]) => Bill[]) => {
    setBills((prev) => {
      const next = fn(prev);
      saveBills(next);
      return next;
    });
  }, []);

  const addBill = useCallback((bill: Omit<Bill, "id" | "paid" | "notes">) => {
    update((prev) => [...prev, { ...bill, id: Date.now().toString(), paid: false, notes: [] }]);
  }, [update]);

  const updateBill = useCallback((id: string, data: Partial<Bill>) => {
    update((prev) => prev.map((b) => (b.id === id ? { ...b, ...data } : b)));
  }, [update]);

  const deleteBill = useCallback((id: string) => {
    update((prev) => prev.filter((b) => b.id !== id));
  }, [update]);

  const togglePaid = useCallback((id: string) => {
    update((prev) => prev.map((b) => (b.id === id ? { ...b, paid: !b.paid } : b)));
  }, [update]);

  const addNote = useCallback((billId: string, text: string) => {
    update((prev) =>
      prev.map((b) =>
        b.id === billId
          ? { ...b, notes: [...b.notes, { id: Date.now(), text, date: new Date().toLocaleDateString("id-ID") }] }
          : b
      )
    );
  }, [update]);

  const deleteNote = useCallback((billId: string, noteId: number) => {
    update((prev) =>
      prev.map((b) => (b.id === billId ? { ...b, notes: b.notes.filter((n) => n.id !== noteId) } : b))
    );
  }, [update]);

  return { bills, addBill, updateBill, deleteBill, togglePaid, addNote, deleteNote };
}
