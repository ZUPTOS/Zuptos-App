'use client';

import { withAuth } from "@/lib/auth-guards";
import Checkout from "@/views/Checkout";

function CheckoutPage() {
  return <Checkout />;
}

export default withAuth(CheckoutPage);
