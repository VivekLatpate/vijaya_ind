type AdminStatCardProps = {
  label: string;
  value: string;
  hint?: string;
};

export default function AdminStatCard({ label, value, hint }: AdminStatCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-foreground">{label}</p>
      <p className="mt-3 text-3xl font-bold text-heading">{value}</p>
      {hint ? <p className="mt-2 text-xs uppercase tracking-[0.15em] text-slate-400">{hint}</p> : null}
    </div>
  );
}
