"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import AdminDrawer from "@/app/admin/components/AdminDrawer";
import AdminPageHeader from "@/app/admin/components/AdminPageHeader";
import StatusBadge from "@/app/admin/components/StatusBadge";

type Buyer = { _id: string; companyName?: string; name: string; phone?: string };
type Entry = {
  _id: string;
  date: string;
  entryId: string;
  orderId?: string;
  products: { name: string; qty: number }[];
  billAmount: number;
  amountReceived: number;
  balanceDue: number;
  paymentStatus: "PAID" | "PARTIAL" | "UNPAID";
  remarks: string;
};

export default function LedgerAdminClient() {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [selectedBuyerId, setSelectedBuyerId] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [summary, setSummary] = useState<{ totalPurchaseAmount: number; outstandingBalance: number; totalOrders: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState({ buyerId: "", products: "", billAmount: "0", amountReceived: "0", remarks: "" });

  const loadBuyers = useCallback(async () => {
    const response = await fetch("/api/users", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? "Failed to load buyers.");
    setBuyers(data.users ?? []);
    if (!selectedBuyerId && data.users?.length) {
      setSelectedBuyerId(data.users[0]._id);
    }
  }, [selectedBuyerId]);

  const loadLedger = async (buyerId: string) => {
    if (!buyerId) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/ledger/${buyerId}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to load ledger.");
      setEntries(data.entries ?? []);
      setSummary(data.summary ?? null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load ledger.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void (async () => {
      try {
        await loadBuyers();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load buyers.");
      }
    })();
  }, [loadBuyers]);

  useEffect(() => {
    if (selectedBuyerId) {
      void loadLedger(selectedBuyerId);
    }
  }, [selectedBuyerId]);

  const selectedBuyer = useMemo(
    () => buyers.find((buyer) => buyer._id === selectedBuyerId) ?? null,
    [buyers, selectedBuyerId],
  );

  const submitEntry = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const response = await fetch("/api/ledger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerId: form.buyerId,
          products: form.products
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
            .map((item) => {
              const [name, qty] = item.split(":");
              return { name: name.trim(), qty: Number(qty ?? 1) };
            }),
          billAmount: Number(form.billAmount),
          amountReceived: Number(form.amountReceived),
          remarks: form.remarks,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to create ledger entry.");
      toast.success("Ledger entry created.");
      setDrawerOpen(false);
      setForm({ buyerId: selectedBuyerId, products: "", billAmount: "0", amountReceived: "0", remarks: "" });
      await loadLedger(selectedBuyerId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create ledger entry.");
    }
  };

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        eyebrow="Buyer Ledger"
        title="Digital account book"
        description="Search a buyer, inspect every transaction, and add manual sales entries with payment visibility and remarks."
        action={
          <button type="button" onClick={() => { setForm((current) => ({ ...current, buyerId: selectedBuyerId })); setDrawerOpen(true); }} className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary/90">
            Add Manual Entry
          </button>
        }
      />

      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <select value={selectedBuyerId} onChange={(event) => setSelectedBuyerId(event.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none ring-primary/20 focus:ring-4 md:min-w-[320px]">
            {buyers.map((buyer) => <option key={buyer._id} value={buyer._id}>{buyer.companyName || buyer.name}{buyer.phone ? ` - ${buyer.phone}` : ""}</option>)}
          </select>
          {summary ? <div className="text-sm text-foreground">Lifetime business: <span className="font-semibold text-heading">Rs. {summary.totalPurchaseAmount.toFixed(2)}</span> | Outstanding: <span className="font-semibold text-heading">Rs. {summary.outstandingBalance.toFixed(2)}</span></div> : null}
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>{["Date", "Entry ID", "Products Sold", "Bill Amount", "Amount Received", "Balance Due", "Status", "Remarks"].map((label) => <th key={label} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-sm text-foreground">Loading ledger...</td></tr>
              ) : entries.length ? (
                entries.map((entry) => (
                  <tr key={entry._id}>
                    <td className="px-4 py-4 text-sm text-foreground">{new Date(entry.date).toLocaleDateString("en-IN")}</td>
                    <td className="px-4 py-4 text-sm text-foreground">{entry.orderId || entry.entryId}</td>
                    <td className="px-4 py-4 text-sm text-foreground">{entry.products.map((product) => `${product.name} x${product.qty}`).join(", ")}</td>
                    <td className="px-4 py-4 text-sm text-foreground">Rs. {entry.billAmount.toFixed(2)}</td>
                    <td className="px-4 py-4 text-sm text-foreground">Rs. {entry.amountReceived.toFixed(2)}</td>
                    <td className="px-4 py-4 text-sm text-foreground">Rs. {entry.balanceDue.toFixed(2)}</td>
                    <td className="px-4 py-4"><StatusBadge tone={entry.paymentStatus === "PAID" ? "green" : entry.paymentStatus === "PARTIAL" ? "yellow" : "red"} label={entry.paymentStatus} /></td>
                    <td className="px-4 py-4 text-sm text-foreground">{entry.remarks || "-"}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={8} className="px-4 py-8 text-sm text-foreground">No ledger entries for {selectedBuyer?.companyName || selectedBuyer?.name || "this buyer"} yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminDrawer open={drawerOpen} title="Manual Ledger Entry" description="Record offline or phone orders directly in the buyer ledger." onClose={() => setDrawerOpen(false)}>
        <form onSubmit={submitEntry} className="grid gap-4">
          <label className="grid gap-2 text-sm font-medium text-heading">
            Buyer
            <select value={form.buyerId} onChange={(event) => setForm((current) => ({ ...current, buyerId: event.target.value }))} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none ring-primary/20 focus:ring-4">
              <option value="">Select buyer</option>
              {buyers.map((buyer) => <option key={buyer._id} value={buyer._id}>{buyer.companyName || buyer.name}</option>)}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-heading">
            Products
            <input value={form.products} onChange={(event) => setForm((current) => ({ ...current, products: event.target.value }))} placeholder="Clip A:10, Clip B:5" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none ring-primary/20 focus:ring-4" />
          </label>
          <label className="grid gap-2 text-sm font-medium text-heading">Bill Amount<input value={form.billAmount} onChange={(event) => setForm((current) => ({ ...current, billAmount: event.target.value }))} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none ring-primary/20 focus:ring-4" /></label>
          <label className="grid gap-2 text-sm font-medium text-heading">Amount Received<input value={form.amountReceived} onChange={(event) => setForm((current) => ({ ...current, amountReceived: event.target.value }))} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none ring-primary/20 focus:ring-4" /></label>
          <label className="grid gap-2 text-sm font-medium text-heading">Remarks<textarea value={form.remarks} onChange={(event) => setForm((current) => ({ ...current, remarks: event.target.value }))} rows={4} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none ring-primary/20 focus:ring-4" /></label>
          <button type="submit" className="rounded-2xl bg-secondary px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">Create Entry</button>
        </form>
      </AdminDrawer>
    </div>
  );
}
