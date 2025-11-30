'use client';

import { withAuth } from "@/lib/auth-guards";
import AdminCheckout from "@/views/AdminCheckout";

function AdminCheckoutPage() {
  return <AdminCheckout />;
}

export default withAuth(AdminCheckoutPage);
