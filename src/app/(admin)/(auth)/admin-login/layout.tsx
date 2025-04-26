// src/app/(admin)/(auth)/layout.tsx
import { AdminAuthProvider } from "@context/AdminAuthContext";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}
