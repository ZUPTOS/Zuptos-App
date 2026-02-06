"use client";

import { useParams } from "next/navigation";
import { withAuth } from "@/lib/auth-guards";
import ProductMembersPage from "@/views/members/pages/ProductMembersPage";

function ProductMembersRoute() {
  const params = useParams<{ areaId: string }>();
  const areaId = typeof params?.areaId === "string" ? params.areaId : "";
  return <ProductMembersPage areaId={areaId} />;
}

export default withAuth(ProductMembersRoute);
