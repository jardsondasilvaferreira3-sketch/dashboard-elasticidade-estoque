import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface CollapsibleProps {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function Collapsible({ title, defaultOpen = false, children }: CollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-xl px-5 py-3 text-left font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        {title}
        <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="border-t border-slate-100 px-5 py-4">{children}</div>}
    </div>
  );
}
