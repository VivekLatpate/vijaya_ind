"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import AdminDrawer from "@/app/admin/components/AdminDrawer";
import AdminPageHeader from "@/app/admin/components/AdminPageHeader";
import StatusBadge from "@/app/admin/components/StatusBadge";

type Buyer = { _id: string; companyName?: string; name: string; address?: string };
type Product = { _id: string; name: string; sku: string };
type Order = {
  _id: string;
  orderId: string;
  buyerId: Buyer;
  products: { name: string; quantity: number }[];
  totalAmount: number;
  paymentStatus: "PAID" | "PARTIAL" | "UNPAID";
  status: "PLACED" | "CONFIRMED" | "PROCESSING" | "DISPATCHED" | "DELIVERED" | "CANCELLED";
  createdAt: string;
  notes: string;
};

const initialForm = {
  buyerId: "",
  productId: "",
  quantity: "1",
  paymentMethod: "CREDIT",
  paymentStatus: "UNPAID",
  address: "",
  notes: "",
};

export default function OrdersAdminClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState(initialForm);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordersResponse, buyersResponse, productsResponse] = await Promise.all([
        fetch("/api/orders", { cache: "no-store" }),
        fetch("/api/users", { cache: "no-store" }),
        fetch("/api/products", { cache: "no-store" }),
      ]);

      const ordersData = await ordersResponse.json();
      const buyersData = await buyersResponse.json();
      const productsData = await productsResponse.json();

      if (!ordersResponse.ok) throw new Error(ordersData.error ?? "Failed to load orders.");
      if (!buyersResponse.ok) throw new Error(buyersData.error ?? "Failed to load buyers.");
      if (!productsResponse.ok) throw new Error(productsData.error ?? "Failed to load products.");

      setOrders(ordersData.orders ?? []);
      setBuyers(buyersData.users ?? []);
      setProducts(productsData.products ?? []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const submitOrder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerId: form.buyerId,
          products: [{ productId: form.productId, quantity: Number(form.quantity) }],
          paymentMethod: form.paymentMethod,
          paymentStatus: form.paymentStatus,
          address: form.address,
          notes: form.notes,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to create order.");
      toast.success("Order created and stock reserved.");
      setDrawerOpen(false);
      setForm(initialForm);
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create order.");
    }
  };

  const updateStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to update order.");
      toast.success("Order updated.");
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update order.");
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to cancel order.");
      toast.success("Order cancelled and stock restored.");
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to cancel order.");
    }
  };

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        eyebrow="Orders"
        title="Order flow and fulfillment"
        description="Review all buyer orders, create manual admin orders, update delivery stages, and restore inventory automatically when cancelling."
        action={
          <button type="button" onClick={() => setDrawerOpen(true)} className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary/90">
            Create Order
          </button>
        }
      />

      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        {loading ? (
          <div className="space-y-3">{[1, 2, 3].map((item) => <div key={item} className="h-16 animate-pulse rounded-2xl bg-slate-100" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>{["Order", "Buyer", "Items", "Amount", "Payment", "Status", "Actions"].map((label) => <th key={label} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-heading">{order.orderId}</p>
                      <p className="mt-1 text-sm text-foreground">{new Date(order.createdAt).toLocaleDateString("en-IN")}</p>
                    </td>
                    <td className="px-4 py-4 text-sm text-foreground">{order.buyerId?.companyName || order.buyerId?.name}</td>
                    <td className="px-4 py-4 text-sm text-foreground">{order.products.map((item) => `${item.name} x${item.quantity}`).join(", ")}</td>
                    <td className="px-4 py-4 text-sm text-foreground">Rs. {order.totalAmount.toFixed(2)}</td>
                    <td className="px-4 py-4"><StatusBadge tone={order.paymentStatus === "PAID" ? "green" : order.paymentStatus === "PARTIAL" ? "yellow" : "red"} label={order.paymentStatus} /></td>
                    <td className="px-4 py-4">
                      <select value={order.status} onChange={(event) => void updateStatus(order._id, event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
                        {["PLACED", "CONFIRMED", "PROCESSING", "DISPATCHED", "DELIVERED", "CANCELLED"].map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-4">
                      <button type="button" onClick={() => void cancelOrder(order._id)} className="rounded-xl border border-rose-200 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50">
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AdminDrawer open={drawerOpen} title="Create Manual Order" description="Add phone or offline orders and reserve stock immediately." onClose={() => setDrawerOpen(false)}>
        <form onSubmit={submitOrder} className="grid gap-4">
          <label className="grid gap-2 text-sm font-medium text-heading">
            Buyer
            <select value={form.buyerId} onChange={(event) => setForm((current) => ({ ...current, buyerId: event.target.value }))} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none ring-primary/20 focus:ring-4">
              <option value="">Select buyer</option>
              {buyers.map((buyer) => <option key={buyer._id} value={buyer._id}>{buyer.companyName || buyer.name}</option>)}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-heading">
            Product
            <select value={form.productId} onChange={(event) => setForm((current) => ({ ...current, productId: event.target.value }))} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none ring-primary/20 focus:ring-4">
              <option value="">Select product</option>
              {products.map((product) => <option key={product._id} value={product._id}>{product.name} ({product.sku})</option>)}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-heading">Quantity<input value={form.quantity} onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value }))} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none ring-primary/20 focus:ring-4" /></label>
          <label className="grid gap-2 text-sm font-medium text-heading">Payment Method<input value={form.paymentMethod} onChange={(event) => setForm((current) => ({ ...current, paymentMethod: event.target.value }))} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none ring-primary/20 focus:ring-4" /></label>
          <label className="grid gap-2 text-sm font-medium text-heading">
            Payment Status
            <select value={form.paymentStatus} onChange={(event) => setForm((current) => ({ ...current, paymentStatus: event.target.value }))} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none ring-primary/20 focus:ring-4">
              {["UNPAID", "PARTIAL", "PAID"].map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-heading">Delivery Address<textarea value={form.address} onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))} rows={4} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none ring-primary/20 focus:ring-4" /></label>
          <label className="grid gap-2 text-sm font-medium text-heading">Notes<textarea value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} rows={3} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none ring-primary/20 focus:ring-4" /></label>
          <button type="submit" className="rounded-2xl bg-secondary px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">Create Order</button>
        </form>
      </AdminDrawer>
    </div>
  );
}
