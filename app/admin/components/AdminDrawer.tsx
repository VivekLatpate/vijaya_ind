"use client";

type AdminDrawerProps = {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
};

export default function AdminDrawer({
  open,
  title,
  description,
  onClose,
  children,
}: AdminDrawerProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/35 p-0">
      <div className="h-full w-full max-w-xl overflow-y-auto border-l border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-2xl font-bold text-heading">{title}</h2>
            {description ? <p className="mt-2 text-sm text-foreground">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-foreground hover:bg-slate-50"
          >
            Close
          </button>
        </div>
        <div className="px-6 py-6">{children}</div>
      </div>
    </div>
  );
}
