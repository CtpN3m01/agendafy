"use client";

import { AppLayout } from "@/components/layout";
import { ProtectedRoute } from "@/components/auth";
import { OrganizationInfo } from "@/components/organizacion";

export default function OrganizacionPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <OrganizationInfo />
      </AppLayout>
    </ProtectedRoute>
  );
}
