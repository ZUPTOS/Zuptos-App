'use client';

import { Suspense } from "react";
import EditarCheckoutView from "@/views/EditarCheckout";

export default function EditarCheckoutPage() {
  return (
    <Suspense fallback={null}>
      <EditarCheckoutView />
    </Suspense>
  );
}
