'use client';

import { withAuth } from "@/lib/auth-guards";
import ProductsView from "@/views/Products";

function ProductsPage() {
  return <ProductsView />;
}

export default withAuth(ProductsPage);
