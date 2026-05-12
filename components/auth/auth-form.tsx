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
  const router = useRouter();
  const searchParams = useSearchParams();

  const schema = mode === "register" ? registerSchema : mode === "reset" ? resetSchema : loginSchema;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<AuthFormValues>({
    resolver: zodResolver(schema)
  });

  const onSubmit = handleSubmit(async (values) => {
    setMessage(null);
    const supabase = createSupabaseBrowserClient();
    const nextPath = searchParams.get("next") || "/";

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setMessage("Configure as variáveis do Supabase para autenticação em produção.");
      return;
    }

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password ?? ""
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      router.push(nextPath);
      router.refresh();
      return;
    }

    if (mode === "register") {
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password ?? "",
        options: {
          data: {
            name: values.name ?? ""
          }
        }
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      setSubmitted(true);
      setMessage("Conta criada. Verifique seu e-mail para confirmar o cadastro.");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/login`
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setSubmitted(true);
    setMessage("Link de recuperação enviado para o seu e-mail.");
  });

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      {mode === "register" ? <Input placeholder="Nome completo" {...register("name" as never)} /> : null}
      <Input placeholder="E-mail" type="email" {...register("email" as never)} />
      {mode !== "reset" ? <Input placeholder="Senha" type="password" {...register("password" as never)} /> : null}

      <div className="space-y-2">
        {mode === "login" ? <Button className="w-full">Entrar</Button> : null}
        {mode === "register" ? <Button className="w-full">Cadastrar</Button> : null}
        {mode === "reset" ? <Button className="w-full">Enviar link</Button> : null}
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
