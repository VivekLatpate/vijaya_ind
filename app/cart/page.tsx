"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";

import { useCart } from "@/app/components/CartContext";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();

  const handleQuantityChange = (productId: string, value: string) => {
    const qty = parseInt(value, 10);
    if (!isNaN(qty)) {
      updateQuantity(productId, qty);
    }
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">Shopping Cart</h1>

          {cart.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
              <h2 className="text-xl font-medium text-gray-900 mb-4">Your cart is empty</h2>
              <p className="text-gray-500 mb-8">Browse our catalogue to add industrial products to your cart.</p>
              <Link
                href="/products"
                className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Go to Catalogue
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-4">
                {cart.map((item) => (
                  <div key={item.productId} className="bg-white rounded-xl shadow-sm border p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                      <p className="text-sm text-gray-500 font-medium mt-1">
                        {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(item.price)} each
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <label htmlFor={`qty-${item.productId}`} className="text-xs text-gray-500 mb-1">Quantity (MOQ: {item.moq})</label>
                        <input
                          id={`qty-${item.productId}`}
                          type="number"
                          min={item.moq}
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.productId, e.target.value)}
                          className="block w-24 rounded-md border-gray-300 border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                      
                      <div className="text-right min-w-[120px]">
                        <p className="font-semibold text-gray-900">
                          {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(item.price * item.quantity)}
                        </p>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-red-500 hover:text-red-700 p-2"
                        title="Remove item"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="lg:col-span-4">
                <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-24">
                  <h2 className="text-lg font-bold text-gray-900 border-b pb-4 mb-4">Order Summary</h2>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 text-sm">
                      <span>GST</span>
                      <span>Calculated at Checkout</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between font-bold text-gray-900 text-lg">
                      <span>Estimated Total</span>
                      <span>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(cartTotal)}</span>
                    </div>
                  </div>

                  <Link
                    href="/checkout"
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Proceed to Checkout
                  </Link>

                  <p className="text-xs text-gray-500 text-center mt-4">
                    Taxes and shipping calculated at checkout.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
