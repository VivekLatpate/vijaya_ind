import AdminPageHeader from "@/app/admin/components/AdminPageHeader";
import AdminStatCard from "@/app/admin/components/AdminStatCard";
import StatusBadge from "@/app/admin/components/StatusBadge";
import { connectToDatabase } from "@/lib/db";
import { ProductModel } from "@/models/Product";
import { UserModel } from "@/models/User";
import { OrderModel } from "@/models/Order";
import { LedgerModel } from "@/models/Ledger";
import { InvoiceModel } from "@/models/Invoice";

export default async function AdminDashboardPage() {
  await connectToDatabase();

  const [products, buyers, orders, ledgerEntries, invoices] = await Promise.all([
    ProductModel.find().lean(),
    UserModel.find({ role: "USER" }).lean(),
    OrderModel.find().lean(),
    LedgerModel.find().lean(),
    InvoiceModel.find().lean(),
  ]);

  const inventoryValue = products.reduce((sum, product) => sum + product.stock * product.price, 0);
  const outstanding = ledgerEntries.reduce((sum, entry) => sum + entry.balanceDue, 0);
  const lowStockCount = products.filter(
    (product) => product.stock > 0 && product.stock <= product.lowStockThreshold,
  ).length;
  const outOfStockCount = products.filter((product) => product.stock <= 0).length;

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        eyebrow="Dashboard"
        title="Single-screen command center"
        description="Track commerce, inventory, buyers, and billing from one admin workspace. Every module below is powered by admin-only APIs and MongoDB-backed business rules."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <AdminStatCard label="Products" value={String(products.length)} hint="catalogue items" />
        <AdminStatCard label="Active Buyers" value={String(buyers.filter((buyer) => buyer.isActive).length)} hint="registered buyers" />
        <AdminStatCard label="Orders" value={String(orders.length)} hint="all-time orders" />
        <AdminStatCard label="Outstanding" value={`Rs. ${outstanding.toFixed(2)}`} hint="ledger balance" />
        <AdminStatCard label="Inventory Value" value={`Rs. ${inventoryValue.toFixed(2)}`} hint="selling price basis" />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-heading">Operational Snapshot</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-foreground">Invoices Generated</p>
              <p className="mt-2 text-2xl font-semibold text-heading">{invoices.length}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-foreground">Ledger Entries</p>
              <p className="mt-2 text-2xl font-semibold text-heading">{ledgerEntries.length}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-foreground">Low Stock Products</p>
              <div className="mt-3">
                <StatusBadge tone="yellow" label={`${lowStockCount} need attention`} />
              </div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-foreground">Out of Stock</p>
              <div className="mt-3">
                <StatusBadge tone="red" label={`${outOfStockCount} unavailable`} />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-secondary p-6 text-white shadow-sm">
          <h2 className="text-xl font-bold">What this admin panel now handles</h2>
          <div className="mt-5 grid gap-3 text-sm text-slate-300">
            <p>Products and categories with visibility toggles and stock thresholds.</p>
            <p>Inventory adjustments with logs, valuation, and Excel export.</p>
            <p>Buyer records with manual creation, deactivation, and profile metrics.</p>
            <p>Ledger entries for website and offline sales with outstanding tracking.</p>
            <p>Orders with stock reservation, cancellation restore, and invoice creation.</p>
            <p>Invoice PDF download plus optional SMTP email delivery when configured.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
