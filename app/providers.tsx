"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

import UserSync from "@/app/components/UserSync";
import { CartProvider } from "@/app/components/CartContext";

type ProvidersProps = {
  children: React.ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  return (
    <ClerkProvider>
      <UserSync />
      <CartProvider>
        <div className="flex min-h-screen flex-col">{children}</div>
      </CartProvider>
      <Toaster richColors position="top-right" />
    </ClerkProvider>
  );
}
