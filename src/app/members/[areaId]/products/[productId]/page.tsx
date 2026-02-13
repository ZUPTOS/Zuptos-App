"use client";

import { useParams } from "next/navigation";
import { withAuth } from "@/lib/auth-guards";
import ProductMemberEditPage from "@/views/members/pages/ProductMemberEditPage";

function ProductMemberEditRoute() {
  const params = useParams<{ areaId: string; productId: string }>();
  const areaId = typeof params?.areaId === "string" ? params.areaId : "";
  const productId = typeof params?.productId === "string" ? params.productId : "";
  return <ProductMemberEditPage areaId={areaId} productId={productId} />;
}

export default withAuth(ProductMemberEditRoute);

