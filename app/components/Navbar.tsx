"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

import AuthControls from "@/app/components/AuthControls";
import { useCart } from "@/app/components/CartContext";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link
            href="/"
            className="flex-shrink-0 flex items-center gap-2 group"
          >
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shadow-sm group-hover:bg-primary/90 transition-colors">
              <span className="text-white font-bold text-xl leading-none font-heading">
                V
              </span>
            </div>
            <span className="font-bold text-xl sm:text-2xl tracking-tight text-heading uppercase">
              Vijaya <span className="text-primary">Industries</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link
              href="/"
              className="text-heading hover:text-primary font-medium text-sm transition-colors"
            >
              Home
            </Link>
            <Link
              href="/products"
              className="text-heading hover:text-primary font-medium text-sm transition-colors"
            >
              Products
            </Link>
            <Link
              href="/about"
              className="text-heading hover:text-primary font-medium text-sm transition-colors"
            >
              About Us
            </Link>
            <Link
              href="/contact-us"
              className="text-heading hover:text-primary font-medium text-sm transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* CTA & Mobile toggle */}
          <div className="flex items-center gap-4">
            <Link
              href="/cart"
              className="relative p-2 text-foreground hover:bg-muted rounded-full transition-colors flex items-center justify-center"
            >
              <ShoppingCart className="w-5 h-5 text-gray-700" />
              <CartBadge />
            </Link>

            <button className="hidden xl:flex items-center justify-center bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-all shadow-sm hover:shadow active:scale-95">
              <Link href="/products">Request a Quote</Link>
            </button>
            <AuthControls />
            <button className="md:hidden p-2 text-foreground hover:bg-muted rounded-md transition-colors">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

function CartBadge() {
  const { cart } = useCart();
  const sum = cart.reduce((acc, item) => acc + item.quantity, 0);
  if (sum === 0) return null;

  return (
    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
      {cart.length}
    </span>
  );
}
