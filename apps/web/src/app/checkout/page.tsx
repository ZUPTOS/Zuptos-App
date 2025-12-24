'use client';

import { withAuth } from "@/lib/auth-guards";
import AdminCheckout from "@/views/AdminCheckout";

function CheckoutPage() {
  return <AdminCheckout />;
}

export default withAuth(CheckoutPage);
