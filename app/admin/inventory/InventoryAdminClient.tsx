"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import AdminDrawer from "@/app/admin/components/AdminDrawer";
import AdminPageHeader from "@/app/admin/components/AdminPageHeader";
import StatusBadge from "@/app/admin/components/StatusBadge";

type InventoryRow = {
  Name: string;
  SKU: string;
  Category: string;
  Stock: number;
  Price: number;
  Value: number;
  Status: "IN" | "LOW" | "OUT";
};

type LogItem = {
  _id: string;
  productId: { _id: string; name: string; sku: string };
  changeType: "IN" | "OUT";
  quantity: number;
  reason: string;
  date: string;
};

type ProductOption = {
  _id: string;
  name: string;
  sku: string;
  stock: number;
};

export default function InventoryAdminClient() {
  const [report, setReport] = useState<InventoryRow[]>([]);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState({ productId: "", quantity: "1", reason: "", changeType: "IN" });

  const loadData = async () => {
    setLoading(true);
    try {
      const [reportResponse, logsResponse, productsResponse] = await Promise.all([
        fetch("/api/inventory/report", { cache: "no-store" }),
        fetch("/api/inventory/logs", { cache: "no-store" }),
        fetch("/api/products", { cache: "no-store" }),
      ]);

      const reportData = await reportResponse.json();
      const logsData = await logsResponse.json();
      const productsData = await productsResponse.json();

      if (!reportResponse.ok) throw new Error(reportData.error ?? "Failed to load inventory.");
      if (!logsResponse.ok) throw new Error(logsData.error ?? "Failed to load logs.");
      if (!productsResponse.ok) throw new Error(productsData.error ?? "Failed to load products.");

      setReport(reportData.products ?? []);
      setTotalValue(reportData.totalValue ?? 0);
      setLogs(logsData.logs ?? []);
      setProducts(productsData.products ?? []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load inventory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const stockCounts = useMemo(
    () => ({
      in: report.filter((item) => item.Status === "IN").length,
      low: report.filter((item) => item.Status === "LOW").length,
      out: report.filter((item) => item.Status === "OUT").length,
    }),
    [report],
  );

  const submitAdjustment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const response = await fetch("/api/inventory/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          quantity: Number(form.quantity),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to update inventory.");
      toast.success("Inventory updated.");
      setDrawerOpen(false);
      setForm({ productId: "", quantity: "1", reason: "", changeType: "IN" });
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update inventory.");
    }
  };

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        eyebrow="Inventory"
        title="Stock control and valuation"
        description="Track live stock health, record manual adjustments, and export your latest inventory position to Excel."
        action={
          <div className="flex gap-3">
            <a href="/api/inventory/report?format=excel" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-heading hover:bg-slate-50">
              Export Excel
            </a>
            <button type="button" onClick={() => setDrawerOpen(true)} className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary/90">
              Adjust Stock
            </button>
          </div>
        }
      />

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-foreground">Inventory Value</p><p className="mt-3 text-3xl font-bold">Rs. {totalValue.toFixed(2)}</p></div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-foreground">In Stock</p><div className="mt-3"><StatusBadge tone="green" label={`${stockCounts.in} products`} /></div></div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-foreground">Low Stock</p><div className="mt-3"><StatusBadge tone="yellow" label={`${stockCounts.low} products`} /></div></div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-foreground">Out of Stock</p><div className="mt-3"><StatusBadge tone="red" label={`${stockCounts.out} products`} /></div></div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-heading">Inventory Snapshot</h2>
          {loading ? (
            <div className="mt-6 space-y-3">{[1, 2, 3].map((item) => <div key={item} className="h-16 animate-pulse rounded-2xl bg-slate-100" />)}</div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>{["Product", "Category", "Stock", "Value", "Status"].map((label) => <th key={label} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report.map((row) => (
                    <tr key={row.SKU}>
                      <td className="px-4 py-4"><p className="font-semibold text-heading">{row.Name}</p><p className="mt-1 text-sm text-foreground">{row.SKU}</p></td>
                      <td className="px-4 py-4 text-sm text-foreground">{row.Category}</td>
                      <td className="px-4 py-4 text-sm text-foreground">{row.Stock}</td>
                      <td className="px-4 py-4 text-sm text-foreground">Rs. {row.Value.toFixed(2)}</td>
                      <td className="px-4 py-4"><StatusBadge tone={row.Status === "IN" ? "green" : row.Status === "LOW" ? "yellow" : "red"} label={row.Status === "IN" ? "In Stock" : row.Status === "LOW" ? "Low Stock" : "Out of Stock"} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-heading">Recent Stock Logs</h2>
          <div className="mt-6 grid gap-3">
            {logs.slice(0, 8).map((log) => (
              <div key={log._id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-heading">{log.productId?.name || "Product"}</p>
                  <StatusBadge tone={log.changeType === "IN" ? "green" : "yellow"} label={`${log.changeType} ${log.quantity}`} />
                </div>
                <p className="mt-2 text-sm text-foreground">{log.reason}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.14em] text-slate-400">{new Date(log.date).toLocaleString("en-IN")}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AdminDrawer open={drawerOpen} title="Adjust Inventory" description="Log a stock increase or decrease with a clear operational reason." onClose={() => setDrawerOpen(false)}>
        <form onSubmit={submitAdjustment} className="grid gap-4">
          <label className="grid gap-2 text-sm font-medium text-heading">
            Product
            <select value={form.productId} onChange={(event) => setForm((current) => ({ ...current, productId: event.target.value }))} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none ring-primary/20 focus:ring-4">
              <option value="">Select product</option>
              {products.map((product) => <option key={product._id} value={product._id}>{product.name} ({product.sku})</option>)}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-heading">
            Change Type
            <select value={form.changeType} onChange={(event) => setForm((current) => ({ ...current, changeType: event.target.value }))} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none ring-primary/20 focus:ring-4">
              <option value="IN">Increase</option>
              <option value="OUT">Decrease</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-heading">
            Quantity
            <input value={form.quantity} onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value }))} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none ring-primary/20 focus:ring-4" />
          </label>
          <label className="grid gap-2 text-sm font-medium text-heading">
            Reason
            <textarea value={form.reason} onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))} rows={4} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none ring-primary/20 focus:ring-4" />
          </label>
          <button type="submit" className="rounded-2xl bg-secondary px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">Save Adjustment</button>
        </form>
      </AdminDrawer>
    </div>
  );
}
