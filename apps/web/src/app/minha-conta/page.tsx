'use client';

import { withAuth } from "@/lib/auth-guards";
import MyAccountView from "@/views/MyAccount";

function MinhaContaPage() {
  return <MyAccountView />;
}

export default withAuth(MinhaContaPage);
