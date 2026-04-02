import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db";
import { OrderModel } from "@/models/Order";
import { UserModel } from "@/models/User";
import Link from "next/link";
import { redirect } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export default async function BuyerOrdersPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  await connectToDatabase();
  const user = await UserModel.findOne({ clerkId: userId }).lean();
  
  if (!user) {
    redirect("/onboarding");
  }

  const orders = await OrderModel.find({ buyerId: user._id }).sort({ createdAt: -1 }).lean();

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">My Orders</h1>

          {orders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
              <h2 className="text-xl font-medium text-gray-900 mb-4">No orders found</h2>
              <p className="text-gray-500 mb-8">You haven't placed any B2B orders yet.</p>
              <Link
                href="/products"
                className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Browse Catalogue
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.orderId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        <Link href={`/dashboard/orders/${order.orderId}`}>{order.orderId}</Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString("en-IN")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.products.length} product(s)
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(order.totalAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${order.status === "DELIVERED" ? "bg-green-100 text-green-800" : 
                            order.status === "CONFIRMED" ? "bg-blue-100 text-blue-800" :
                            order.status === "CANCELLED" ? "bg-red-100 text-red-800" :
                            "bg-yellow-100 text-yellow-800"}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link href={`/dashboard/orders/${order.orderId}`} className="text-blue-600 hover:text-blue-900">
                          View details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
