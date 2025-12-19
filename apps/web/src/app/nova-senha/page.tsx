import { Suspense } from "react";
import NewPasswordView from "@/views/NewPassword";

export default function NewPasswordPage() {
  return (
    <Suspense fallback={null}>
      <NewPasswordView />
    </Suspense>
  );
}
