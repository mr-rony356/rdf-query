"use client";
import { useAuth } from "@/lib/auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, ReactNode } from "react";

type RouteAccess = {
  path: string;
  allowedRoles: string[];
};

// Define which routes require specific roles
const protectedRoutes: RouteAccess[] = [
  { path: "/admin", allowedRoles: ["admin"] },
  { path: "/dashboard", allowedRoles: ["user", "admin"] },
  { path: "/query-builder", allowedRoles: ["user", "admin"] },
  { path: "/profile", allowedRoles: ["user", "admin"] },
];

// Public routes that don't require authentication
const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/pending-approval",
];

export function RoleGuard({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    const isPublicRoute = publicRoutes.some(
      (route) => pathname === route || pathname.startsWith(route)
    );

    // If public route, allow access
    if (isPublicRoute) return;

    // If no user and not a public route, redirect to login
    if (!user) {
      router.push("/login");
      return;
    }

    // Check for pending approval
    if (user.role === "guest" && pathname !== "/pending-approval") {
      router.push("/pending-approval");
      return;
    }

    // Check if user has permission for the current route
    const currentRoute = protectedRoutes.find(
      (route) =>
        pathname === route.path || pathname.startsWith(`${route.path}/`)
    );

    if (currentRoute && !currentRoute.allowedRoles.includes(user.role)) {
      router.push("/unauthorized");
      return;
    }
  }, [user, isLoading, pathname, router]);

  // Only render children when not loading
  return <>{children}</>;
}
