import { useState } from "react";
import { RotateCw, Zap, CheckCircle, Pencil, Trash2, AlertTriangle, CreditCard, ChevronDown, ChevronUp, Clock } from "lucide-react";
import type { Bill } from "@/types/bill";
import { calculateArrears, formatCurrency, getStatusLabel, getArrearsPeriods, getTotalPaid, getRemainingAmount } from "@/lib/billUtils";
import { StatusBadge } from "./StatusBadge";

interface BillCardProps {
  bill: Bill;
  onTogglePaid: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onAddNote: (billId: string, text: string) => void;
  onDeleteNote: (billId: string, noteId: string) => void;
  onAddPayment: (billId: string, amount: number, label: string) => void;
  onDeletePayment: (billId: string, paymentId: string) => void;
}

export function BillCard({ bill, onTogglePaid, onEdit, onDelete, onAddNote, onDeleteNote, onAddPayment, onDeletePayment }: BillCardProps) {
  const [noteText, setNoteText] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentLabel, setPaymentLabel] = useState("");
  const [installmentCount, setInstallmentCount] = useState("");
  const [payMode, setPayMode] = useState<"free" | "split">("free");
  const [showPeriods, setShowPeriods] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const arrears = calculateArrears(bill);
  const status = getStatusLabel(bill.dueDate, bill.paid);
  const periods = getArrearsPeriods(bill);
  const totalPaid = getTotalPaid(bill);
  const remaining = getRemainingAmount(bill);
  const hasArrears = periods.length > 0 && !bill.paid;
  const unpaidPeriods = periods.filter((p) => !p.isPaid);
  const unpaidCount = unpaidPeriods.length;

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    onAddNote(bill.id, noteText.trim());
    setNoteText("");
  };

  const handlePayFree = () => {
    const amt = Number(paymentAmount);
    if (!amt || amt <= 0) return;
    onAddPayment(bill.id, amt, paymentLabel || "Cicilan");
    setPaymentAmount("");
    setPaymentLabel("");
  };

  const handlePaySplit = () => {
    const count = Number(installmentCount);
    if (!count || count <= 0) return;
    const amt = Math.ceil(remaining / count);
    onAddPayment(bill.id, amt, `Cicilan 1/${count}`);
    setInstallmentCount("");
  };

  const handlePayPeriod = (period: { label: string; amount: number; paidAmount: number }) => {
    const amt = period.amount - period.paidAmount;
    if (amt <= 0) return;
    onAddPayment(bill.id, amt, `Bayar ${period.label}`);
  };

  return (
    <div className={`bg-card rounded-2xl shadow-sm border ${bill.paid ? "border-border opacity-75" : hasArrears ? "border-destructive/40" : "border-border"} overflow-hidden`}>
      {/* Arrears Warning Banner */}
      {hasArrears && (
        <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-2 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <span className="text-xs font-bold text-destructive">
            Menunggak {unpaidCount} periode — Total {formatCurrency(remaining)}
          </span>
        </div>
      )}

      <div className="p-4">
        {/* Header */}
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

        {/* Payment Progress */}
        {!bill.paid && totalPaid > 0 && (
          <div className="mb-3">
            <div className="flex justify-between text-[10px] font-bold text-muted-foreground mb-1">
              <span>Terbayar: {formatCurrency(totalPaid)}</span>
              <span>Sisa: {formatCurrency(remaining)}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-success h-2 rounded-full transition-all"
                style={{ width: `${Math.min(100, (totalPaid / arrears.total) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Arrears Periods Breakdown */}
        {hasArrears && (
          <div className="mb-3">
            <button
              onClick={() => setShowPeriods(!showPeriods)}
              className="flex items-center gap-1 text-xs font-bold text-destructive hover:text-destructive/80 mb-2"
            >
              {showPeriods ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              Detail Tunggakan ({unpaidCount} belum bayar / {periods.length} periode)
            </button>
            {showPeriods && (
              <div className="space-y-1.5">
                {periods.map((p, i) => (
                  <div key={i} className={`flex items-center justify-between text-xs p-2 rounded-lg border ${p.isPaid ? "bg-success/5 border-success/20" : "bg-destructive/5 border-destructive/15"}`}>
                    <div className="flex items-center gap-2">
                      {p.isPaid ? (
                        <CheckCircle className="h-3 w-3 text-success" />
                      ) : (
                        <AlertTriangle className="h-3 w-3 text-destructive" />
                      )}
                      <span className={`font-medium ${p.isPaid ? "text-success line-through" : "text-foreground"}`}>
                        {p.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">
                        {p.isPaid ? "Lunas" : formatCurrency(p.amount - p.paidAmount)}
                      </span>
                      {!p.isPaid && (
                        <button
                          onClick={() => handlePayPeriod(p)}
                          className="px-2 py-0.5 bg-primary text-primary-foreground rounded text-[10px] font-bold hover:opacity-90"
                        >
                          Bayar
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notes Section */}
        {!bill.paid && (
          <div className="bg-muted rounded-xl p-3 mb-3 border border-border">
            <div className="flex justify-between items-center mb-2">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Rencana Pembayaran</p>
              <p className="text-xs font-black text-destructive">
                {unpaidCount > 0 ? `Tunggakan ${unpaidCount}x - ` : ""}
                {formatCurrency(remaining)}
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

        {/* Installment / Cicilan Section */}
        {!bill.paid && (
          <div className="mb-3">
            <button
              onClick={() => setShowPayment(!showPayment)}
              className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 mb-2"
            >
              <CreditCard className="h-3.5 w-3.5" />
              {showPayment ? "Tutup Cicilan" : "Bayar / Cicil"}
            </button>

            {showPayment && (
              <div className="bg-primary/5 rounded-xl p-3 border border-primary/15 space-y-3">
                {/* Mode toggle */}
                <div className="flex gap-2 p-0.5 bg-muted rounded-lg">
                  {(["free", "split"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setPayMode(m)}
                      className={`flex-1 text-[10px] font-bold py-1.5 rounded-md transition-all ${payMode === m ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}
                    >
                      {m === "free" ? "Nominal Bebas" : "Bagi Rata"}
                    </button>
                  ))}
                </div>

                {payMode === "free" ? (
                  <div className="space-y-2">
                    <input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className="w-full bg-card border border-border rounded-lg p-2 text-xs focus:ring-1 focus:ring-primary outline-none"
                      placeholder={`Nominal (sisa: ${formatCurrency(remaining)})`}
                    />
                    <input
                      type="text"
                      value={paymentLabel}
                      onChange={(e) => setPaymentLabel(e.target.value)}
                      className="w-full bg-card border border-border rounded-lg p-2 text-xs focus:ring-1 focus:ring-primary outline-none"
                      placeholder="Keterangan (opsional)"
                    />
                    <button onClick={handlePayFree} className="w-full py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold hover:opacity-90">
                      Bayar {paymentAmount ? formatCurrency(Number(paymentAmount)) : ""}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[10px] text-muted-foreground">Sisa tagihan: <span className="font-bold text-foreground">{formatCurrency(remaining)}</span></p>
                    <input
                      type="number"
                      value={installmentCount}
                      onChange={(e) => setInstallmentCount(e.target.value)}
                      className="w-full bg-card border border-border rounded-lg p-2 text-xs focus:ring-1 focus:ring-primary outline-none"
                      placeholder="Jumlah cicilan (misal: 3)"
                    />
                    {installmentCount && Number(installmentCount) > 0 && (
                      <p className="text-[10px] text-muted-foreground">
                        Per cicilan: <span className="font-bold text-foreground">{formatCurrency(Math.ceil(remaining / Number(installmentCount)))}</span>
                      </p>
                    )}
                    <button onClick={handlePaySplit} className="w-full py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold hover:opacity-90">
                      Bayar Cicilan Pertama
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Payment History */}
        {(bill.payments || []).length > 0 && (
          <div className="mb-3">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground mb-2"
            >
              <Clock className="h-3.5 w-3.5" />
              Riwayat Pembayaran ({bill.payments.length})
              {showHistory ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
            {showHistory && (
              <div className="space-y-1.5">
                {bill.payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-xs p-2 bg-success/5 rounded-lg border border-success/15">
                    <div>
                      <p className="font-medium text-foreground">{p.label}</p>
                      <p className="text-[9px] text-muted-foreground">
                        {new Date(p.date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-success">{formatCurrency(p.amount)}</span>
                      <button onClick={() => onDeletePayment(bill.id, p.id)} className="text-destructive/30 hover:text-destructive">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => onTogglePaid(bill.id)}
            className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 ${
              bill.paid ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
            } hover:opacity-80 transition-opacity`}
          >
            <CheckCircle className="h-3 w-3" /> {bill.paid ? "Lunas" : "Tandai Lunas"}
          </button>
          <button onClick={() => onEdit(bill.id)} className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors">
            <Pencil className="h-3 w-3" />
          </button>
          <button onClick={() => onDelete(bill.id)} className="p-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors">
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
