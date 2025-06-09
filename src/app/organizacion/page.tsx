"use client";

import { AppLayout } from "@/components/layout";
import { ProtectedRoute } from "@/components/auth";
import { OrganizationContainer } from "@/components/organizacion";

export default function OrganizacionPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <OrganizationContainer />
      </AppLayout>
    </ProtectedRoute>
  );
}
