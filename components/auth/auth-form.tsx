"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const loginSchema = z.object({
  email: z.string().email("Informe um e-mail válido"),
  password: z.string().min(8, "A senha precisa ter no mínimo 8 caracteres")
});

const registerSchema = loginSchema.extend({
  name: z.string().min(2, "Informe seu nome")
});

const resetSchema = z.object({
  email: z.string().email("Informe um e-mail válido")
});

type AuthMode = "login" | "register" | "reset";

type AuthFormValues = {
  email: string;
  password?: string;
  name?: string;
};

export function AuthForm({ mode }: { mode: AuthMode }) {
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const schema = mode === "register" ? registerSchema : mode === "reset" ? resetSchema : loginSchema;

  const {
    register,
    handleSubmit: rhfHandleSubmit,
    formState: { errors, isSubmitting },
    watch
  } = useForm<AuthFormValues>({
    resolver: zodResolver(schema),
    mode: "onChange"
  });

  const formValues = watch();

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // eslint-disable-next-line no-console
    console.log("Form submission started:", { mode, formValues });
    
    setMessage(null);
    setIsLoading(true);
    
    try {
      // Manual validation
      const result = await schema.parseAsync(formValues);
      // eslint-disable-next-line no-console
      console.log("Validation passed:", result);

      const supabase = createSupabaseBrowserClient();
      const nextPath = searchParams.get("next") || "/";

      // eslint-disable-next-line no-console
      console.log("Env NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20));

      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        setMessage("Configure as variáveis do Supabase para autenticação em produção.");
        setIsLoading(false);
        return;
      }

      if (mode === "login") {
        // eslint-disable-next-line no-console
        console.log("Attempting login...");
        const { error } = await supabase.auth.signInWithPassword({
          email: result.email,
          password: (result as any).password ?? ""
        });

        if (error) {
          // eslint-disable-next-line no-console
          console.error("Login error:", error);
          setMessage(error.message);
          setIsLoading(false);
          return;
        }

        router.push(nextPath);
        router.refresh();
        return;
      }

      if (mode === "register") {
        // eslint-disable-next-line no-console
        console.log("Attempting signup with:", result.email);
        const { data, error } = await supabase.auth.signUp({
          email: result.email,
          password: (result as any).password ?? "",
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              name: (result as any).name ?? ""
            }
          }
        });

        if (error) {
          // eslint-disable-next-line no-console
          console.error("Signup error:", error);
          setMessage(error.message);
          setIsLoading(false);
          return;
        }

        // eslint-disable-next-line no-console
        console.log("Signup successful!", data);
        setSubmitted(true);
        setMessage("Conta criada. Verifique seu e-mail para confirmar o cadastro.");
        setIsLoading(false);
        return;
      }

      // Reset password mode
      // eslint-disable-next-line no-console
      console.log("Attempting reset password...");
      const { error } = await supabase.auth.resetPasswordForEmail(result.email, {
        redirectTo: `${window.location.origin}/auth/callback`
      });

      if (error) {
        // eslint-disable-next-line no-console
        console.error("Reset password error:", error);
        setMessage(error.message);
        setIsLoading(false);
        return;
      }

      // eslint-disable-next-line no-console
      console.log("Reset password email sent!");
      setSubmitted(true);
      setMessage("Link de recuperação enviado para o seu e-mail.");
      setIsLoading(false);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Form submission error:", err);
      const errorMessage = (err instanceof z.ZodError) 
        ? err.errors.map(e => e.message).join(", ")
        : String((err as any)?.message ?? err);
      setMessage(errorMessage);
      setIsLoading(false);
    }
  };

  async function handleGoogleSignIn() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        scopes: "https://www.googleapis.com/auth/calendar.readonly",
        queryParams: { access_type: "offline", prompt: "consent" },
        redirectTo: `${window.location.origin}/auth/callback?next=/calendario`,
      },
    });
  }

  return (
    <div className="space-y-4">
      {mode === "login" && (
        <>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Entrar com Google
          </button>
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            <span className="text-xs text-slate-400">ou</span>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          </div>
        </>
      )}

      <form className="space-y-4" onSubmit={handleFormSubmit}>
        {mode === "register" ? <Input placeholder="Nome completo" {...register("name" as never)} /> : null}
        <Input placeholder="E-mail" type="email" {...register("email" as never)} />
        {mode !== "reset" ? <Input placeholder="Senha" type="password" {...register("password" as never)} /> : null}

        <div className="space-y-2">
          {mode === "login" ? <Button type="submit" className="w-full" disabled={isLoading || isSubmitting}>Entrar</Button> : null}
          {mode === "register" ? <Button type="submit" className="w-full" disabled={isLoading || isSubmitting}>Cadastrar</Button> : null}
          {mode === "reset" ? <Button type="submit" className="w-full" disabled={isLoading || isSubmitting}>Enviar link</Button> : null}
          {submitted && message ? <p className="text-center text-sm text-emerald-600 dark:text-emerald-400">{message}</p> : null}
          {!submitted && message ? <p className="text-center text-sm text-rose-600 dark:text-rose-400">{message}</p> : null}
        </div>

        <div className="space-y-1 text-sm text-rose-500">
          {errors.email ? <p>{errors.email.message}</p> : null}
          {errors.password ? <p>{errors.password.message}</p> : null}
          {errors.name ? <p>{errors.name.message}</p> : null}
        </div>

        {isSubmitting ? <p className="text-center text-xs text-slate-500">Validando...</p> : null}
      </form>
    </div>
  );
}
