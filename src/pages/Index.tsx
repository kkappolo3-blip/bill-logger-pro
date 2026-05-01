import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, RotateCw, Zap, LogOut, History } from "lucide-react";
import { useBills } from "@/hooks/useBills";
import { useAuth } from "@/contexts/AuthContext";
import { calculateArrears } from "@/lib/billUtils";
import { SidebarPanel } from "@/components/SidebarPanel";
import { SummaryCards } from "@/components/SummaryCards";
import { BillCard } from "@/components/BillCard";
import { BillModal } from "@/components/BillModal";
import { toast } from "sonner";

const Index = () => {
  const { bills, addBill, updateBill, deleteBill, togglePaid, addNote, deleteNote, addPayment, deletePayment } = useBills();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const editBill = editId ? bills.find((b) => b.id === editId) || null : null;

  const { total, paid, unpaid } = useMemo(() => {
    let total = 0, paid = 0, unpaid = 0;
    bills.forEach((bill) => {
      const arrears = calculateArrears(bill);
      if (bill.paid) paid += bill.amount;
      else unpaid += arrears.total;
      total += arrears.total;
    });
    return { total, paid, unpaid };
  }, [bills]);

  const activeBills = useMemo(() => bills.filter((b) => !b.paid), [bills]);
  const paidCount = useMemo(() => bills.filter((b) => b.paid).length, [bills]);
  const recurring = activeBills.filter((b) => b.isRecurring);
  const oneTime = activeBills.filter((b) => !b.isRecurring);

  const handleEdit = (id: string) => { setEditId(id); setModalOpen(true); };
  const handleDelete = (id: string) => { deleteBill(id); toast("Tagihan dihapus"); };
  const handleTogglePaid = (id: string) => { togglePaid(id); toast("Status pembayaran diperbarui"); };
  const handleAddNote = (billId: string, text: string) => { addNote(billId, text); toast("Catatan disimpan"); };
  const handleDeleteNote = (billId: string, noteId: string) => { deleteNote(billId, noteId); toast("Catatan dihapus"); };
  const handleAddPayment = (billId: string, amount: number, label: string) => { addPayment(billId, amount, label); toast("Pembayaran dicatat"); };
  const handleDeletePayment = (billId: string, paymentId: string) => { deletePayment(billId, paymentId); toast("Pembayaran dihapus"); };

  const handleSave = (data: Parameters<typeof addBill>[0]) => {
    if (editId) {
      updateBill(editId, data);
      toast("Tagihan diperbarui");
    } else {
      addBill(data);
      toast("Tagihan ditambahkan");
    }
    setEditId(null);
  };

  return (
    <div className="min-h-screen">
      <SidebarPanel />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Tagihan Giboy</h1>
            <p className="text-muted-foreground text-sm">Semua tagihan keluarga Khair, penyimpanan cloud</p>
            {user && <p className="text-xs text-muted-foreground mt-1">{user.email}</p>}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setEditId(null); setModalOpen(true); }}
              className="bg-primary hover:opacity-90 text-primary-foreground px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
            >
              <Plus className="h-4 w-4" /> Tambah Tagihan
            </button>
            <button
              onClick={() => { signOut(); toast("Berhasil keluar"); }}
              className="p-3 bg-muted text-muted-foreground rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors"
              title="Keluar"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        <SummaryCards total={total} paid={paid} unpaid={unpaid} />

        {bills.length === 0 && (
          <div className="py-20 text-center text-muted-foreground italic text-sm">Belum ada catatan tagihan.</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {recurring.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <RotateCw className="h-5 w-5 text-primary" />
                <h2 className="font-bold text-foreground text-xl">Berulang</h2>
              </div>
              <div className="space-y-4">
                {recurring.map((b) => (
                  <BillCard key={b.id} bill={b} onTogglePaid={handleTogglePaid} onEdit={handleEdit} onDelete={handleDelete} onAddNote={handleAddNote} onDeleteNote={handleDeleteNote} onAddPayment={handleAddPayment} onDeletePayment={handleDeletePayment} />
                ))}
              </div>
            </div>
          )}
          {oneTime.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-5 w-5 text-warning" />
                <h2 className="font-bold text-foreground text-xl">Sekali Bayar</h2>
              </div>
              <div className="space-y-4">
                {oneTime.map((b) => (
                  <BillCard key={b.id} bill={b} onTogglePaid={handleTogglePaid} onEdit={handleEdit} onDelete={handleDelete} onAddNote={handleAddNote} onDeleteNote={handleDeleteNote} onAddPayment={handleAddPayment} onDeletePayment={handleDeletePayment} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <BillModal open={modalOpen} editBill={editBill} onClose={() => { setModalOpen(false); setEditId(null); }} onSave={handleSave} />
    </div>
  );
};

export default Index;
