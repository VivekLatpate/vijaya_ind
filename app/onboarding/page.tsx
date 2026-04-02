"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

export default function OnboardingPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    address: "",
    gstin: "",
    phone: "",
  });

  useEffect(() => {
    if (!isLoaded) return;

    // 1. Not signed in → go to sign-in
    if (!isSignedIn) {
      router.replace("/sign-in");
      return;
    }

    // 2. Admin → onboarding is not for them
    const role = user?.publicMetadata?.role as string | undefined;
    if (role === "ADMIN") {
      router.replace("/admin");
      return;
    }

    // 3. Regular user – check if they have already completed onboarding
    (async () => {
      try {
        const res = await fetch("/api/users/profile");
        if (res.ok) {
          const data = await res.json();
          const companyName: string = data?.user?.companyName ?? "";
          if (companyName.trim()) {
            // Profile already filled → skip onboarding
            router.replace("/products");
            return;
          }
        }
      } catch {
        // If the fetch fails we still show the form so the user can fill it
      }
      setChecking(false);
    })();
  }, [isLoaded, isSignedIn, user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      toast.success("Profile updated successfully!");
      router.push("/products");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Show spinner while we decide what to do
  if (!isLoaded || !isSignedIn || checking) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8 py-24">
      <div className="bg-white rounded-xl shadow-sm border p-8">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Complete Your Business Profile
        </h1>
        <p className="text-gray-500 text-center mb-8">
          Please provide your establishment details to enable B2B ordering and
          invoicing.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="companyName"
              className="block text-sm font-medium text-gray-700"
            >
              Company / Establishment Name{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              id="companyName"
              name="companyName"
              placeholder="e.g. Apex Engineering Works"
              value={formData.companyName}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="gstin"
              className="block text-sm font-medium text-gray-700"
            >
              GSTIN (Optional)
            </label>
            <input
              id="gstin"
              name="gstin"
              placeholder="e.g. 29ABCDE1234FZ5"
              value={formData.gstin}
              onChange={handleChange}
              maxLength={15}
              className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 uppercase sm:text-sm"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700"
            >
              Billing / Shipping Address{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              id="address"
              name="address"
              placeholder="Complete operational address including State & Pincode"
              value={formData.address}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700"
            >
              Contact Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="Mobile or Landline"
              value={formData.phone}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Saving Profile..." : "Save & Continue to Catalogue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
