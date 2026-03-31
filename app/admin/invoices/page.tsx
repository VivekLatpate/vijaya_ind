import AdminPageHeader from "@/app/admin/components/AdminPageHeader";
import StatusBadge from "@/app/admin/components/StatusBadge";
import { connectToDatabase } from "@/lib/db";
import { InvoiceModel } from "@/models/Invoice";
import { UserModel } from "@/models/User";

export default async function AdminInvoicesPage() {
  await connectToDatabase();
  const invoices = await InvoiceModel.find().sort({ createdAt: -1 }).lean();
  const buyerIds = invoices.map((invoice) => String(invoice.buyerId));
  const buyers = await UserModel.find({
    _id: { $in: buyerIds },
  }).lean();

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        eyebrow="Invoices"
        title="Billing and GST documents"
        description="Generate GST-compliant invoices, download PDFs, and optionally send them over email when SMTP is configured."
        action={
          <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-foreground">
            Manual invoices can be created with `POST /api/invoice`.
          </div>
        }
      />

      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>{["Invoice", "Buyer", "Amount", "GST", "Created", "Actions"].map((label) => <th key={label} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((invoice) => {
                const buyer = buyers.find((item) => String(item._id) === String(invoice.buyerId));
                return (
                  <tr key={String(invoice._id)}>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-heading">{invoice.invoiceNumber}</p>
                      <p className="mt-1 text-sm text-foreground">{invoice.orderId || "Manual invoice"}</p>
                    </td>
                    <td className="px-4 py-4 text-sm text-foreground">{buyer?.companyName || buyer?.name || "Buyer"}</td>
                    <td className="px-4 py-4 text-sm text-foreground">Rs. {invoice.totalAmount.toFixed(2)}</td>
                    <td className="px-4 py-4"><StatusBadge tone="blue" label={`CGST ${invoice.gstBreakup.cgst.toFixed(2)} | SGST ${invoice.gstBreakup.sgst.toFixed(2)}`} /></td>
                    <td className="px-4 py-4 text-sm text-foreground">{new Date(invoice.createdAt).toLocaleDateString("en-IN")}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <a href={`/api/invoice/${invoice._id}?format=pdf`} className="rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50">Download PDF</a>
                        <a href={`/api/invoice/${invoice._id}?format=email`} className="rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50">Send Email</a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
