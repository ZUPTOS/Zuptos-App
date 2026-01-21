'use client';

import { withAuth } from "@/lib/auth-guards";
import SalesView from "@/views/Sales";

function SalesPage() {
  return <SalesView />;
}

export default withAuth(SalesPage);
