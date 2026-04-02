import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db";
import { OrderModel } from "@/models/Order";
import { UserModel } from "@/models/User";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { ArrowLeft, Download, Package, CheckCircle, Truck, MapPin } from "lucide-react";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  await connectToDatabase();
  const user = await UserModel.findOne({ clerkId: userId }).lean();
  if (!user) redirect("/onboarding");

  // Try to find the order by orderId. Make sure it belongs to the user.
  const order = await OrderModel.findOne({ orderId: id, buyerId: user._id }).lean();
  
  if (!order) {
    notFound();
  }

  const steps = ["PLACED", "CONFIRMED", "DISPATCHED", "DELIVERED"];
  const currentStepIndex = steps.indexOf(order.status);
  const getStepStatus = (index: number) => {
    if (order.status === "CANCELLED") return "cancelled";
    if (index < currentStepIndex) return "completed";
    if (index === currentStepIndex) return "current";
    return "pending";
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-gray-50 py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          
          <div className="mb-6 flex items-center justify-between">
            <Link href="/dashboard/orders" className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders
            </Link>
            {/* Show Invoice Download button if order is confirmed or further */}
            {(order.status === "CONFIRMED" || order.status === "DISPATCHED" || order.status === "DELIVERED") && (
              <a 
                href={`/api/orders/${order.orderId}/invoice`} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center justify-center px-4 py-2 border border-blue-600 rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" /> Download GST Invoice
              </a>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border overflow-hidden mb-8">
            <div className="px-6 py-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Order #{order.orderId}</h1>
                <p className="text-sm text-gray-500 mt-1">Placed on {new Date(order.createdAt).toLocaleString("en-IN")}</p>
              </div>
              <div className="flex gap-4">
                <div className="text-right">
                  <p className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-1">Total Amount</p>
                  <p className="text-xl font-bold text-gray-900">{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(order.totalAmount)}</p>
                </div>
              </div>
            </div>

            {/* Order Tracking UI */}
            <div className="px-6 py-8 border-b border-gray-200 bg-gray-50/50">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6">Order Status</h3>
              
              {order.status === "CANCELLED" ? (
                <div className="flex items-center gap-3 text-red-600 bg-red-50 p-4 rounded-md border border-red-100">
                  <CheckCircle className="w-6 h-6" />
                  <div>
                    <p className="font-bold">Order Cancelled</p>
                    <p className="text-sm">This order has been cancelled.</p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                    <div style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-500"></div>
                  </div>
                  <div className="flex justify-between w-full">
                    {steps.map((step, idx) => {
                      const status = getStepStatus(idx);
                      return (
                        <div key={step} className={`flex flex-col items-center flex-1 ${status === 'completed' || status === 'current' ? 'text-blue-600' : 'text-gray-400'}`}>
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 mb-2 ${status === 'completed' ? 'bg-blue-600 border-blue-600 text-white' : status === 'current' ? 'border-blue-600 bg-white' : 'border-gray-200 bg-white'}`}>
                            {idx === 0 ? <Package className="w-4 h-4" /> : idx === 1 ? <CheckCircle className="w-4 h-4" /> : idx === 2 ? <Truck className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                          </div>
                          <span className="text-xs font-bold">{step}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x border-b border-gray-200">
               <div className="p-6">
                 <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Shipping Information</h3>
                 <p className="text-sm text-gray-900 font-medium mb-1">{user.companyName}</p>
                 <p className="text-sm text-gray-600 mb-1">{order.address}</p>
                 <p className="text-sm text-gray-600">Phone: {user.phone}</p>
               </div>
               <div className="p-6">
                 <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Payment Details</h3>
                 <p className="text-sm text-gray-600 mb-1"><span className="font-medium text-gray-900">Method:</span> {order.paymentMethod}</p>
                 <p className="text-sm text-gray-600 mb-1"><span className="font-medium text-gray-900">Status:</span> {order.paymentStatus}</p>
                 {order.paymentStatus === "UNPAID" && order.status !== "CANCELLED" && (
                   <p className="text-sm text-amber-600 mt-2 font-medium bg-amber-50 p-2 rounded inline-block">Payment Pending</p>
                 )}
               </div>
            </div>

            <div className="p-6">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Order Items</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price (Excl. GST)</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {order.products.map((item, idx) => (
                       <tr key={`${item.productId}-${idx}`}>
                         <td className="px-6 py-4 whitespace-nowrap">
                           <p className="text-sm font-medium text-gray-900">{item.name}</p>
                           <p className="text-xs text-gray-500">SKU: {item.sku}</p>
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                           {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(item.price)}
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 font-medium">
                           {item.quantity}
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                           {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(item.price * item.quantity)}
                         </td>
                       </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                     <tr>
                       <td colSpan={3} className="px-6 py-3 text-right text-sm font-medium text-gray-500">Base Subtotal:</td>
                       <td className="px-6 py-3 text-right text-sm font-medium text-gray-900">{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(order.totalAmount - order.gstAmount)}</td>
                     </tr>
                     <tr>
                       <td colSpan={3} className="px-6 py-3 text-right text-sm font-medium text-gray-500">Taxes (GST):</td>
                       <td className="px-6 py-3 text-right text-sm font-medium text-gray-900">{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(order.gstAmount)}</td>
                     </tr>
                     <tr className="border-t border-gray-200 shadow-[inset_0_1px_0_0_rgba(0,0,0,0.1)]">
                       <td colSpan={3} className="px-6 py-4 text-right text-base font-bold text-gray-900 uppercase">Grand Total:</td>
                       <td className="px-6 py-4 text-right text-xl font-bold text-blue-600">{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(order.totalAmount)}</td>
                     </tr>
                  </tfoot>
                </table>
              </div>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
