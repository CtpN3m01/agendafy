// src/app/auth/register/page.tsx
"use client";

import { AuthLayout } from "@/components/layout";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  );
}
