type AdminPageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
};

export default function AdminPageHeader({
  eyebrow,
  title,
  description,
  action,
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col justify-between gap-4 rounded-[28px] border border-slate-200 bg-white px-6 py-6 shadow-sm md:flex-row md:items-end">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-bold text-heading">{title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-foreground">{description}</p>
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
