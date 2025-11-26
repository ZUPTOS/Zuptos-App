'use client';

import { withAuth } from "@/lib/auth-guards";
import Finances from "@/views/Finances";

function FinancasPage() {
  return <Finances />;
}

export default withAuth(FinancasPage);
