"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { useCart } from "@/app/components/CartContext";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

type BuyerProfile = {
  companyName: string;
  address: string;
  gstin: string;
  phone: string;
};

type RazorpayCheckoutResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayCheckoutResponse) => Promise<void>;
  prefill: {
    name: string;
    contact: string;
  };
  theme: {
    color: string;
  };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  
  const [profile, setProfile] = useState<BuyerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("RAZORPAY");

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/users/profile");
        const data = await res.json();
        if (data.success && data.user) {
          setProfile(data.user);
        } else {
          toast.error("Please complete your profile first.");
          router.push("/onboarding");
        }
      } catch {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    if (isSignedIn) {
      fetchProfile();
    }
  }, [isSignedIn, router]);

  if (!isLoaded || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col">
        <h2 className="text-xl font-bold mb-4">Your cart is empty</h2>
        <button onClick={() => router.push("/products")} className="text-blue-600 underline">Go Back to Products</button>
      </div>
    );
  }

  const isIntraState = profile?.gstin?.startsWith("27") || false; 
  // Assuming 27 is Maharashtra. If no GSTIN, we default to IGST (Inter-state) for safety or assume 18% IGST.

  const gstAmount = cart.reduce((total, item) => total + (item.price * item.quantity * item.gstRate) / 100, 0);
  const grandTotal = cartTotal + gstAmount;

  const handlePlaceOrder = async () => {
    try {
      if (!profile) return toast.error("Profile not found");

      const params = {
        products: cart.map(i => ({ productId: i.productId, quantity: i.quantity })),
        paymentMethod,
        paymentStatus: paymentMethod === "COD" ? "UNPAID" : "UNPAID", 
        // Note: For Razorpay, we'll create the order first then capture payment.
        address: profile.address,
        notes: "Placed via Web portal",
      };

      const isRazorpay = paymentMethod === "RAZORPAY";
      let razorpayOrderId = null;
      let razorpayKeyId = "";

      if (isRazorpay) {
        const rpRes = await fetch("/api/payments/razorpay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "create_order", amount: grandTotal }),
        });
        const rpData = await rpRes.json();
        if (!rpRes.ok) throw new Error("Failed to initialize payment gateway");
        razorpayOrderId = rpData.id;
        razorpayKeyId = rpData.keyId;
      }

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...params, razorpayOrderId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to place order.");
      }

      const orderId = data.order.orderId;
      const orderDocId = data.order._id;

      if (isRazorpay && razorpayOrderId) {
        if (!window.Razorpay) {
          throw new Error("Razorpay checkout failed to load. Refresh the page and try again.");
        }

        const options: RazorpayOptions = {
          key: razorpayKeyId,
          amount: Math.round(grandTotal * 100),
          currency: "INR",
          name: "Vijaya Industries",
          description: "B2B Order " + orderId,
          order_id: razorpayOrderId,
          handler: async function (response: RazorpayCheckoutResponse) {
            try {
              toast.info("Verifying payment...");
              const verifyRes = await fetch("/api/payments/razorpay", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  action: "verify_payment",
                  ...response,
                  orderDocId,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature
                }),
              });
              if (!verifyRes.ok) throw new Error("Payment verification failed");
              toast.success(`Order ${orderId} confirmed via Online Payment.`);
              clearCart();
              router.push("/dashboard/orders");
            } catch {
              toast.error("Payment verification failed.");
            }
          },
          prefill: {
            name: profile.companyName,
            contact: profile.phone,
          },
          theme: { color: "#0ea5e9" }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        toast.success(`Order ${orderId} placed successfully via ${paymentMethod}`);
        clearCart();
        router.push(`/dashboard/orders`);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Checkout failed";
      toast.error(message);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <Navbar />
      <main className="flex-1 bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-bold text-gray-900 border-b pb-4 mb-4">1. Shipping Details</h2>
                <div className="space-y-2">
                  <p><strong>Company:</strong> {profile?.companyName}</p>
                  <p><strong>Address:</strong> {profile?.address}</p>
                  <p><strong>GSTIN:</strong> {profile?.gstin || "N/A"}</p>
                  <p><strong>Phone:</strong> {profile?.phone}</p>
                </div>
                <div className="mt-4">
                  <button onClick={() => router.push("/onboarding")} className="text-sm text-blue-600 hover:underline">
                    Edit Details
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-bold text-gray-900 border-b pb-4 mb-4">2. Payment Method</h2>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="paymentMethod" value="RAZORPAY" checked={paymentMethod === "RAZORPAY"} onChange={(e) => setPaymentMethod(e.target.value)} />
                    <span className="font-medium text-gray-900">Online Payment (Razorpay)</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="paymentMethod" value="BANK_TRANSFER" checked={paymentMethod === "BANK_TRANSFER"} onChange={(e) => setPaymentMethod(e.target.value)} />
                    <span className="font-medium text-gray-900">Bank Transfer (NEFT/RTGS)</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="paymentMethod" value="COD" checked={paymentMethod === "COD"} onChange={(e) => setPaymentMethod(e.target.value)} />
                    <span className="font-medium text-gray-900">Cash on Delivery</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-24">
                <h2 className="text-lg font-bold text-gray-900 border-b pb-4 mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  {cart.map(item => (
                    <div key={item.productId} className="flex justify-between text-sm text-gray-600">
                      <span>{item.name} (x{item.quantity})</span>
                      <span>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  
                  <div className="border-t pt-3 flex justify-between text-gray-900 text-sm font-medium">
                    <span>Subtotal</span>
                    <span>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(cartTotal)}</span>
                  </div>

                  {isIntraState ? (
                    <>
                      <div className="flex justify-between text-gray-500 text-sm">
                        <span>CGST</span>
                        <span>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(gstAmount / 2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-500 text-sm">
                        <span>SGST</span>
                        <span>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(gstAmount / 2)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between text-gray-500 text-sm">
                      <span>IGST</span>
                      <span>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(gstAmount)}</span>
                    </div>
                  )}

                  <div className="border-t pt-3 flex justify-between font-bold text-gray-900 text-lg sm:text-2xl">
                    <span>Total</span>
                    <span>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(grandTotal)}</span>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  Confirm & Place Order
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
