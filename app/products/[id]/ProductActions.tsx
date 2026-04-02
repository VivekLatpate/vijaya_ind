"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, PackagePlus, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/app/components/CartContext";

interface ProductActionsProps {
  product: {
    id: string;
    name: string;
    brand: string;
    sku: string;
    price: number;
    gstRate: number;
    moq: number;
    stock: number;
  };
}

export default function ProductActions({ product }: ProductActionsProps) {
  const [quantity, setQuantity] = useState<number>(product.moq);
  const router = useRouter();
  const { addToCart } = useCart();

  const isOutOfStock = product.stock === 0;
  const isBelowMOQ = quantity < product.moq;
  const isAboveStock = quantity > product.stock;
  const isValid = !isOutOfStock && !isBelowMOQ && !isAboveStock;

  const handleIncrement = () => setQuantity((q) => q + 100);
  const handleDecrement = () => setQuantity((q) => Math.max(product.moq, q - 100));

  const handleAddToCart = () => {
    if (isValid) {
      addToCart({
        productId: product.id,
        name: product.name,
        sku: product.sku,
        price: product.price,
        gstRate: product.gstRate,
        quantity,
        moq: product.moq,
      });
      toast.success(`Added ${quantity} × ${product.name} to cart!`);
    }
  };

  const handlePlaceOrder = () => {
    if (isValid) {
      handleAddToCart();
      router.push("/checkout");
    }
  };

  return (
    <div className="bg-[#f8fafc] border border-border rounded-xl p-6">
      <h3 className="font-bold text-heading mb-4">Order Quantities</h3>

      <div className="flex flex-col gap-6">
        {/* Quantity Stepper */}
        <div>
          <label className="block text-sm font-semibold text-heading mb-2">Select Quantity (pc)</label>
          <div className="flex items-center gap-4">
            <div className="flex items-center border border-border rounded-lg bg-white overflow-hidden shadow-sm h-12">
              <button
                onClick={handleDecrement}
                disabled={isOutOfStock}
                className="px-4 h-full text-foreground hover:bg-slate-100 disabled:opacity-50 transition-colors border-r border-border font-bold text-lg"
              >
                -
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || product.moq)}
                disabled={isOutOfStock}
                className="w-24 text-center h-full focus:outline-none focus:ring-1 focus:ring-primary font-bold text-heading"
              />
              <button
                onClick={handleIncrement}
                disabled={isOutOfStock}
                className="px-4 h-full text-foreground hover:bg-slate-100 disabled:opacity-50 transition-colors border-l border-border font-bold text-lg"
              >
                +
              </button>
            </div>
            {isOutOfStock && (
              <span className="text-red-500 text-sm font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> Out of Stock
              </span>
            )}
          </div>

          {/* Validation Warnings */}
          <div className="mt-2 h-5">
            {!isOutOfStock && isBelowMOQ && (
              <span className="text-amber-600 text-xs font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Minimum Order Quantity is {product.moq} units.
              </span>
            )}
            {!isOutOfStock && isAboveStock && (
              <span className="text-amber-600 text-xs font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Only {product.stock} units available.
              </span>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleAddToCart}
            disabled={!isValid}
            className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-primary text-primary hover:bg-primary/5 px-6 py-3.5 rounded-lg font-bold transition-all disabled:opacity-50 disabled:border-slate-300 disabled:text-slate-400 disabled:hover:bg-white"
          >
            <ShoppingCart className="w-5 h-5" /> Add to Cart
          </button>
          <button
            onClick={handlePlaceOrder}
            disabled={!isValid}
            className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-[#0596ad] text-white px-6 py-3.5 rounded-lg font-bold shadow-sm transition-all disabled:opacity-50 disabled:hover:bg-primary active:scale-[0.98]"
          >
            <PackagePlus className="w-5 h-5" /> Place Order
          </button>
        </div>
      </div>
    </div>
  );
}
