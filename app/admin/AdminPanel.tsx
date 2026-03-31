"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

type AppUser = {
  _id: string;
  clerkId: string;
  name: string;
  email: string;
  phone?: string;
  role: "ADMIN" | "USER";
  companyName?: string;
  address?: string;
  createdAt: string;
};

export default function AdminPanel() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/users", {
        cache: "no-store",
      });
      const data = (await response.json()) as { users?: AppUser[]; error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to load users.");
      }

      setUsers(data.users ?? []);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load users.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const changeRole = async (userId: string, role: AppUser["role"]) => {
    setBusyKey(`role-${userId}`);

    try {
      const response = await fetch("/api/users/role", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, role }),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Unable to update role.");
      }

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.clerkId === userId ? { ...user, role } : user,
        ),
      );
      toast.success("User role updated.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to update role.";
      toast.error(message);
    } finally {
      setBusyKey(null);
    }
  };

  const deleteUser = async (databaseId: string) => {
    setBusyKey(`delete-${databaseId}`);

    try {
      const response = await fetch(`/api/users/${databaseId}`, {
        method: "DELETE",
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to delete user.");
      }

      setUsers((currentUsers) =>
        currentUsers.filter((user) => user._id !== databaseId),
      );
      toast.success("User deleted.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to delete user.";
      toast.error(message);
    } finally {
      setBusyKey(null);
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-border bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-foreground">Loading users...</p>
        <div className="mt-4 space-y-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-16 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-white shadow-sm">
      <div className="border-b border-border px-6 py-5">
        <h2 className="text-2xl font-bold text-heading">Registered Users</h2>
        <p className="mt-2 text-sm text-foreground">
          Review accounts, promote one ADMIN, and remove buyer accounts when needed.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted/70">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-foreground">
                User
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-foreground">
                Contact
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-foreground">
                Role
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-foreground">
                Joined
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.2em] text-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => {
              const roleBusy = busyKey === `role-${user.clerkId}`;
              const deleteBusy = busyKey === `delete-${user._id}`;

              return (
                <tr key={user._id} className="align-top">
                  <td className="px-6 py-5">
                    <p className="font-semibold text-heading">{user.name || "Unnamed User"}</p>
                    <p className="mt-1 text-sm text-foreground">{user.email}</p>
                  </td>
                  <td className="px-6 py-5 text-sm text-foreground">
                    <p>{user.phone || "No phone"}</p>
                    <p className="mt-1">{user.companyName || "No company"}</p>
                  </td>
                  <td className="px-6 py-5">
                    <select
                      value={user.role}
                      disabled={roleBusy}
                      onChange={(event) =>
                        void changeRole(user.clerkId, event.target.value as AppUser["role"])
                      }
                      className="rounded-xl border border-border bg-white px-3 py-2 text-sm font-medium text-heading"
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td className="px-6 py-5 text-sm text-foreground">
                    {new Date(user.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button
                      type="button"
                      disabled={deleteBusy || user.role === "ADMIN"}
                      onClick={() => void deleteUser(user._id)}
                      className="rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deleteBusy ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
