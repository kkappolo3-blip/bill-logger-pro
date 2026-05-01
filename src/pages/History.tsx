import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, RotateCw, Zap, Clock, Trash2 } from "lucide-react";
import { useBills } from "@/hooks/useBills";
import { formatCurrency } from "@/lib/billUtils";
import { useAuth } from "@/contexts/AuthContext";

const History = () => {
  const { bills, togglePaid, deleteBill } = useBills();
  const { user } = useAuth();
  const navigate = useNavigate();

  const paidBills = useMemo(() => bills.filter((b) => b.paid), [bills]);
  const totalPaid = useMemo(() => paidBills.reduce((s, b) => s + b.amount, 0), [paidBills]);

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/")}
            className="p-2 bg-muted text-muted-foreground rounded-xl hover:bg-accent transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">Riwayat Tagihan</h1>
            <p className="text-sm text-muted-foreground">
              {paidBills.length} tagihan lunas — Total {formatCurrency(totalPaid)}
            </p>
          </div>
        </div>

        {paidBills.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground italic text-sm">
            Belum ada tagihan yang lunas.
          </div>
        ) : (
          <div className="space-y-3">
            {paidBills.map((bill) => {
              const totalPayments = (bill.payments || []).reduce((s, p) => s + p.amount, 0);
              return (
                <div key={bill.id} className="bg-card rounded-2xl border border-border p-4 opacity-90">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-success/10 text-success flex items-center justify-center">
                        {bill.isRecurring ? <RotateCw className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">{bill.name}</h4>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle className="h-3 w-3 text-success" />
                          <span className="text-xs font-semibold text-success">Lunas</span>
                          <span className="text-[10px] text-muted-foreground ml-1">{bill.interval || "Sekali Bayar"}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-lg font-black text-foreground">{formatCurrency(bill.amount)}</p>
                  </div>

                  {/* Payment summary */}
                  {bill.payments.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1.5">Riwayat Pembayaran</p>
                      <div className="space-y-1">
                        {bill.payments.map((p) => (
                          <div key={p.id} className="flex justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3 w-3" />
                              <span>{p.label}</span>
                              <span className="text-[9px]">
                                {new Date(p.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                              </span>
                            </div>
                            <span className="font-semibold text-success">{formatCurrency(p.amount)}</span>
                          </div>
                        ))}
                      </div>
                      {totalPayments > 0 && (
                        <p className="text-[10px] text-muted-foreground mt-1.5 text-right">
                          Total dibayar: <span className="font-bold text-foreground">{formatCurrency(totalPayments)}</span>
                        </p>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 justify-end mt-3">
                    <button
                      onClick={() => togglePaid(bill.id)}
                      className="px-3 py-1.5 bg-muted text-muted-foreground rounded-lg text-xs font-semibold hover:bg-accent transition-colors"
                    >
                      Tandai Belum Lunas
                    </button>
                    <button
                      onClick={() => deleteBill(bill.id)}
                      className="p-1.5 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
