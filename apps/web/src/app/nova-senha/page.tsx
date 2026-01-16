import { Suspense } from "react";
import NewPasswordView from "@/modules/auth/views/NewPassword";

export default function NewPasswordPage() {
  return (
    <Suspense fallback={null}>
      <NewPasswordView />
    </Suspense>
  );
}
