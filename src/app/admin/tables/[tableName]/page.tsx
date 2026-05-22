"use client";

import { useParams } from "next/navigation";
import { AdminCrudPage } from "@/components/admin/AdminCrudPage";

export default function TableCrudPage() {
  const params = useParams();
  const tableName = params.tableName as string;

  return <AdminCrudPage tableName={tableName} />;
}
