import { redirect } from "next/navigation";

import { USER_ROLES } from "@/lib/constants";
import { syncCurrentUser } from "@/lib/users";

export default async function DashboardPage() {
  const user = await syncCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  if (user.role === USER_ROLES.ADMIN) {
    redirect("/admin/dashboard");
  }

  if (!user.companyName?.trim() || !user.address?.trim()) {
    redirect("/onboarding");
  }

  redirect("/dashboard/orders");
}
