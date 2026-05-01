import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Bill } from "@/types/bill";

export function useBills() {
  const { user } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBills = useCallback(async () => {
    if (!user) return;
    const { data: billsData } = await supabase
      .from("bills")
      .select("*")
      .order("created_at", { ascending: false });

    if (!billsData) { setBills([]); setLoading(false); return; }

    const { data: notesData } = await supabase.from("bill_notes").select("*");
    const { data: paymentsData } = await supabase.from("bill_payments").select("*");

    const mapped: Bill[] = billsData.map((b) => ({
      id: b.id,
      name: b.name,
      amount: Number(b.amount),
      dueDate: b.due_date,
      category: b.category,
      isRecurring: b.is_recurring,
      interval: b.interval || undefined,
      paid: b.paid,
      notes: (notesData || [])
        .filter((n) => n.bill_id === b.id)
        .map((n) => ({ id: n.id, text: n.text, date: n.date })),
      payments: (paymentsData || [])
        .filter((p) => p.bill_id === b.id)
        .map((p) => ({ id: p.id, amount: Number(p.amount), date: p.date, label: p.label })),
    }));

    setBills(mapped);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchBills(); }, [fetchBills]);

  // Realtime subscriptions
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("bills-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "bills" }, () => fetchBills())
      .on("postgres_changes", { event: "*", schema: "public", table: "bill_notes" }, () => fetchBills())
      .on("postgres_changes", { event: "*", schema: "public", table: "bill_payments" }, () => fetchBills())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetchBills]);

  const addBill = useCallback(async (bill: { name: string; amount: number; dueDate: string; isRecurring: boolean; interval?: string; category?: string }) => {
    if (!user) return;
    await supabase.from("bills").insert({
      user_id: user.id,
      name: bill.name,
      amount: bill.amount,
      due_date: bill.dueDate,
      is_recurring: bill.isRecurring,
      interval: bill.interval || null,
      category: bill.category || "Umum",
    });
  }, [user]);

  const updateBill = useCallback(async (id: string, data: Partial<{ name: string; amount: number; dueDate: string; isRecurring: boolean; interval?: string; paid: boolean }>) => {
    const update: any = {};
    if (data.name !== undefined) update.name = data.name;
    if (data.amount !== undefined) update.amount = data.amount;
    if (data.dueDate !== undefined) update.due_date = data.dueDate;
    if (data.isRecurring !== undefined) update.is_recurring = data.isRecurring;
    if (data.interval !== undefined) update.interval = data.interval;
    if (data.paid !== undefined) update.paid = data.paid;
    await supabase.from("bills").update(update).eq("id", id);
  }, []);

  const deleteBill = useCallback(async (id: string) => {
    await supabase.from("bills").delete().eq("id", id);
  }, []);

  const togglePaid = useCallback(async (id: string) => {
    const bill = bills.find((b) => b.id === id);
    if (!bill) return;
    await supabase.from("bills").update({ paid: !bill.paid }).eq("id", id);
  }, [bills]);

  const addNote = useCallback(async (billId: string, text: string) => {
    if (!user) return;
    await supabase.from("bill_notes").insert({
      bill_id: billId,
      user_id: user.id,
      text,
      date: new Date().toLocaleDateString("id-ID"),
    });
  }, [user]);

  const deleteNote = useCallback(async (billId: string, noteId: string) => {
    await supabase.from("bill_notes").delete().eq("id", noteId);
  }, []);

  const addPayment = useCallback(async (billId: string, amount: number, label: string) => {
    if (!user) return;
    await supabase.from("bill_payments").insert({
      bill_id: billId,
      user_id: user.id,
      amount,
      label,
    });
  }, [user]);

  const deletePayment = useCallback(async (billId: string, paymentId: string) => {
    await supabase.from("bill_payments").delete().eq("id", paymentId);
  }, []);

  return { bills, loading, addBill, updateBill, deleteBill, togglePaid, addNote, deleteNote, addPayment, deletePayment };
}
