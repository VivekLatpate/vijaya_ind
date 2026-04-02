import AdminPageHeader from "@/app/admin/components/AdminPageHeader";
import InvoiceActions from "@/app/admin/components/InvoiceActions";
import StatusBadge from "@/app/admin/components/StatusBadge";
import { connectToDatabase } from "@/lib/db";
import { InvoiceModel } from "@/models/Invoice";
import { UserModel } from "@/models/User";

export default async function AdminInvoicesPage() {
  await connectToDatabase();
  const invoices = await InvoiceModel.find().sort({ createdAt: -1 }).lean();
  const buyerIds = invoices.map((invoice) => String(invoice.buyerId));
  const buyers = await UserModel.find({ _id: { $in: buyerIds } }).lean();

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        eyebrow="Invoices"
        title="Billing and GST documents"
        description=""
        action={null}
      />

      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        {invoices.length === 0 ? (
          <p className="py-12 text-center text-sm text-foreground">
            No invoices yet. They are created automatically when an order is
            placed.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  {[
                    "Invoice",
                    "Buyer",
                    "Amount",
                    "GST",
                    "Created",
                    "Actions",
                  ].map((label) => (
                    <th
                      key={label}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((invoice) => {
                  const buyer = buyers.find(
                    (b) => String(b._id) === String(invoice.buyerId),
                  );
                  return (
                    <tr
                      key={String(invoice._id)}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      {/* Invoice number + order ref */}
                      <td className="px-4 py-4">
                        <p className="font-semibold text-heading">
                          {invoice.invoiceNumber}
                        </p>
                        <p className="mt-1 text-sm text-foreground">
                          {invoice.orderId
                            ? String(invoice.orderId)
                            : "Manual invoice"}
                        </p>
                      </td>

                      {/* Buyer */}
                      <td className="px-4 py-4">
                        <p className="text-sm font-medium text-heading">
                          {buyer?.companyName || buyer?.name || "—"}
                        </p>
                        {buyer?.email && (
                          <p className="mt-0.5 text-xs text-foreground">
                            {buyer.email}
                          </p>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-4 text-sm font-medium text-heading">
                        ₹{invoice.totalAmount.toFixed(2)}
                      </td>

                      {/* GST breakup */}
                      <td className="px-4 py-4">
                        <StatusBadge
                          tone="blue"
                          label={`CGST ${invoice.gstBreakup.cgst.toFixed(2)} | SGST ${invoice.gstBreakup.sgst.toFixed(2)}`}
                        />
                      </td>

                      {/* Date */}
                      <td className="px-4 py-4 text-sm text-foreground">
                        {new Date(invoice.createdAt).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </td>

                      {/* Actions — client component handles fetch + toasts */}
                      <td className="px-4 py-4">
                        <InvoiceActions
                          invoiceId={String(invoice._id)}
                          invoiceNumber={invoice.invoiceNumber}
                          buyerEmail={buyer?.email}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
