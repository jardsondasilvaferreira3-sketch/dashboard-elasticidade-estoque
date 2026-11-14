import { type ReactNode } from "react";

interface KpiCardProps {
  label: string;
  value: string;
  icon?: ReactNode;
  accent?: "default" | "success" | "warning" | "danger";
}

const accentMap = {
  default: "border-blue-200 bg-blue-50 text-blue-700",
  success: "border-green-200 bg-green-50 text-green-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  danger: "border-red-200 bg-red-50 text-red-700",
};

export function KpiCard({ label, value, icon, accent = "default" }: KpiCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        {icon && (
          <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${accentMap[accent]}`}>
            {icon}
          </span>
        )}
      </div>
      <p className="mt-2 text-2xl font-bold text-slate-800">{value}</p>
    </div>
  );
}
