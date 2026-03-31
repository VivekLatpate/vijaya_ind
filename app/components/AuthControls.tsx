"use client";

import Link from "next/link";
import {
  SignInButton,
  SignUpButton,
  UserButton,
  useAuth,
  useUser,
} from "@clerk/nextjs";

export default function AuthControls() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const role = typeof user?.publicMetadata?.role === "string" ? user.publicMetadata.role : "USER";
  const isAdmin = role === "ADMIN";

  if (!isSignedIn) {
    return (
      <div className="flex items-center gap-3">
        <SignInButton mode="modal">
          <button className="hidden md:inline-flex items-center justify-center rounded-lg border border-border px-4 py-2 text-sm font-medium text-heading hover:border-primary/30 hover:text-primary">
            Sign In
          </button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button className="hidden md:inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90">
            Sign Up
          </button>
        </SignUpButton>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/dashboard"
        className="hidden md:inline-flex items-center justify-center rounded-lg border border-border px-4 py-2 text-sm font-medium text-heading hover:border-primary/30 hover:text-primary"
      >
        Dashboard
      </Link>
      {isAdmin ? (
        <Link
          href="/admin"
          className="hidden md:inline-flex items-center justify-center rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Admin Panel
        </Link>
      ) : null}
      <UserButton />
    </div>
  );
}
