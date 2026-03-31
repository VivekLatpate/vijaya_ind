"use client";

import { useEffect, useRef } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { toast } from "sonner";

export default function UserSync() {
  const { isSignedIn, userId } = useAuth();
  const { isLoaded } = useUser();
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

        syncedUserId.current = userId;
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
