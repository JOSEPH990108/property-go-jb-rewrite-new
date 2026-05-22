// src\app\admin\login\page.tsx
import { redirect } from "next/navigation";
import { getAdminSession } from "@/app/actions/admin-auth-actions";
import AdminLoginForm from "@/components/admin/AdminLoginForm";

export const metadata = {
  title: "Admin Login - PropertyGoJB",
};

export default async function AdminLoginPage() {
  // If already authenticated as admin, redirect to dashboard
  const adminUser = await getAdminSession();
  if (adminUser) {
    redirect("/admin/dashboard");
  }

  return <AdminLoginForm />;
}
