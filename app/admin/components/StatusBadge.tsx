type StatusBadgeProps = {
  tone: "green" | "yellow" | "red" | "blue" | "slate";
  label: string;
};

const toneMap = {
  green: "border-emerald-200 bg-emerald-50 text-emerald-700",
  yellow: "border-amber-200 bg-amber-50 text-amber-700",
  red: "border-rose-200 bg-rose-50 text-rose-700",
  blue: "border-sky-200 bg-sky-50 text-sky-700",
  slate: "border-slate-200 bg-slate-50 text-slate-700",
};

export default function StatusBadge({ tone, label }: StatusBadgeProps) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${toneMap[tone]}`}>
      {label}
    </span>
  );
}
