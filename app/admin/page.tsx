import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import AdminPanel from "@/app/admin/AdminPanel";
import Footer from "@/app/components/Footer";
import Navbar from "@/app/components/Navbar";
import { USER_ROLES } from "@/lib/constants";
import { syncCurrentUser } from "@/lib/users";

export default async function AdminPage() {
  await auth.protect();
  const user = await syncCurrentUser();

  if (!user || user.role !== USER_ROLES.ADMIN) {
    redirect("/dashboard?error=forbidden");
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-muted/60 py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:px-8">
          <section className="rounded-[32px] border border-border bg-secondary p-8 text-white shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
              Admin Panel
            </p>
            <h1 className="mt-3 text-4xl font-bold text-white">Manage platform users</h1>
            <p className="mt-4 max-w-3xl text-lg text-slate-300">
              This page is protected by Clerk auth, role verification, and admin-only APIs.
            </p>
          </section>

          <section className="grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
              <p className="text-sm text-foreground">Signed in as</p>
              <p className="mt-3 text-xl font-semibold text-heading">{user.name}</p>
            </div>
            <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
              <p className="text-sm text-foreground">Role</p>
              <p className="mt-3 text-xl font-semibold text-heading">{user.role}</p>
            </div>
            <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
              <p className="text-sm text-foreground">Email</p>
              <p className="mt-3 break-all text-xl font-semibold text-heading">
                {user.email}
              </p>
            </div>
          </section>

          <AdminPanel />
        </div>
      </main>
      <Footer />
    </>
  );
}
