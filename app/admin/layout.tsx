"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();


  if (isLoading) {
    return (
      <div className="py-10 flex justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="py-6 px-4">
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
        <p className="text-muted-foreground">
          Manage users, registrations, and system settings
        </p>
      </div>

      <div className="flex flex-col space-y-8">
        <Tabs
          defaultValue="dashboard"
          className="w-full"
          value={pathname.split("/").pop()}
        >
          <div className="border-b">
            <TabsList className="mb-[-1px]">
              <TabsTrigger value="dashboard" asChild>
                <Link href="/admin">Dashboard</Link>
              </TabsTrigger>
              <TabsTrigger value="users" asChild>
                <Link href="/admin/users">Users</Link>
              </TabsTrigger>
              <TabsTrigger value="registrations" asChild>
                <Link href="/admin/registrations">Registrations</Link>
              </TabsTrigger>
              <TabsTrigger value="settings" asChild>
                <Link href="/admin/settings">Settings</Link>
              </TabsTrigger>
            </TabsList>
          </div>
          <div className="pt-4">{children}</div>
        </Tabs>
      </div>
    </div>
  );
}
