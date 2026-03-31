"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import AdminDrawer from "@/app/admin/components/AdminDrawer";
import AdminPageHeader from "@/app/admin/components/AdminPageHeader";
import StatusBadge from "@/app/admin/components/StatusBadge";

type Buyer = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
  address?: string;
  gstin?: string;
  isActive: boolean;
  metrics: {
    totalOrders: number;
    totalPurchaseAmount: number;
    outstandingBalance: number;
  };
};

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  companyName: "",
  address: "",
  gstin: "",
};

export default function BuyersAdminClient() {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingBuyer, setEditingBuyer] = useState<Buyer | null>(null);
  const [form, setForm] = useState(emptyForm);

  const loadBuyers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/users", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to load buyers.");
      setBuyers(data.users ?? []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load buyers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBuyers();
  }, []);

  const filteredBuyers = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return buyers;
    return buyers.filter((buyer) =>
      [buyer.name, buyer.email, buyer.phone, buyer.companyName, buyer.gstin]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [buyers, search]);

  const openCreate = () => {
    setEditingBuyer(null);
    setForm(emptyForm);
    setDrawerOpen(true);
  };

  const openEdit = (buyer: Buyer) => {
    setEditingBuyer(buyer);
    setForm({
      name: buyer.name,
      email: buyer.email,
      phone: buyer.phone ?? "",
      companyName: buyer.companyName ?? "",
      address: buyer.address ?? "",
      gstin: buyer.gstin ?? "",
    });
    setDrawerOpen(true);
  };

  const submitBuyer = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const url = editingBuyer ? `/api/users/${editingBuyer._id}` : "/api/users";
    const method = editingBuyer ? "PATCH" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to save buyer.");
      toast.success(editingBuyer ? "Buyer updated." : "Buyer created.");
      setDrawerOpen(false);
      await loadBuyers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save buyer.");
    }
  };

  const deactivateBuyer = async (buyer: Buyer) => {
    try {
      const response = await fetch(`/api/users/${buyer._id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to deactivate buyer.");
      toast.success("Buyer deactivated.");
      await loadBuyers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to deactivate buyer.");
    }
  };

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        eyebrow="Buyers"
        title="Buyer records and account health"
        description="Manage registered and offline buyers, review purchase history metrics, and deactivate accounts without losing transaction history."
        action={
          <button type="button" onClick={openCreate} className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary/90">
            Add Buyer
          </button>
        }
      />

      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by company, phone, email, or GSTIN"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none ring-primary/20 focus:ring-4 md:max-w-md"
          />
          <p className="text-sm text-foreground">{filteredBuyers.length} buyers shown</p>
        </div>

        {loading ? (
          <div className="mt-6 space-y-3">{[1, 2, 3].map((item) => <div key={item} className="h-16 animate-pulse rounded-2xl bg-slate-100" />)}</div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>{["Buyer", "Contact", "Business", "Outstanding", "Status", "Actions"].map((label) => <th key={label} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBuyers.map((buyer) => (
                  <tr key={buyer._id}>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-heading">{buyer.companyName || buyer.name}</p>
                      <p className="mt-1 text-sm text-foreground">{buyer.name}</p>
                    </td>
                    <td className="px-4 py-4 text-sm text-foreground">
                      <p>{buyer.email}</p>
                      <p className="mt-1">{buyer.phone || "No phone"}</p>
                    </td>
                    <td className="px-4 py-4 text-sm text-foreground">
                      <p>{buyer.metrics.totalOrders} orders</p>
                      <p className="mt-1">Rs. {buyer.metrics.totalPurchaseAmount.toFixed(2)}</p>
                    </td>
                    <td className="px-4 py-4 text-sm text-foreground">
                      Rs. {buyer.metrics.outstandingBalance.toFixed(2)}
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge tone={buyer.isActive ? "green" : "red"} label={buyer.isActive ? "Active" : "Inactive"} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => openEdit(buyer)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50">Edit</button>
                        <button type="button" onClick={() => void deactivateBuyer(buyer)} className="rounded-xl border border-rose-200 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50">Deactivate</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AdminDrawer open={drawerOpen} title={editingBuyer ? "Edit Buyer" : "Add Buyer"} description="Create or update buyer records for online and offline business." onClose={() => setDrawerOpen(false)}>
        <form onSubmit={submitBuyer} className="grid gap-4">
          {[
            ["name", "Contact Person"],
            ["email", "Email"],
            ["phone", "Phone"],
            ["companyName", "Company Name"],
            ["gstin", "GSTIN"],
          ].map(([key, label]) => (
            <label key={key} className="grid gap-2 text-sm font-medium text-heading">
              {label}
              <input value={form[key as keyof typeof form]} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none ring-primary/20 focus:ring-4" />
            </label>
          ))}
          <label className="grid gap-2 text-sm font-medium text-heading">
            Address
            <textarea value={form.address} onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))} rows={4} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none ring-primary/20 focus:ring-4" />
          </label>
          <button type="submit" className="rounded-2xl bg-secondary px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
            {editingBuyer ? "Save Buyer" : "Create Buyer"}
          </button>
        </form>
      </AdminDrawer>
    </div>
  );
}
