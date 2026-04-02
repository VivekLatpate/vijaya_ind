"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { toast } from "sonner";

export default function UserSync() {
  const { isSignedIn, userId } = useAuth();
  const { isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const syncedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !userId || syncedUserId.current === userId) {
      return;
    }

    const syncUser = async () => {
      try {
        const response = await fetch("/api/users/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(data?.error ?? "Failed to sync your account.");
        }

        const resData = await response.json();
        syncedUserId.current = userId;
        
        // Redirect to onboarding if profile is incomplete
        if (
          resData.user && 
          (!resData.user.companyName || !resData.user.address) && 
          pathname !== "/onboarding"
        ) {
          router.push("/onboarding");
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to sync your account.";
        toast.error(message);
      }
    };

    void syncUser();
  }, [isLoaded, isSignedIn, userId]);

  return null;
}
