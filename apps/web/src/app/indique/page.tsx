'use client';

import { withAuth } from "@/lib/auth-guards";
import IndiqueView from "@/views/Indique";

function IndiquePage() {
  return <IndiqueView />;
}

export default withAuth(IndiquePage);
