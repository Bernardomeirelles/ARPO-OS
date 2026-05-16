"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    async function check() {
      const supabase = createSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;

      const authRoutes = ["/login", "/cadastro", "/recuperar-senha", "/auth/callback"];
      const isAuthRoute = authRoutes.some((r) => pathname?.startsWith(r));

      // Not logged in
      if (!session) {
        if (!isAuthRoute) {
          router.push("/login");
          return;
        }
        setReady(true);
        return;
      }

      // Logged in — check if profile exists
      if (!isAuthRoute && pathname !== "/minha-conta") {
        const { data: user } = await supabase.auth.getUser();
        if (user?.user) {
          const { data: profile } = await supabase
            .from("user_profiles")
            .select("id")
            .eq("id", user.user.id)
            .maybeSingle();

          if (!mounted) return;

          // No profile yet → send to account setup page
          if (!profile) {
            router.push("/minha-conta");
            return;
          }
        }
      }

      if (mounted) setReady(true);
    }

    void check();
    return () => {
      mounted = false;
    };
  }, [pathname, router]);

  if (!ready) return null;

  return <>{children}</>;
}
