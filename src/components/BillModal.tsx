import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { Bill } from "@/types/bill";

interface BillModalProps {
  open: boolean;
  editBill?: Bill | null;
  onClose: () => void;
  onSave: (data: { name: string; amount: number; dueDate: string; isRecurring: boolean; interval?: Bill["interval"] }) => void;
}

export function BillModal({ open, editBill, onClose, onSave }: BillModalProps) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [type, setType] = useState<"one-time" | "recurring">("one-time");
  const [interval, setInterval] = useState<Bill["interval"]>("Bulanan");

  useEffect(() => {
    if (editBill) {
      setName(editBill.name);
      setAmount(String(editBill.amount));
      setDueDate(editBill.dueDate);
      setType(editBill.isRecurring ? "recurring" : "one-time");
      setInterval(editBill.interval || "Bulanan");
    } else {
      setName(""); setAmount(""); setDueDate(""); setType("one-time"); setInterval("Bulanan");
    }
  }, [editBill, open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, amount: Number(amount), dueDate, isRecurring: type === "recurring", interval: type === "recurring" ? interval : undefined });
    onClose();
  };

  const labelClass = "block text-xs font-bold text-muted-foreground uppercase mb-1";
  const inputClass = "w-full px-4 py-2 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-foreground";

  return (
    <div className="fixed inset-0 bg-foreground/30 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card rounded-3xl max-w-md w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-foreground">{editBill ? "Edit Tagihan" : "Tambah Tagihan"}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Nama Tagihan</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Nominal (Rp)</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Jatuh Tempo</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Tipe</label>
            <div className="flex gap-4 p-1 bg-muted rounded-xl">
              {(["one-time", "recurring"] as const).map((t) => (
                <label key={t} className={`flex-1 text-center py-2 rounded-lg cursor-pointer transition-all ${type === t ? "bg-card shadow-sm" : ""}`}>
                  <input type="radio" name="billType" checked={type === t} onChange={() => setType(t)} className="hidden" />
                  <span className="text-sm font-medium text-muted-foreground">{t === "one-time" ? "Sekali" : "Berulang"}</span>
                </label>
              ))}
            </div>
          </div>
          {type === "recurring" && (
            <div>
              <label className={labelClass}>Interval</label>
              <select value={interval} onChange={(e) => setInterval(e.target.value as Bill["interval"])} className={inputClass}>
                <option value="Bulanan">Bulanan</option>
                <option value="Mingguan">Mingguan</option>
                <option value="Tahunan">Tahunan</option>
              </select>
            </div>
          )}
          <button type="submit" className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-opacity">
            Simpan Tagihan
          </button>
        </form>
      </div>
    </div>
  );
}
