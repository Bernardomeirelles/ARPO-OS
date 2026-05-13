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
        redirectTo: `${window.location.origin}/login`
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

  return (
    <form className="space-y-4" onSubmit={handleFormSubmit}>
      {mode === "register" ? <Input placeholder="Nome completo" {...register("name" as never)} /> : null}
      <Input placeholder="E-mail" type="email" {...register("email" as never)} />
      {mode !== "reset" ? <Input placeholder="Senha" type="password" {...register("password" as never)} /> : null}

      <div className="space-y-2">
        {mode === "login" ? <Button className="w-full" disabled={isLoading || isSubmitting}>Entrar</Button> : null}
        {mode === "register" ? <Button className="w-full" disabled={isLoading || isSubmitting}>Cadastrar</Button> : null}
        {mode === "reset" ? <Button className="w-full" disabled={isLoading || isSubmitting}>Enviar link</Button> : null}
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
  );
}
