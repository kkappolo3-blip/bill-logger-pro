import { useState } from "react";
import { RotateCw, Zap, CheckCircle, Pencil, Trash2 } from "lucide-react";
import type { Bill } from "@/types/bill";
import { calculateArrears, formatCurrency, getStatusLabel } from "@/lib/billUtils";
import { StatusBadge } from "./StatusBadge";

interface BillCardProps {
  bill: Bill;
  onTogglePaid: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onAddNote: (billId: string, text: string) => void;
  onDeleteNote: (billId: string, noteId: number) => void;
}

export function BillCard({ bill, onTogglePaid, onEdit, onDelete, onAddNote, onDeleteNote }: BillCardProps) {
  const [noteText, setNoteText] = useState("");
  const arrears = calculateArrears(bill);
  const status = getStatusLabel(bill.dueDate, bill.paid);

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    onAddNote(bill.id, noteText.trim());
    setNoteText("");
  };

  return (
    <div className={`bg-card rounded-2xl shadow-sm border ${bill.paid ? "border-border opacity-75" : "border-border"} overflow-hidden p-4`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bill.paid ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}>
            {bill.isRecurring ? <RotateCw className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
          </div>
          <div>
            <h4 className="font-bold text-foreground">{bill.name}</h4>
            <StatusBadge label={status.label} variant={status.variant} />
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-black text-foreground">{formatCurrency(bill.amount)}</p>
          <p className="text-[10px] text-muted-foreground font-bold uppercase">{bill.interval || "Sekali Bayar"}</p>
        </div>
      </div>

      {!bill.paid && (
        <div className="bg-muted rounded-xl p-3 mb-3 border border-border">
          <div className="flex justify-between items-center mb-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Rencana Pembayaran</p>
            <p className="text-xs font-black text-destructive">
              {arrears.times > 1 ? `Tunggakan ${arrears.times}x - ` : ""}
              {formatCurrency(arrears.total)}
            </p>
          </div>

          <div className="space-y-2 mb-3">
            {bill.notes.map((n) => (
              <div key={n.id} className="bg-card p-2 rounded-lg border border-border text-xs flex justify-between items-center">
                <div className="flex-1">
                  <p className="text-foreground">{n.text}</p>
                  <p className="text-[9px] text-muted-foreground">{n.date}</p>
                </div>
                <button onClick={() => onDeleteNote(bill.id, n.id)} className="text-destructive/40 hover:text-destructive transition-colors ml-2">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
              className="flex-1 bg-card border border-border rounded-lg p-2 text-xs focus:ring-1 focus:ring-primary outline-none"
              placeholder="Input rencana baru..."
            />
            <button onClick={handleAddNote} className="px-3 bg-primary text-primary-foreground rounded-lg text-xs font-bold hover:opacity-90 transition-opacity">
              Simpan
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-2 justify-end">
        <button
          onClick={() => onTogglePaid(bill.id)}
          className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 ${
            bill.paid ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
          } hover:opacity-80 transition-opacity`}
        >
          <CheckCircle className="h-3 w-3" /> {bill.paid ? "Lunas" : "Bayar"}
        </button>
        <button onClick={() => onEdit(bill.id)} className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors">
          <Pencil className="h-3 w-3" />
        </button>
        <button onClick={() => onDelete(bill.id)} className="p-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors">
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
