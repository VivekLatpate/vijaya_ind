"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

import UserSync from "@/app/components/UserSync";

type ProvidersProps = {
  children: React.ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  return (
    <ClerkProvider>
      <UserSync />
      <div className="flex min-h-screen flex-col">{children}</div>
      <Toaster richColors position="top-right" />
    </ClerkProvider>
  );
}
