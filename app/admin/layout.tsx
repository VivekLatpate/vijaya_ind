import Link from "next/link";
import { BarChart3, Boxes, ClipboardList, FileText, LayoutGrid, Package, Users } from "lucide-react";
import { redirect } from "next/navigation";

import { syncCurrentUser } from "@/lib/users";
import { USER_ROLES } from "@/lib/constants";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/buyers", label: "Buyers", icon: Users },
  { href: "/admin/ledger", label: "Ledger", icon: ClipboardList },
  { href: "/admin/orders", label: "Orders", icon: BarChart3 },
  { href: "/admin/invoices", label: "Invoices", icon: FileText },
];

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await syncCurrentUser();

  if (!user || user.role !== USER_ROLES.ADMIN) {
    redirect("/dashboard?error=forbidden");
  }

  return (
    <div className="flex min-h-screen bg-[#f4f7fb] text-heading">
      <aside className="hidden w-72 flex-col border-r border-slate-200 bg-secondary px-6 py-8 text-white lg:flex">
        <Link href="/admin/dashboard" className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">
            Vijaya Industries
          </p>
          <h1 className="mt-3 text-2xl font-bold">Admin Control Hub</h1>
          <p className="mt-3 text-sm text-slate-300">
            Products, inventory, buyers, ledger, orders, and billing in one place.
          </p>
        </Link>

        <nav className="mt-8 grid gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
            >
              <item.icon className="h-5 w-5 text-primary" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Admin Login</p>
          <p className="mt-2 text-lg font-semibold text-white">{user.name}</p>
          <p className="mt-1 break-all text-sm text-slate-300">{user.email}</p>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                Unified Admin Panel
              </p>
              
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm">
              <span className="font-semibold text-heading">{user.email}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
