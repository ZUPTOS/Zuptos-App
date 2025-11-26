'use client';

import { withAuth } from "@/lib/auth-guards";
import IntegrationsView from "@/views/Integrations";

function IntegrationsPage() {
  return <IntegrationsView />;
}

export default withAuth(IntegrationsPage);
