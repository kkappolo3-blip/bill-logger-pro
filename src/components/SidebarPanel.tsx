import { useState } from "react";
import { Calculator as CalcIcon, LayoutGrid } from "lucide-react";
import { Calculator } from "./Calculator";

export function SidebarPanel() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className={`fixed top-0 left-0 h-full bg-card shadow-xl z-40 flex flex-col border-r border-border w-80 transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setOpen(!open)}
          className="absolute top-5 -right-10 bg-primary text-primary-foreground w-10 h-10 rounded-r-xl flex items-center justify-center shadow-lg active:scale-95 transition-all"
        >
          <CalcIcon className="h-4 w-4" />
        </button>

        <div className="p-5 border-b border-border">
          <h2 className="font-bold text-foreground text-lg flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-primary" /> Workspace
          </h2>
        </div>

        <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
          <p className="text-xs font-bold text-muted-foreground mb-3 uppercase">Quick Calculator</p>
          <Calculator />
        </div>
      </div>

      {open && <div className="fixed inset-0 bg-foreground/10 z-30 lg:hidden" onClick={() => setOpen(false)} />}
    </>
  );
}
