"use client";

import { ThemeProvider } from "next-themes";
import dynamic from "next/dynamic";

const AuthGate = dynamic(() => import("@/components/auth/auth-gate").then((m) => m.AuthGate), { ssr: false });

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AuthGate>{children}</AuthGate>
    </ThemeProvider>
  );
}
