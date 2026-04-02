import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/admin(.*)",
  "/api/users(.*)",
  "/api/categories(.*)",
  "/api/products(.*)",
  "/api/inventory(.*)",
  "/api/ledger(.*)",
  "/api/orders(.*)",
  "/api/invoice(.*)",
]);

const isAdminRoute = createRouteMatcher([
  "/admin(.*)",
  "/api/categories(.*)",
  "/api/products(.*)",
  "/api/inventory(.*)",
  "/api/ledger(.*)",
  "/api/orders(.*)",
  "/api/invoice(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const pathname = req.nextUrl.pathname;

  if (req.nextUrl.pathname.startsWith("/api/internal/role")) {
    return NextResponse.next();
  }

  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  const isAdminUsersRoute =
    pathname === "/api/users" || 
    pathname.startsWith("/api/users/role") || 
    (/^\/api\/users\/[^/]+$/.test(pathname) && pathname !== "/api/users/sync" && pathname !== "/api/users/profile");

  if (isAdminRoute(req) || isAdminUsersRoute) {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    const roleResponse = await fetch(
      new URL(`/api/internal/role?clerkId=${encodeURIComponent(userId)}`, req.url),
      {
        headers: {
          "x-internal-secret": process.env.CLERK_SECRET_KEY ?? "",
        },
        cache: "no-store",
      },
    );

    if (!roleResponse.ok) {
      return NextResponse.redirect(new URL("/dashboard?error=role-check", req.url));
    }

    const data = (await roleResponse.json()) as { role?: string };
    if (data.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard?error=forbidden", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
