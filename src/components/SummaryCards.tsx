import { formatCurrency } from "@/lib/billUtils";

interface SummaryCardsProps {
  recurring: number;
  oneTime: number;
  total: number;
  paid: number;
}

export function SummaryCards({ recurring, oneTime, total, paid }: SummaryCardsProps) {
  const unpaid = Math.max(0, total - paid);
  const cards = [
    { label: "Estimasi Berulang", value: recurring, colorClass: "text-primary" },
    { label: "Estimasi Sekali Bayar", value: oneTime, colorClass: "text-warning" },
    { label: "Estimasi Total", value: total, colorClass: "text-foreground" },
    { label: "Sudah Terbayar", value: paid, colorClass: "text-success" },
    ...(unpaid > 0 ? [{ label: "Tunggakan/Belum", value: unpaid, colorClass: "text-destructive" }] : []),
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
      {cards.map((c) => (
        <div key={c.label} className="bg-card p-5 rounded-2xl shadow-sm border border-border">
          <p className={`text-xs font-bold uppercase mb-1 ${c.colorClass === "text-foreground" ? "text-muted-foreground" : c.colorClass}`}>{c.label}</p>
          <h3 className={`text-2xl font-black ${c.colorClass}`}>{formatCurrency(c.value)}</h3>
        </div>
      ))}
    </div>
  );
}
