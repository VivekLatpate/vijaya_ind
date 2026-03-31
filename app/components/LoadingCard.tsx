export default function LoadingCard({ label }: { label: string }) {
  return (
    <div className="rounded-3xl border border-border bg-white p-8 shadow-sm">
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-32 rounded bg-muted" />
        <div className="h-10 w-2/3 rounded bg-muted" />
        <div className="h-24 rounded-2xl bg-muted" />
      </div>
      <p className="mt-6 text-sm text-foreground">{label}</p>
    </div>
  );
}
