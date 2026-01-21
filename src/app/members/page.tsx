"use client";

import { withAuth } from "@/lib/auth-guards";
import MembersCollectionPage from "@/views/members/pages/MembersCollectionPage";

function MembersPage() {
  return <MembersCollectionPage />;
}

export default withAuth(MembersPage);
