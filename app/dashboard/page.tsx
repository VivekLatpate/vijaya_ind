import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

import Footer from "@/app/components/Footer";
import Navbar from "@/app/components/Navbar";
import { USER_ROLES } from "@/lib/constants";
import { syncCurrentUser } from "@/lib/users";

type DashboardPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

const errorMap: Record<string, string> = {
  forbidden: "Admin access is restricted to approved ADMIN accounts.",
  "role-check": "We could not verify your admin role right now. Please try again.",
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  await auth.protect();
  const user = await syncCurrentUser();
  const params = await searchParams;
  const helperMessage = params.error ? errorMap[params.error] : "";

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-muted/60 py-16">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:px-8">
          <section className="rounded-[32px] border border-border bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
              Dashboard
            </p>
            <h1 className="mt-3 text-4xl font-bold text-heading">
              Welcome back{user?.name ? `, ${user.name}` : ""}.
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-foreground">
              Your account is connected to Clerk and MongoDB. Role-based access,
              protected routes, and user syncing are now active.
            </p>
            {helperMessage ? (
              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                {helperMessage}
              </div>
            ) : null}
          </section>

          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
              <p className="text-sm text-foreground">Role</p>
              <p className="mt-3 text-2xl font-semibold text-heading">
                {user?.role ?? USER_ROLES.USER}
              </p>
            </div>
            <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
              <p className="text-sm text-foreground">Email</p>
              <p className="mt-3 break-all text-xl font-semibold text-heading">
                {user?.email ?? "No email found"}
              </p>
            </div>
            <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
              <p className="text-sm text-foreground">Member Since</p>
              <p className="mt-3 text-xl font-semibold text-heading">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "Just now"}
              </p>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <div className="rounded-3xl border border-border bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-heading">Account Details</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-muted p-4">
                  <p className="text-sm text-foreground">Phone</p>
                  <p className="mt-2 text-base font-medium text-heading">
                    {user?.phone || "Not added yet"}
                  </p>
                </div>
                <div className="rounded-2xl bg-muted p-4">
                  <p className="text-sm text-foreground">Company</p>
                  <p className="mt-2 text-base font-medium text-heading">
                    {user?.companyName || "Not added yet"}
                  </p>
                </div>
                <div className="rounded-2xl bg-muted p-4 sm:col-span-2">
                  <p className="text-sm text-foreground">Address</p>
                  <p className="mt-2 text-base font-medium text-heading">
                    {user?.address || "Not added yet"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-secondary p-8 text-white shadow-sm">
              <h2 className="text-2xl font-bold text-white">Quick Actions</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Use the protected pages to test login, role checks, and admin APIs.
              </p>
              <div className="mt-6 grid gap-3">
                <Link
                  href="/products"
                  className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-medium hover:bg-white/15"
                >
                  Browse Products
                </Link>
                {user?.role === USER_ROLES.ADMIN ? (
                  <Link
                    href="/admin"
                    className="rounded-2xl bg-primary px-4 py-3 text-sm font-medium text-white hover:bg-primary/90"
                  >
                    Open Admin Panel
                  </Link>
                ) : (
                  <div className="rounded-2xl border border-white/15 px-4 py-3 text-sm text-slate-300">
                    Admin tools unlock only for the ADMIN account.
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
