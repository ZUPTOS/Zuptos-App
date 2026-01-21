'use client';

import { withAuth } from "@/lib/auth-guards";
import PixelsView from "@/views/Pixels";

function PixelsPage() {
  return <PixelsView />;
}

export default withAuth(PixelsPage);
