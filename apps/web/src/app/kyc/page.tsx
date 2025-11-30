'use client';

import { withAuth } from "@/lib/auth-guards";
import KycView from "@/views/Kyc";

function KycPage() {
  return <KycView />;
}

export default withAuth(KycPage);
