"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ProfileModal } from "./profile-modal";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    async function check() {
      const supabase = createSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;

      // If no session and not on auth routes, redirect to /login
      if (!session) {
        if (!pathname?.startsWith("/login") && !pathname?.startsWith("/cadastro") && !pathname?.startsWith("/recuperar-senha")) {
          router.push("/login");
          return;
        }
        setReady(true);
        return;
      }

      // check user_profiles existence
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) {
        setReady(true);
        return;
      }

      const uid = user.user.id;
      const { data: profile } = await supabase.from("user_profiles").select("id").eq("id", uid).maybeSingle();
      if (!profile) {
        setShowProfile(true);
      }

      setReady(true);
    }

    void check();
    return () => {
      mounted = false;
    };
  }, [pathname, router]);

  if (!ready) return null;

  return (
    <>
      {children}
      <ProfileModal open={showProfile} onClose={() => setShowProfile(false)} />
    </>
  );
}
